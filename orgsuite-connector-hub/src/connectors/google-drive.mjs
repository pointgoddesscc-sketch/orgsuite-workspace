import { randomUUID } from 'node:crypto';
import { HubError } from '../errors.mjs';

const API = 'https://www.googleapis.com/drive/v3/';
const UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3/files';
const FOLDER = 'application/vnd.google-apps.folder';
const SHORTCUT = 'application/vnd.google-apps.shortcut';
const FIELDS = 'id,name,mimeType,parents,driveId,trashed,size,modifiedTime,webViewLink,capabilities(canDownload,canAddChildren)';
const ID = /^[A-Za-z0-9_-]{1,200}$/;
const MAX_ANCESTORS = 32;
const TYPES = new Map([
  ['application/pdf', ['pdf']],
  ['text/plain', ['txt']],
  ['text/csv', ['csv']],
  ['application/json', ['json']],
  ['image/png', ['png']],
  ['image/jpeg', ['jpg', 'jpeg']],
  ['image/webp', ['webp']],
  ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', ['docx']],
  ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', ['xlsx']],
  ['application/vnd.openxmlformats-officedocument.presentationml.presentation', ['pptx']],
]);
const EXPORTS = new Map([
  ['application/vnd.google-apps.document', ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']],
  ['application/vnd.google-apps.spreadsheet', ['application/pdf', 'text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']],
  ['application/vnd.google-apps.presentation', ['application/pdf', 'application/vnd.openxmlformats-officedocument.presentationml.presentation']],
]);

function id(value) {
  if (typeof value !== 'string' || !ID.test(value)) throw new HubError(400, 'invalid_drive_id');
  return value;
}

function name(value) {
  if (typeof value !== 'string' || !value.trim() || value.length > 180 || /[\x00-\x1f\x7f/\\]/.test(value) || value === '.' || value === '..') {
    throw new HubError(400, 'invalid_file_name');
  }
  return value.trim();
}

function safeFile(file) {
  const result = { id: file.id, name: file.name, mimeType: file.mimeType };
  if (typeof file.modifiedTime === 'string') result.modifiedTime = file.modifiedTime;
  if (typeof file.size === 'string' && /^\d+$/.test(file.size)) result.size = file.size;
  if (Array.isArray(file.parents)) result.parents = file.parents.filter(parent => typeof parent === 'string' && ID.test(parent));
  if (typeof file.driveId === 'string' && ID.test(file.driveId)) result.driveId = file.driveId;
  // Construct known provider links instead of reflecting arbitrary upstream URLs.
  result.webViewLink = file.mimeType === FOLDER
    ? `https://drive.google.com/drive/folders/${encodeURIComponent(file.id)}`
    : `https://drive.google.com/file/d/${encodeURIComponent(file.id)}/view`;
  return result;
}

function checkContent(data, mimeType, filename, maxBytes) {
  if (!Buffer.isBuffer(data)) throw new HubError(400, 'invalid_file_data');
  if (data.length === 0) throw new HubError(400, 'empty_file');
  if (data.length > maxBytes) throw new HubError(413, 'file_too_large');
  const extensions = TYPES.get(mimeType);
  const extension = filename.split('.').at(-1)?.toLowerCase();
  if (!extensions?.includes(extension)) throw new HubError(415, 'unsupported_file_type');
  let valid = true;
  if (mimeType === 'application/pdf') valid = data.subarray(0, 5).equals(Buffer.from('%PDF-'));
  else if (mimeType === 'image/png') valid = data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  else if (mimeType === 'image/jpeg') valid = data.length >= 3 && data[0] === 255 && data[1] === 216 && data[2] === 255;
  else if (mimeType === 'image/webp') valid = data.subarray(0, 4).toString() === 'RIFF' && data.subarray(8, 12).toString() === 'WEBP';
  else if (mimeType.startsWith('application/vnd.openxmlformats-')) valid = data.subarray(0, 4).equals(Buffer.from([80, 75, 3, 4]));
  else {
    try {
      const text = new TextDecoder('utf-8', { fatal: true }).decode(data);
      valid = !text.includes('\0');
      if (mimeType === 'application/json') JSON.parse(text);
    } catch { valid = false; }
  }
  if (!valid) throw new HubError(415, 'file_content_mismatch');
}

/** Official Google Drive API adapter. Root configuration restricts resources; it never grants OAuth access. */
export class DriveConnector {
  constructor({ config, getAccessToken, http }) {
    this.config = config;
    this.getAccessToken = getAccessToken;
    this.http = http;
    this.maxBytes = config.maxFileBytes ?? 5 * 1024 * 1024;
    if (!Number.isSafeInteger(this.maxBytes) || this.maxBytes < 1) throw new HubError(500, 'invalid_drive_configuration');
    this.approvedRoots = (config.driveRoots ?? []).map(root => ({ id: id(root.id), ...(root.name ? { name: name(root.name) } : {}), ...(root.driveId ? { driveId: id(root.driveId) } : {}) }));
    this.sharedDriveIds = new Set(this.approvedRoots.map(root => root.driveId).filter(Boolean));
  }

  async headers() {
    const token = await this.getAccessToken();
    if (typeof token !== 'string' || !token || /[\r\n]/.test(token)) throw new HubError(401, 'google_authorization_required');
    return { Authorization: `Bearer ${token}` };
  }

  url(path, params = {}) {
    const url = new URL(path, API);
    for (const [key, value] of Object.entries(params)) if (value !== undefined && value !== '') url.searchParams.set(key, String(value));
    return url.toString();
  }

  async metadata(fileId) {
    const requestedId = id(fileId);
    const file = await this.http.json(this.url(`files/${encodeURIComponent(requestedId)}`, { fields: FIELDS, ...(this.sharedDriveIds.size ? { supportsAllDrives: true } : {}) }), { headers: await this.headers() });
    if (file?.id !== requestedId || typeof file.name !== 'string' || typeof file.mimeType !== 'string') throw new HubError(502, 'invalid_drive_response');
    if (file.trashed || file.mimeType === SHORTCUT) throw new HubError(403, 'drive_resource_not_allowed');
    if (file.driveId && !this.sharedDriveIds.has(file.driveId)) throw new HubError(403, 'drive_resource_not_allowed');
    return file;
  }

  async authorized(fileId, folder = false) {
    if (!this.approvedRoots.length) throw new HubError(503, 'drive_roots_not_configured');
    const target = await this.metadata(fileId);
    if (folder && target.mimeType !== FOLDER) throw new HubError(400, 'drive_folder_required');
    const pending = [{ file: target, path: new Set() }];
    let visited = 0;
    while (pending.length) {
      if (++visited > MAX_ANCESTORS) throw new HubError(403, 'drive_ancestry_limit');
      const { file, path } = pending.shift();
      if (path.has(file.id)) throw new HubError(403, 'drive_ancestry_cycle');
      const root = this.approvedRoots.find(item => item.id === file.id);
      if (root) {
        if (file.mimeType !== FOLDER || (root.driveId ?? undefined) !== (file.driveId ?? undefined)) throw new HubError(403, 'drive_resource_not_allowed');
        if ((target.driveId ?? undefined) !== (file.driveId ?? undefined)) throw new HubError(403, 'drive_resource_not_allowed');
        return { file: target, root };
      }
      const nextPath = new Set(path).add(file.id);
      if (!Array.isArray(file.parents) || file.parents.length > 8) throw new HubError(403, 'drive_resource_not_allowed');
      for (const parentId of file.parents) {
        if (nextPath.has(parentId)) throw new HubError(403, 'drive_ancestry_cycle');
        const parent = await this.metadata(parentId);
        if (parent.mimeType !== FOLDER) throw new HubError(403, 'drive_resource_not_allowed');
        pending.push({ file: parent, path: nextPath });
      }
    }
    throw new HubError(403, 'drive_resource_not_allowed');
  }

  async roots() {
    const result = [];
    for (const root of this.approvedRoots) {
      const { file } = await this.authorized(root.id, true);
      result.push({ id: root.id, name: root.name ?? file.name, ...(root.driveId ? { driveId: root.driveId } : {}) });
    }
    if (!result.length) throw new HubError(503, 'drive_roots_not_configured');
    return result;
  }

  async status() {
    const about = await this.http.json(this.url('about', { fields: 'user(emailAddress),storageQuota(usage,limit)' }), { headers: await this.headers() });
    const roots = await this.roots();
    if (typeof about?.user?.emailAddress !== 'string') throw new HubError(502, 'invalid_drive_response');
    return {
      identity: { email: about.user.emailAddress },
      summary: { rootCount: roots.length, access: 'Selected app-authorized resources only', ...(typeof about.storageQuota?.usage === 'string' ? { storageUsageBytes: about.storageQuota.usage } : {}), ...(typeof about.storageQuota?.limit === 'string' ? { storageLimitBytes: about.storageQuota.limit } : {}) },
      activity: [],
    };
  }

  async list({ folderId, query = '', pageToken } = {}) {
    const { root } = await this.authorized(folderId, true);
    if (typeof query !== 'string' || query.length > 200 || /[\x00-\x1f\x7f]/.test(query)) throw new HubError(400, 'invalid_drive_query');
    if (pageToken !== undefined && (typeof pageToken !== 'string' || !pageToken || pageToken.length > 4096 || /[\x00-\x1f\x7f]/.test(pageToken))) throw new HubError(400, 'invalid_page_token');
    const escaped = query.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    const q = `'${id(folderId)}' in parents and trashed = false${query ? ` and name contains '${escaped}'` : ''}`;
    const result = await this.http.json(this.url('files', {
      q, fields: `nextPageToken,files(${FIELDS})`, pageSize: 100, pageToken,
      ...(root.driveId ? { corpora: 'drive', driveId: root.driveId, includeItemsFromAllDrives: true, supportsAllDrives: true } : { corpora: 'user' }),
    }), { headers: await this.headers() });
    if (!Array.isArray(result?.files)) throw new HubError(502, 'invalid_drive_response');
    const files = result.files.filter(file => typeof file?.id === 'string' && ID.test(file.id) && typeof file.name === 'string' && typeof file.mimeType === 'string' && !file.trashed && file.mimeType !== SHORTCUT && file.parents?.includes(folderId) && (file.driveId ?? undefined) === (root.driveId ?? undefined)).map(safeFile);
    return { files, ...(typeof result.nextPageToken === 'string' && result.nextPageToken.length <= 4096 ? { nextPageToken: result.nextPageToken } : {}) };
  }

  async createFolder({ parentId, name: requestedName } = {}) {
    const folderName = name(requestedName);
    const { file: parent, root } = await this.authorized(parentId, true);
    if (parent.capabilities?.canAddChildren === false) throw new HubError(403, 'drive_write_not_allowed');
    const result = await this.http.json(this.url('files', { fields: FIELDS, ...(root.driveId ? { supportsAllDrives: true } : {}) }), {
      method: 'POST', headers: { ...await this.headers(), 'Content-Type': 'application/json' }, body: JSON.stringify({ name: folderName, mimeType: FOLDER, parents: [parentId] }),
    });
    this.validateCreated(result, parentId, FOLDER);
    return safeFile(result);
  }

  validateCreated(file, parentId, mimeType) {
    if (typeof file?.id !== 'string' || !ID.test(file.id) || typeof file.name !== 'string' || file.mimeType !== mimeType || !file.parents?.includes(parentId) || file.trashed) throw new HubError(502, 'invalid_drive_response');
  }

  async upload({ parentId, name: requestedName, mimeType, data } = {}) {
    const filename = name(requestedName);
    checkContent(data, mimeType, filename, this.maxBytes);
    const { file: parent, root } = await this.authorized(parentId, true);
    if (parent.capabilities?.canAddChildren === false) throw new HubError(403, 'drive_write_not_allowed');
    // Random multipart boundaries cannot be supplied by callers or confused with file contents.
    const boundary = `orgsuite_${randomUUID().replaceAll('-', '')}`;
    const metadata = JSON.stringify({ name: filename, mimeType, parents: [parentId] });
    const body = Buffer.concat([
      Buffer.from(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n`),
      data, Buffer.from(`\r\n--${boundary}--\r\n`),
    ]);
    const url = new URL(UPLOAD_API);
    url.searchParams.set('uploadType', 'multipart');
    url.searchParams.set('fields', FIELDS);
    if (root.driveId) url.searchParams.set('supportsAllDrives', 'true');
    const result = await this.http.json(url.toString(), { method: 'POST', headers: { ...await this.headers(), 'Content-Type': `multipart/related; boundary=${boundary}` }, body });
    this.validateCreated(result, parentId, mimeType);
    return safeFile(result);
  }

  async download({ fileId, exportMimeType } = {}) {
    const { file, root } = await this.authorized(fileId);
    if (file.capabilities?.canDownload === false) throw new HubError(403, 'drive_download_not_allowed');
    let requestedType = file.mimeType;
    let filename = name(file.name);
    let url;
    if (EXPORTS.has(file.mimeType)) {
      requestedType = exportMimeType ?? 'application/pdf';
      if (!EXPORTS.get(file.mimeType).includes(requestedType)) throw new HubError(415, 'unsupported_export_type');
      const extension = TYPES.get(requestedType)[0];
      filename = `${filename.slice(0, 170).replace(/\.(?:pdf|txt|csv|docx|xlsx|pptx)$/i, '')}.${extension}`;
      url = this.url(`files/${encodeURIComponent(file.id)}/export`, { mimeType: requestedType });
    } else {
      if (exportMimeType !== undefined || !TYPES.has(requestedType)) throw new HubError(415, 'unsupported_file_type');
      if (file.size !== undefined && (!/^\d+$/.test(String(file.size)) || Number(file.size) > this.maxBytes)) throw new HubError(413, 'file_too_large');
      url = this.url(`files/${encodeURIComponent(file.id)}`, { alt: 'media', ...(root.driveId ? { supportsAllDrives: true } : {}) });
    }
    const result = await this.http.bytes(url, { headers: await this.headers(), maxBytes: this.maxBytes });
    checkContent(result.data, requestedType, filename, this.maxBytes);
    return { data: result.data, mimeType: requestedType, name: filename };
  }
}
