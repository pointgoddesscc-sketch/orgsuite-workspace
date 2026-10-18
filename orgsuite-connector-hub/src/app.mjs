import { timingSafeEqual, createHash, randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { HubError, publicError } from './errors.mjs';
import { createHttp } from './http.mjs';
import { createGoogleOAuth } from './oauth.mjs';
import { DriveConnector } from './connectors/google-drive.mjs';
import { createRegistry } from './connectors/registry.mjs';

const require = createRequire(import.meta.url);
const { validateInquiry, readJsonBody } = require('../../psemanagement-services/server/inquiry.cjs');
const PUBLIC = new URL('../public/', import.meta.url);
const FRESH_MS = 5 * 60 * 1000;
const SERVICES = [
  { id: 'core', label: 'OrgSuite core', url: 'https://pse-sent.com' },
  { id: 'inquiry', label: 'PSE inquiry API', url: 'https://psemanagement.services/api/inquiry' },
  { id: 'cloudflare-dashboard', label: 'Cloudflare dashboard', url: 'https://dash.pse-sent.com/status' },
  { id: 'cloudflare-edge', label: 'Cloudflare edge', url: 'https://host.pse-sent.com/status' },
  { id: 'godaddy', label: 'GoDaddy health', url: 'https://orgsuite-godaddy-health.vercel.app/api/godaddy/health' }
];

export function equalSecret(a, b) {
  const hash = value => createHash('sha256').update(String(value)).digest();
  return timingSafeEqual(hash(a), hash(b));
}

function headers(res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'; object-src 'none'");
}

function json(res, status, value) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(value));
}

function redirect(res, url) {
  res.statusCode = 303;
  res.setHeader('Location', url);
  res.end();
}

function cookie(req) {
  const item = (req.headers.cookie || '').split(';').map(v => v.trim()).find(v => v.startsWith('orgsuite_session='));
  const value = item ? item.slice('orgsuite_session='.length) : '';
  return /^[A-Za-z0-9_-]{43}$/.test(value) ? value : '';
}

async function body(req, maximum = 32 * 1024) {
  const length = req.headers['content-length'];
  if (length && (!/^\d+$/.test(length) || Number(length) > maximum)) throw new HubError(413, 'body_too_large');
  const bytes = await new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0, settled = false;
    const fail = error => {
      if (settled) return;
      settled = true;
      chunks.length = 0;
      reject(error);
    };
    req.on('data', chunk => {
      if (settled) return; // Keep draining without retaining an oversized body.
      const part = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      size += part.length;
      if (size > maximum) return fail(new HubError(413, 'body_too_large'));
      chunks.push(part);
    });
    req.once('end', () => {
      if (!settled) { settled = true; resolve(Buffer.concat(chunks)); }
    });
    req.once('error', () => fail(new HubError(400, 'invalid_body')));
    req.once('aborted', () => fail(new HubError(400, 'invalid_body')));
  });
  try { return new TextDecoder('utf-8', { fatal: true }).decode(bytes); }
  catch { throw new HubError(400, 'invalid_body'); }
}

async function jsonBody(req, maximum) {
  if (!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type'] || '')) throw new HubError(415, 'json_required');
  try { return JSON.parse(await body(req, maximum)); }
  catch (error) { if (error instanceof HubError) throw error; throw new HubError(400, 'invalid_json'); }
}

function limitedText(value, maximum = 200) {
  if (typeof value !== 'string' || !value || value.length > maximum) throw new HubError(400, 'invalid_parameter');
  return value;
}

export function createApplication({ config, store, http = createHttp(), now = () => Date.now(), registry: registryOverride, oauth: oauthOverride, drive: driveOverride }) {
  const oauth = oauthOverride || createGoogleOAuth({ config, store, http, now });
  const drive = driveOverride || new DriveConnector({ config, getAccessToken: () => oauth.getAccessToken(), http });
  const registry = registryOverride || createRegistry({ config, getGoogleAccessToken: () => oauth.getAccessToken(), http, drive });
  const connectors = new Map(registry.map(item => [item.id, item]));
  const loginAttempts = new Map();
  const runtimeId = randomUUID();
  const cookieAttributes = '; Path=/; HttpOnly; SameSite=Lax' + (config.secureCookies ? '; Secure' : '');
  function audit(actor, connector, action, outcome, code = '') { store.audit({ actor, connector, action, outcome, code }); }
  function sameOrigin(req) { if (req.headers.origin !== config.origin) throw new HubError(403, 'origin_denied'); }
  function requireSession(req) {
    const session = store.session(cookie(req));
    if (!session) throw new HubError(401, 'authentication_required');
    return session;
  }
  function mutation(req, session) {
    sameOrigin(req);
    if (!equalSecret(req.headers['x-csrf-token'] || '', session.csrfToken)) throw new HubError(403, 'csrf_denied');
  }
  function view(item) {
    const previous = store.connection(item.id);
    let state = item.configured ? previous?.state || 'Available' : 'Ready to Configure';
    if (['google-drive', 'gmail'].includes(item.id) && item.configured && !store.getSecret('google')) state = 'Requires Authorization';
    if (['Connected', 'Available'].includes(state) && previous?.checkedAt &&
        (!Number.isFinite(Date.parse(previous.checkedAt)) || now() - Date.parse(previous.checkedAt) > FRESH_MS ||
          (state === 'Connected' && previous.runtimeId !== runtimeId))) state = 'Stale';
    const { runtimeId: _privateRuntimeId, ...publicPrevious } = previous || {};
    return { id: item.id, label: item.label, description: item.description, capabilities: item.capabilities,
      requiredEnv: item.requiredEnv || [], setupUrl: item.setupUrl || null,
      ...publicPrevious, state, checkedAt: previous?.checkedAt || null };
  }
  async function testConnector(item, actor) {
    try {
      if (!item.configured) throw new HubError(503, 'configuration_required');
      audit(actor, item.id, 'test', 'attempt');
      const result = await item.test();
      const state = item.id === 'godaddy' || result.verification === 'health_only' ? 'Available' : 'Connected';
      store.setConnection(item.id, { ...result, state, runtimeId, checkedAt: new Date(now()).toISOString(),
        detail: state === 'Available' ? 'Health only; account access is not verified.' : 'Live API probe succeeded.' });
      audit(actor, item.id, 'test', 'success');
      return view(item);
    } catch (error) {
      const failure = publicError(error);
      const state = failure.code === 'configuration_required' || failure.code === 'configuration_invalid' ? 'Ready to Configure' :
        [401, 403].includes(failure.status) ? 'Requires Authorization' : 'Error';
      store.setConnection(item.id, { state, checkedAt: new Date(now()).toISOString(), detail: failure.code });
      audit(actor, item.id, 'test', 'failure', failure.code);
      throw error;
    }
  }
  function serviceViews() {
    return SERVICES.map(service => {
      const saved = store.connection('service:' + service.id);
      return { ...service, ...(saved || {}), state: saved?.checkedAt && now() - Date.parse(saved.checkedAt) > FRESH_MS ? 'Stale' : saved?.state || 'Unknown' };
    });
  }
  async function testServices(actor) {
    await Promise.all(SERVICES.map(async service => {
      try {
        const result = await http.probe(service.url);
        const expected = service.id === 'inquiry'
          ? result.status === 405 && result.body?.ok === false && result.body?.error === 'method_not_allowed'
          : result.status >= 200 && result.status < 300;
        store.setConnection('service:' + service.id, { checkedAt: new Date(now()).toISOString(), state: expected ? 'Reachable' : 'Unavailable', status: result.status });
        audit(actor, service.id, 'health_test', expected ? 'success' : 'failure', expected ? '' : 'unexpected_health_response');
      } catch {
        store.setConnection('service:' + service.id, { checkedAt: new Date(now()).toISOString(), state: 'Unavailable', detail: 'probe_unavailable' });
        audit(actor, service.id, 'health_test', 'failure', 'probe_unavailable');
      }
    }));
    return serviceViews();
  }
  async function staticFile(res, name, mimeType) {
    const data = await readFile(new URL(name, PUBLIC));
    res.setHeader('Content-Type', mimeType);
    res.end(data);
  }
  async function handler(req, res) {
    headers(res);
    let session;
    try {
      const url = new URL(req.url, config.origin);
      if (url.origin !== config.origin) throw new HubError(400, 'invalid_request_target');
      if (req.method === 'GET' && url.pathname === '/healthz') return json(res, 200, { ok: true, service: 'orgsuite-connector-hub' });
      if (req.method === 'GET' && url.pathname === '/styles.css') return staticFile(res, 'styles.css', 'text/css; charset=utf-8');
      if (req.method === 'GET' && url.pathname === '/app.js') return staticFile(res, 'app.js', 'text/javascript; charset=utf-8');
      if (req.method === 'GET' && url.pathname === '/login') {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.end('<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sign in · OrgSuite</title><link rel="stylesheet" href="/styles.css"><main class="login"><h1>OrgSuite</h1><p>Internal Connector Hub</p><form method="post" action="/api/login"><label for="key">Workplace access key</label><input id="key" name="key" type="password" required autocomplete="current-password"><button type="submit">Sign in</button></form><p>Use the access key configured by your workplace administrator.</p></main></html>');
      }
      if (req.method === 'POST' && url.pathname === '/api/login') {
        sameOrigin(req);
        const address = req.socket.remoteAddress || 'unknown';
        const attempt = loginAttempts.get(address);
        if (attempt && attempt.expires > now() && attempt.count >= 5) throw new HubError(429, 'login_rate_limited');
        if (loginAttempts.size > 1000) for (const [id, entry] of loginAttempts) if (entry.expires <= now()) loginAttempts.delete(id);
        const form = /^application\/x-www-form-urlencoded/i.test(req.headers['content-type'] || '');
        const payload = form ? Object.fromEntries(new URLSearchParams(await body(req, 4096))) : await jsonBody(req, 4096);
        if (typeof payload?.key !== 'string' || !equalSecret(payload.key, config.loginSecret)) {
          const next = attempt && attempt.expires > now() ? attempt : { count: 0, expires: now() + 15 * 60 * 1000 };
          next.count++; loginAttempts.set(address, next);
          audit('unauthenticated', 'hub', 'login', 'failure', 'invalid_access_key');
          throw new HubError(401, 'invalid_access_key');
        }
        loginAttempts.delete(address);
        const previous = store.session(cookie(req));
        if (previous) store.deleteSession(previous.id);
        const created = store.createSession(config.ownerId);
        res.setHeader('Set-Cookie', 'orgsuite_session=' + created.token + cookieAttributes + '; Max-Age=28800');
        audit(created.actor, 'hub', 'login', 'success');
        return form ? redirect(res, '/') : json(res, 200, { ok: true });
      }
      if (url.pathname === '/api/internal/inquiries') {
        if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); throw new HubError(405, 'method_not_allowed'); }
        if (config.inquiryIngestKey.length < 32 || /\s/.test(config.inquiryIngestKey)) throw new HubError(503, 'ingestion_unavailable');
        const expected = 'Bearer ' + config.inquiryIngestKey;
        if (!equalSecret(req.headers.authorization || '', expected)) throw new HubError(401, 'ingestion_unauthorized');
        if (!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type'] || '')) throw new HubError(415, 'json_required');
        const record = validateInquiry(await readJsonBody(req));
        const receipt = store.acceptInquiry(record);
        audit('inquiry-gateway', 'inquiry', 'accept', 'success');
        return json(res, 200, receipt);
      }
      if (!url.pathname.startsWith('/api/') && url.pathname !== '/oauth/google/callback') {
        if (!store.session(cookie(req))) return redirect(res, '/login');
      }
      session = requireSession(req);
      if (req.method === 'GET' && url.pathname === '/') return staticFile(res, 'index.html', 'text/html; charset=utf-8');
      if (req.method === 'GET' && url.pathname === '/status') return staticFile(res, 'status.html', 'text/html; charset=utf-8');
      if (req.method === 'GET' && url.pathname === '/api/session') return json(res, 200, { actor: session.actor, csrfToken: session.csrfToken });
      if (req.method === 'GET' && url.pathname === '/api/connectors') return json(res, 200, { connectors: registry.map(view), noSpend: true, budgetCeilingUsd: 100, readOnlyDrive: config.google.driveScope === 'https://www.googleapis.com/auth/drive.readonly' });
      if (req.method === 'GET' && url.pathname === '/api/audit') return json(res, 200, { events: store.auditEvents() });
      if (req.method === 'GET' && url.pathname === '/api/services') return json(res, 200, { services: serviceViews() });
      if (req.method === 'GET' && url.pathname === '/oauth/google/callback') {
        try {
          const connectorId = await oauth.finish(url.searchParams, session);
          audit(session.actor, connectorId, 'oauth_complete', 'success');
          await testConnector(connectors.get(connectorId), session.actor);
          return redirect(res, '/?connected=google');
        } catch (error) {
          audit(session.actor, 'google', 'oauth_complete', 'failure', publicError(error).code);
          return redirect(res, '/?error=authorization_failed');
        }
      }
      if (req.method !== 'GET') mutation(req, session);
      if (req.method === 'POST' && url.pathname === '/api/logout') {
        store.deleteSession(session.id);
        res.setHeader('Set-Cookie', 'orgsuite_session=' + cookieAttributes + '; Max-Age=0');
        audit(session.actor, 'hub', 'logout', 'success');
        return json(res, 200, { ok: true });
      }
      const action = url.pathname.match(/^\/api\/connectors\/([a-z-]+)\/(test|connect|disconnect)$/);
      if (req.method === 'POST' && action) {
        const item = connectors.get(action[1]);
        if (!item) throw new HubError(404, 'connector_not_found');
        if (action[2] === 'test') return json(res, 200, { connector: await testConnector(item, session.actor) });
        if (action[2] === 'connect') {
          if (['google-drive', 'gmail'].includes(item.id)) {
            const target = oauth.begin(item.id, session);
            audit(session.actor, item.id, 'connect_opened', 'pending');
            return json(res, 200, { url: target, kind: 'oauth' });
          }
          if (!item.setupUrl) throw new HubError(409, 'external_setup_required');
          audit(session.actor, item.id, 'connect_opened', 'pending');
          return json(res, 200, { url: item.setupUrl, kind: 'external-setup', requiredEnv: item.requiredEnv || [] });
        }
        if (!['google-drive', 'gmail'].includes(item.id)) throw new HubError(409, 'disconnect_via_provider');
        audit(session.actor, 'google', 'disconnect', 'attempt');
        try { await oauth.disconnect(); }
        catch (error) { audit(session.actor, 'google', 'disconnect', 'failure', publicError(error).code); throw error; }
        audit(session.actor, 'google', 'disconnect', 'success');
        return json(res, 200, { ok: true });
      }
      if (req.method === 'POST' && url.pathname === '/api/services/test') return json(res, 200, { services: await testServices(session.actor) });
      if (req.method === 'GET' && url.pathname === '/api/drive/roots') return json(res, 200, { folders: await drive.roots() });
      if (req.method === 'GET' && url.pathname === '/api/drive/files') return json(res, 200, await drive.list({ folderId: limitedText(url.searchParams.get('folderId')), query: url.searchParams.get('query') || '', pageToken: url.searchParams.get('pageToken') || undefined }));
      if (req.method === 'GET' && url.pathname === '/api/drive/download') {
        const result = await drive.download({ fileId: limitedText(url.searchParams.get('fileId')), exportMimeType: url.searchParams.get('exportMimeType') || undefined });
        audit(session.actor, 'google-drive', 'download', 'success');
        res.setHeader('Content-Type', result.mimeType);
        res.setHeader('Content-Disposition', "attachment; filename*=UTF-8''" + encodeURIComponent(result.name));
        res.end(result.data); return;
      }
      if (req.method === 'POST' && url.pathname === '/api/drive/folders') {
        if (config.google.driveScope === 'https://www.googleapis.com/auth/drive.readonly') throw new HubError(403, 'drive_readonly');
        const value = await jsonBody(req, 4096);
        audit(session.actor, 'google-drive', 'create_folder', 'attempt');
        const folder = await drive.createFolder({ parentId: limitedText(value.parentId), name: limitedText(value.name) });
        audit(session.actor, 'google-drive', 'create_folder', 'success');
        return json(res, 201, { folder });
      }
      if (req.method === 'POST' && url.pathname === '/api/drive/upload') {
        if (config.google.driveScope === 'https://www.googleapis.com/auth/drive.readonly') throw new HubError(403, 'drive_readonly');
        const value = await jsonBody(req, 8 * 1024 * 1024);
        if (typeof value.data !== 'string' || value.data.length % 4 || !/^[A-Za-z0-9+/]*={0,2}$/.test(value.data)) throw new HubError(400, 'invalid_upload_encoding');
        const data = Buffer.from(value.data, 'base64');
        if (data.length > config.maxFileBytes || data.toString('base64') !== value.data) throw new HubError(413, 'invalid_upload_size');
        audit(session.actor, 'google-drive', 'upload', 'attempt');
        const file = await drive.upload({ parentId: limitedText(value.parentId), name: limitedText(value.name), mimeType: limitedText(value.mimeType), data });
        audit(session.actor, 'google-drive', 'upload', 'success');
        return json(res, 201, { file });
      }
      throw new HubError(404, 'route_not_found');
    } catch (error) {
      const failure = error?.name === 'InquiryError' ? { status: error.status, code: error.code } : publicError(error);
      if (session) audit(session.actor, 'hub', 'request', 'failure', failure.code);
      if (!res.headersSent) return json(res, failure.status, { ok: false, error: failure.code });
      res.end();
    }
  }
  return { handler, oauth, drive, registry };
}
