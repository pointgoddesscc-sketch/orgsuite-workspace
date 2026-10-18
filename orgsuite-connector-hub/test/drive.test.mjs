import test from 'node:test';
import assert from 'node:assert/strict';
import { DriveConnector } from '../src/connectors/google-drive.mjs';

const FOLDER = 'application/vnd.google-apps.folder';
const PDF = Buffer.from('%PDF-1.7\napproved workplace document\n');
const root = { id: 'approved-root', name: 'Projects', mimeType: FOLDER, parents: [], capabilities: { canAddChildren: true } };
const pdf = { id: 'approved-file', name: 'brief.pdf', mimeType: 'application/pdf', parents: [root.id], size: String(PDF.length) };

function setup({ files = {}, roots = [{ id: root.id }], maxFileBytes = 1024, json, bytes } = {}) {
  const calls = [];
  const inventory = { [root.id]: root, [pdf.id]: pdf, ...files };
  const adapter = new DriveConnector({
    config: { driveRoots: roots, maxFileBytes },
    getAccessToken: async () => 'unit-test-bearer',
    http: {
      async json(raw, options = {}) {
        const url = new URL(raw);
        calls.push({ type: 'json', url, options });
        assert.equal(url.origin, 'https://www.googleapis.com');
        assert.equal(options.headers.Authorization, 'Bearer unit-test-bearer');
        if (json) {
          const response = await json(url, options);
          if (response !== undefined) return response;
        }
        if (url.pathname === '/drive/v3/about') return { user: { emailAddress: 'workplace@example.com' }, storageQuota: { usage: '42', limit: '1000' } };
        const match = /^\/drive\/v3\/files\/([^/]+)$/.exec(url.pathname);
        if (match && inventory[match[1]]) return structuredClone(inventory[match[1]]);
        throw new Error(`Unexpected JSON request: ${url.pathname}`);
      },
      async bytes(raw, options = {}) {
        const url = new URL(raw);
        calls.push({ type: 'bytes', url, options });
        assert.equal(url.origin, 'https://www.googleapis.com');
        assert.equal(options.headers.Authorization, 'Bearer unit-test-bearer');
        return bytes ? bytes(url, options) : { data: PDF, mimeType: 'application/pdf' };
      },
    },
  });
  return { adapter, calls };
}

const code = expected => error => error.code === expected;

test('status verifies selected roots and surfaces safe live account metadata', async () => {
  const { adapter, calls } = setup();
  const result = await adapter.status();
  assert.deepEqual(result.identity, { email: 'workplace@example.com' });
  assert.equal(result.summary.rootCount, 1);
  assert.equal(result.summary.storageUsageBytes, '42');
  assert.deepEqual(result.activity, []);
  assert.deepEqual(await adapter.roots(), [{ id: root.id, name: 'Projects' }]);
  assert.ok(calls.some(call => call.url.pathname.endsWith(root.id)));
  assert.ok(!JSON.stringify(result).includes('bearer'));
});

test('download rejects out-of-root files before requesting content', async () => {
  const { adapter, calls } = setup({ files: { outside: { ...pdf, id: 'outside', parents: ['unapproved-root'] }, 'unapproved-root': { ...root, id: 'unapproved-root' } } });
  await assert.rejects(adapter.download({ fileId: 'outside' }), code('drive_resource_not_allowed'));
  assert.equal(calls.filter(call => call.type === 'bytes').length, 0);
});

test('shortcuts, trash, and ancestry cycles cannot bypass resource roots', async () => {
  for (const file of [
    { ...pdf, id: 'rejected', mimeType: 'application/vnd.google-apps.shortcut' },
    { ...pdf, id: 'rejected', trashed: true },
    { ...root, id: 'rejected', parents: ['rejected'] },
  ]) {
    const { adapter, calls } = setup({ files: { rejected: file } });
    await assert.rejects(adapter.download({ fileId: 'rejected' }), error => ['drive_resource_not_allowed', 'drive_ancestry_cycle'].includes(error.code));
    assert.equal(calls.filter(call => call.type === 'bytes').length, 0);
  }
});

test('ancestry traversal is bounded even for an unapproved deep folder tree', async () => {
  const files = {};
  for (let index = 0; index < 40; index++) files[`depth-${index}`] = { ...root, id: `depth-${index}`, parents: index < 39 ? [`depth-${index + 1}`] : [] };
  const { adapter, calls } = setup({ files });
  await assert.rejects(adapter.download({ fileId: 'depth-0' }), code('drive_ancestry_limit'));
  assert.ok(calls.length <= 33);
});

test('shared-drive listing uses only configured drive and escaped search text', async () => {
  const query = "client' or trashed = true or name contains '\\";
  const sharedRoot = { ...root, driveId: 'shared-workplace' };
  const { adapter } = setup({
    roots: [{ id: root.id, driveId: 'shared-workplace' }],
    files: { [root.id]: sharedRoot },
    json(url) {
      if (url.pathname !== '/drive/v3/files') return;
      assert.equal(url.searchParams.get('driveId'), 'shared-workplace');
      assert.equal(url.searchParams.get('corpora'), 'drive');
      assert.equal(url.searchParams.get('includeItemsFromAllDrives'), 'true');
      assert.equal(url.searchParams.get('supportsAllDrives'), 'true');
      assert.equal(url.searchParams.get('q'), `'${root.id}' in parents and trashed = false and name contains 'client\\' or trashed = true or name contains \\'\\\\'`);
      return { files: [{ ...pdf, driveId: 'shared-workplace' }, { ...pdf, id: 'outside', parents: ['outside'] }, { ...pdf, id: 'shortcut', mimeType: 'application/vnd.google-apps.shortcut' }], nextPageToken: 'page-2' };
    },
  });
  const result = await adapter.list({ folderId: root.id, query });
  assert.deepEqual(result.files.map(file => file.id), [pdf.id]);
  assert.equal(result.nextPageToken, 'page-2');
});

test('shared drive must be explicitly configured and normal listing stays user-scoped', async () => {
  const rejected = setup({ files: { [root.id]: { ...root, driveId: 'unapproved-drive' } } });
  await assert.rejects(rejected.adapter.roots(), code('drive_resource_not_allowed'));
  const { adapter } = setup({ json(url) {
    if (url.pathname === '/drive/v3/files') {
      assert.equal(url.searchParams.get('corpora'), 'user');
      assert.equal(url.searchParams.has('driveId'), false);
      assert.equal(url.searchParams.has('includeItemsFromAllDrives'), false);
      return { files: [pdf] };
    }
  } });
  assert.equal((await adapter.list({ folderId: root.id })).files.length, 1);
});

test('project-folder creation inherits approved parent and never writes permissions', async () => {
  const { adapter, calls } = setup({ json(url, options) {
    if (options.method === 'POST') {
      assert.equal(url.pathname, '/drive/v3/files');
      assert.deepEqual(JSON.parse(options.body), { name: 'Client project', mimeType: FOLDER, parents: [root.id] });
      return { id: 'new-folder', name: 'Client project', mimeType: FOLDER, parents: [root.id] };
    }
  } });
  assert.equal((await adapter.createFolder({ parentId: root.id, name: 'Client project' })).id, 'new-folder');
  assert.equal(calls.filter(call => call.options.method === 'POST').length, 1);
  assert.ok(!calls.some(call => call.url.pathname.includes('permissions')));
});

test('multipart upload validates type, size, content, filename, and selected parent', async () => {
  const { adapter } = setup({ json(url, options) {
    if (options.method === 'POST') {
      assert.equal(url.pathname, '/upload/drive/v3/files');
      assert.equal(url.searchParams.get('uploadType'), 'multipart');
      assert.ok(options.headers['Content-Type'].startsWith('multipart/related; boundary=orgsuite_'));
      assert.ok(Buffer.isBuffer(options.body));
      assert.ok(options.body.includes(PDF));
      assert.ok(options.body.toString().includes(`"parents":["${root.id}"]`));
      return { ...pdf, id: 'uploaded' };
    }
  } });
  assert.equal((await adapter.upload({ parentId: root.id, name: pdf.name, mimeType: pdf.mimeType, data: PDF })).id, 'uploaded');
  const bad = setup({ maxFileBytes: 10 });
  await assert.rejects(bad.adapter.upload({ parentId: root.id, name: pdf.name, mimeType: pdf.mimeType, data: PDF }), code('file_too_large'));
  await assert.rejects(bad.adapter.upload({ parentId: root.id, name: 'image.svg', mimeType: 'image/svg+xml', data: Buffer.from('<svg/>') }), code('unsupported_file_type'));
  await assert.rejects(bad.adapter.upload({ parentId: root.id, name: 'fake.pdf', mimeType: 'application/pdf', data: Buffer.from('not pdf') }), code('file_content_mismatch'));
  await assert.rejects(bad.adapter.upload({ parentId: root.id, name: '../file.txt', mimeType: 'text/plain', data: Buffer.from('safe') }), code('invalid_file_name'));
  assert.equal(bad.calls.length, 0);
});

test('writes are denied for approved folders without add-children capability', async () => {
  const { adapter, calls } = setup({ files: { [root.id]: { ...root, capabilities: { canAddChildren: false } } } });
  await assert.rejects(adapter.createFolder({ parentId: root.id, name: 'Cannot write' }), code('drive_write_not_allowed'));
  await assert.rejects(adapter.upload({ parentId: root.id, name: pdf.name, mimeType: pdf.mimeType, data: PDF }), code('drive_write_not_allowed'));
  assert.ok(!calls.some(call => call.options.method === 'POST'));
});

test('binary download verifies ancestry, MIME, and bounds', async () => {
  const { adapter, calls } = setup();
  assert.deepEqual(await adapter.download({ fileId: pdf.id }), { data: PDF, mimeType: 'application/pdf', name: pdf.name });
  const content = calls.find(call => call.type === 'bytes');
  assert.equal(content.url.searchParams.get('alt'), 'media');
  assert.equal(content.options.maxBytes, 1024);
  const oversized = setup({ maxFileBytes: 10 });
  await assert.rejects(oversized.adapter.download({ fileId: pdf.id }), code('file_too_large'));
  assert.ok(!oversized.calls.some(call => call.type === 'bytes'));
  const spoofed = setup({ bytes: () => ({ data: Buffer.from('<script>alert(1)</script>'), mimeType: 'application/pdf' }) });
  await assert.rejects(spoofed.adapter.download({ fileId: pdf.id }), code('file_content_mismatch'));
});

test('native Google documents use explicit supported export mapping', async () => {
  const native = { ...pdf, id: 'native-doc', name: 'Project proposal', mimeType: 'application/vnd.google-apps.document', size: undefined };
  const { adapter, calls } = setup({ files: { [native.id]: native } });
  const result = await adapter.download({ fileId: native.id });
  assert.equal(result.name, 'Project proposal.pdf');
  assert.equal(result.mimeType, 'application/pdf');
  const request = calls.find(call => call.type === 'bytes');
  assert.equal(request.url.pathname, '/drive/v3/files/native-doc/export');
  assert.equal(request.url.searchParams.get('mimeType'), 'application/pdf');
  await assert.rejects(adapter.download({ fileId: native.id, exportMimeType: 'text/html' }), code('unsupported_export_type'));
});

test('invalid IDs and missing roots cannot authorize provider content access', async () => {
  const { adapter, calls } = setup();
  await assert.rejects(adapter.download({ fileId: '../outside?alt=media' }), code('invalid_drive_id'));
  await assert.rejects(adapter.list({ folderId: root.id, query: 'invalid\nquery' }), code('invalid_drive_query'));
  assert.ok(!calls.some(call => call.type === 'bytes'));
  const unconfigured = setup({ roots: [] });
  await assert.rejects(unconfigured.adapter.download({ fileId: pdf.id }), code('drive_roots_not_configured'));
  assert.equal(unconfigured.calls.length, 0);
});
