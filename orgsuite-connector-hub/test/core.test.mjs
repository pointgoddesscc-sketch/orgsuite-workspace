import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createServer, IncomingMessage, request as httpRequest, ServerResponse } from 'node:http';
import { Duplex } from 'node:stream';
import { mkdir, mkdtemp, readdir, readFile, rm, stat, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApplication } from '../src/app.mjs';
import { loadConfig } from '../src/config.mjs';
import { HubError } from '../src/errors.mjs';
import { createGoogleOAuth } from '../src/oauth.mjs';
import { openStore } from '../src/store.mjs';

const ACCESS_KEY = 'local-test-access-value-'.repeat(3);
const INGEST_KEY = 'local-test-ingestion-value-'.repeat(3);
const VAULT_KEY = Buffer.alloc(32, 73);
const REPOSITORY = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const START = Date.parse('2026-10-17T12:00:00.000Z');
const INQUIRY = Object.freeze({ name: 'Workplace reviewer', email: 'reviewer@example.org', message: 'A project inquiry.', service: 'contact', id: 'IFMS-CORETEST1' });
const NO_NETWORK = { async json() { throw new Error('Unexpected external request'); }, async bytes() { throw new Error('Unexpected external request'); }, async probe() { throw new Error('Unexpected external request'); } };
let reportedInProcessTransport = false;

function environment(dataDir, extra = {}) {
  return { NODE_ENV: 'development', HUB_ORIGIN: 'http://127.0.0.1:4310', HUB_OWNER_ID: 'workplace-test-owner',
    HUB_LOGIN_SECRET: ACCESS_KEY, HUB_VAULT_KEY: VAULT_KEY.toString('base64'), HUB_DATA_DIR: dataDir,
    ORGSUITE_INQUIRY_INGEST_KEY: INGEST_KEY, ...extra };
}

function provider(overrides = {}) {
  return { id: 'github', label: 'GitHub', description: 'Selected workplace repository', configured: true,
    capabilities: ['repositories:read'], requiredEnv: ['GITHUB_TOKEN'], setupUrl: 'https://github.com/settings/tokens',
    async test() { return { identity: { login: 'workplace-owner' }, summary: { repositoryCount: 1 }, activity: [] }; }, ...overrides };
}

async function temporaryStore(t, clock = { value: START }) {
  const dataDir = await mkdtemp(path.join(tmpdir(), 'orgsuite-hub-core-'));
  let store = openStore({ dataDir, vaultKey: VAULT_KEY, now: () => clock.value });
  t.after(async () => { store?.close(); await rm(dataDir, { recursive: true, force: true }); });
  return { dataDir, get store() { return store; }, reopen() { store.close(); store = openStore({ dataDir, vaultKey: VAULT_KEY, now: () => clock.value }); return store; } };
}

async function fixture(t, overrides = {}) {
  const clock = { value: START };
  const storage = await temporaryStore(t, clock);
  let application;
  const server = createServer((req, res) => application.handler(req, res));
  let socketTransport = true;
  try {
    await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  } catch (error) {
    if (!['EPERM', 'EACCES'].includes(error.code)) throw error;
    socketTransport = false;
    if (!reportedInProcessTransport) {
      t.diagnostic('Loopback listen denied by sandbox; HTTP assertions use real IncomingMessage/ServerResponse streams in-process. CI uses loopback sockets when permitted.');
      reportedInProcessTransport = true;
    }
  }
  if (socketTransport) t.after(async () => { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); });
  const origin = socketTransport ? `http://127.0.0.1:${server.address().port}` : 'http://127.0.0.1:4310';
  const config = loadConfig(environment(storage.dataDir, { HUB_ORIGIN: origin, ...overrides.env }));
  const store = overrides.store ? overrides.store(storage.store) : storage.store;
  const applicationOptions = { config, store, http: overrides.http || NO_NETWORK, now: () => clock.value,
    registry: overrides.registry || [provider()], oauth: overrides.oauth, drive: overrides.drive };
  application = createApplication(applicationOptions);
  async function request(target, { method = 'GET', headers = {}, json, body } = {}) {
    const wire = json === undefined ? body : JSON.stringify(json);
    const requestHeaders = { ...(json === undefined ? {} : { 'Content-Type': 'application/json' }), ...headers };
    if (!socketTransport) {
      return new Promise((resolve, reject) => {
        // Exercise Node's real request/response stream behavior even in sandboxes
        // that prohibit bind(). No connector network traffic is permitted.
        const chunks = [];
        const socket = new Duplex({ read() {}, write(chunk, _encoding, done) { chunks.push(Buffer.from(chunk)); done(); } });
        socket.remoteAddress = '127.0.0.1';
        const req = new IncomingMessage(socket);
        req.method = method;
        req.url = target;
        req.httpVersion = '1.1';
        req.headers = Object.fromEntries(Object.entries(requestHeaders).map(([key, value]) => [key.toLowerCase(), value]));
        req.complete = true;
        const res = new ServerResponse(req);
        res.assignSocket(socket);
        res.once('error', reject);
        res.once('finish', () => {
          const raw = Buffer.concat(chunks).toString('utf8');
          const text = raw.slice(raw.indexOf('\r\n\r\n') + 4);
          const responseHeaders = { ...res.getHeaders() };
          if (typeof responseHeaders['set-cookie'] === 'string') responseHeaders['set-cookie'] = [responseHeaders['set-cookie']];
          let value; try { value = JSON.parse(text); } catch { /* HTML and redirects have no JSON. */ }
          socket.destroy();
          resolve({ status: res.statusCode, headers: responseHeaders, text, value });
        });
        if (wire !== undefined) req.push(Buffer.isBuffer(wire) ? wire : Buffer.from(wire));
        req.push(null);
        Promise.resolve(application.handler(req, res)).catch(reject);
      });
    }
    return new Promise((resolve, reject) => {
      const req = httpRequest(origin + target, { method, headers: requestHeaders }, res => {
        const chunks = [];
        res.on('data', chunk => chunks.push(chunk));
        res.once('end', () => {
          const text = Buffer.concat(chunks).toString('utf8');
          let value; try { value = JSON.parse(text); } catch { /* HTML and redirects have no JSON. */ }
          resolve({ status: res.statusCode, headers: res.headers, text, value });
        });
        res.once('error', reject);
      });
      req.once('error', reject);
      req.end(wire);
    });
  }
  async function login() {
    const response = await request('/api/login', { method: 'POST', headers: { Origin: origin }, json: { key: ACCESS_KEY } });
    assert.equal(response.status, 200, response.text);
    const cookie = response.headers['set-cookie'][0].split(';')[0];
    const session = await request('/api/session', { headers: { Cookie: cookie } });
    assert.equal(session.status, 200);
    const auth = { Cookie: cookie, Origin: origin, 'X-CSRF-Token': session.value.csrfToken };
    return { cookie, csrfToken: session.value.csrfToken, actor: session.value.actor, auth, response };
  }
  return { ...storage, store, clock, config, origin, request, login,
    restart() { application = createApplication(applicationOptions); } };
}

function error(response, status, code) {
  assert.equal(response.status, status, response.text);
  assert.deepEqual(response.value, { ok: false, error: code });
}

test('configuration rejects insecure origins, weak access, repository storage, and ephemeral production hosts', () => {
  const env = environment(path.join(tmpdir(), 'orgsuite-hub-config-fixture'));
  assert.equal(loadConfig(env).secureCookies, false);
  for (const invalid of [
    { HUB_ORIGIN: 'http://example.org' }, { NODE_ENV: 'production' }, { HUB_ORIGIN: 'https://example.org/path' },
    { HUB_ORIGIN: 'https://user:password@example.org' }, { HUB_ORIGIN: 'https://example.org/?q=value' },
    { HUB_LOGIN_SECRET: 'short' }, { HUB_VAULT_KEY: Buffer.alloc(16).toString('base64') },
    { HUB_DATA_DIR: REPOSITORY }, { HUB_DATA_DIR: 'relative-data' }, { VERCEL: '1' }, { AWS_LAMBDA_FUNCTION_NAME: 'fixture' },
    { HUB_GOOGLE_DRIVE_SCOPE: 'https://www.googleapis.com/auth/cloud-platform' }, { HUB_DRIVE_ROOTS: '[{"id":"../outside"}]' },
  ]) assert.throws(() => loadConfig({ ...env, ...invalid }));
  const production = loadConfig({ ...env, NODE_ENV: 'production', HUB_ORIGIN: 'https://hub.example.org', HUB_PERSISTENT_STORAGE: '1' });
  assert.equal(production.secureCookies, true);
});

test('private APIs and pages fail closed while public health discloses only service liveness', async t => {
  const hub = await fixture(t);
  for (const target of ['/api/session', '/api/connectors', '/api/audit', '/api/services', '/api/drive/roots', '/api/missing']) {
    error(await hub.request(target), 401, 'authentication_required');
    error(await hub.request(target, { headers: { Cookie: 'orgsuite_session=' + 'A'.repeat(43) } }), 401, 'authentication_required');
  }
  for (const target of ['/', '/status', '/unknown-page']) {
    const result = await hub.request(target);
    assert.equal(result.status, 303);
    assert.equal(result.headers.location, '/login');
    assert.equal(result.text, '');
  }
  const health = await hub.request('/healthz');
  assert.equal(health.status, 200);
  assert.deepEqual(health.value, { ok: true, service: 'orgsuite-connector-hub' });
  assert.equal(health.headers['cache-control'], 'no-store');
  assert.equal(health.headers['x-content-type-options'], 'nosniff');
  assert.equal(health.headers['x-frame-options'], 'DENY');
  assert.match(health.headers['content-security-policy'], /frame-ancestors 'none'/);
  assert.ok(!JSON.stringify(health).includes(ACCESS_KEY));
  assert.ok(!JSON.stringify(health).includes(INGEST_KEY));
});

test('login requires same-origin JSON and a valid access key, with bounded repeated failures', async t => {
  const hub = await fixture(t);
  error(await hub.request('/api/login', { method: 'POST', json: { key: ACCESS_KEY } }), 403, 'origin_denied');
  error(await hub.request('/api/login', { method: 'POST', headers: { Origin: 'https://unrelated.example.org' }, json: { key: ACCESS_KEY } }), 403, 'origin_denied');
  error(await hub.request('/api/login', { method: 'POST', headers: { Origin: hub.origin, 'Content-Type': 'text/plain' }, body: '{}' }), 415, 'json_required');
  error(await hub.request('/api/login', { method: 'POST', headers: { Origin: hub.origin, 'Content-Type': 'application/json' }, body: '{' }), 400, 'invalid_json');
  for (let index = 0; index < 5; index++) {
    const response = await hub.request('/api/login', { method: 'POST', headers: { Origin: hub.origin }, json: { key: 'incorrect' } });
    error(response, 401, 'invalid_access_key');
    assert.equal(response.headers['set-cookie'], undefined);
  }
  error(await hub.request('/api/login', { method: 'POST', headers: { Origin: hub.origin }, json: { key: ACCESS_KEY } }), 429, 'login_rate_limited');
  hub.clock.value += 15 * 60 * 1000;
  const session = await hub.login();
  assert.equal(session.actor, 'workplace-test-owner');
  assert.match(session.csrfToken, /^[A-Za-z0-9_-]{43}$/);
  assert.match(session.response.headers['set-cookie'][0], /; Path=\/; HttpOnly; SameSite=Lax; Max-Age=28800$/);
  assert.deepEqual(session.response.value, { ok: true });
});

test('mutations enforce both origin and CSRF and never call providers on rejection', async t => {
  let probes = 0;
  const hub = await fixture(t, { registry: [provider({ async test() { probes++; return {}; } })] });
  const session = await hub.login();
  const target = '/api/connectors/github/test';
  error(await hub.request(target, { method: 'POST', headers: { Cookie: session.cookie } }), 403, 'origin_denied');
  error(await hub.request(target, { method: 'POST', headers: { Cookie: session.cookie, Origin: hub.origin } }), 403, 'csrf_denied');
  error(await hub.request(target, { method: 'POST', headers: { ...session.auth, Origin: 'https://other.example.org' } }), 403, 'origin_denied');
  error(await hub.request(target, { method: 'POST', headers: { ...session.auth, 'X-CSRF-Token': 'incorrect' } }), 403, 'csrf_denied');
  assert.equal(probes, 0);
  assert.equal((await hub.request(target, { method: 'POST', headers: session.auth })).status, 200);
  assert.equal(probes, 1);
});

test('session expiry, successful logout, and repeated sign-in invalidate old sessions', async t => {
  const hub = await fixture(t);
  const first = await hub.login();
  const replacement = await hub.request('/api/login', { method: 'POST', headers: { Origin: hub.origin, Cookie: first.cookie }, json: { key: ACCESS_KEY } });
  assert.equal(replacement.status, 200);
  error(await hub.request('/api/session', { headers: { Cookie: first.cookie } }), 401, 'authentication_required');
  const second = await hub.login();
  const loggedOut = await hub.request('/api/logout', { method: 'POST', headers: second.auth });
  assert.equal(loggedOut.status, 200);
  assert.match(loggedOut.headers['set-cookie'][0], /Max-Age=0$/);
  error(await hub.request('/api/session', { headers: { Cookie: second.cookie } }), 401, 'authentication_required');
  const third = await hub.login();
  hub.clock.value += 8 * 60 * 60 * 1000;
  error(await hub.request('/api/session', { headers: { Cookie: third.cookie } }), 401, 'authentication_required');
});

test('configured credentials never imply Connected; a successful live probe expires after five minutes', async t => {
  let probes = 0;
  const hub = await fixture(t, { registry: [provider({ async test() { probes++; return { identity: { login: 'workplace-owner' }, activity: [{ type: 'commit', id: 'abc123' }] }; } })] });
  const session = await hub.login();
  const list = () => hub.request('/api/connectors', { headers: { Cookie: session.cookie } });
  const initial = await list();
  assert.equal(initial.value.connectors[0].state, 'Available');
  assert.equal(initial.value.connectors[0].checkedAt, null);
  assert.equal(initial.value.noSpend, true);
  assert.equal(initial.value.budgetCeilingUsd, 100);
  assert.equal(probes, 0);
  const tested = await hub.request('/api/connectors/github/test', { method: 'POST', headers: session.auth });
  assert.equal(tested.status, 200);
  assert.equal(tested.value.connector.state, 'Connected');
  assert.equal(tested.value.connector.checkedAt, new Date(START).toISOString());
  hub.clock.value += 5 * 60 * 1000;
  assert.equal((await list()).value.connectors[0].state, 'Connected');
  hub.clock.value++;
  assert.equal((await list()).value.connectors[0].state, 'Stale');
  assert.equal(probes, 1);
});

test('persisted Connected metadata cannot override removed configuration or a restarted runtime', async t => {
  const unconfigured = await fixture(t, { registry: [provider({ configured: false })] });
  unconfigured.store.setConnection('github', { state: 'Connected', checkedAt: new Date(START).toISOString(), runtimeId: 'previous-runtime' });
  const disabledSession = await unconfigured.login();
  const disabledList = await unconfigured.request('/api/connectors', { headers: { Cookie: disabledSession.cookie } });
  assert.equal(disabledList.value.connectors[0].state, 'Ready to Configure');

  const hub = await fixture(t);
  const session = await hub.login();
  const successful = await hub.request('/api/connectors/github/test', { method: 'POST', headers: session.auth });
  assert.equal(successful.value.connector.state, 'Connected');
  assert.ok(!Object.hasOwn(successful.value.connector, 'runtimeId'));
  hub.restart();
  const restarted = await hub.request('/api/connectors', { headers: { Cookie: session.cookie } });
  assert.equal(restarted.value.connectors[0].state, 'Stale');
  assert.ok(!Object.hasOwn(restarted.value.connectors[0], 'runtimeId'));
  const retested = await hub.request('/api/connectors/github/test', { method: 'POST', headers: session.auth });
  assert.equal(retested.value.connector.state, 'Connected');
});

test('unconfigured, provider-unauthorized, and failed probes cannot mark a connector Connected or log out the hub', async t => {
  let probes = 0;
  const hub = await fixture(t, { registry: [
    provider({ configured: false, async test() { probes++; return {}; } }),
    provider({ id: 'meta', async test() { throw new HubError(401, 'authorization_required'); } }),
    provider({ id: 'vercel', async test() { throw new Error('private provider failure ' + ACCESS_KEY); } }),
    provider({ id: 'google-drive' }),
    provider({ id: 'godaddy', async test() { return { verification: 'health_only', summary: { accountAccessVerified: false } }; } }),
  ] });
  const session = await hub.login();
  error(await hub.request('/api/connectors/github/test', { method: 'POST', headers: session.auth }), 503, 'configuration_required');
  assert.equal(probes, 0);
  error(await hub.request('/api/connectors/meta/test', { method: 'POST', headers: session.auth }), 401, 'authorization_required');
  assert.equal((await hub.request('/api/session', { headers: { Cookie: session.cookie } })).status, 200);
  const failed = await hub.request('/api/connectors/vercel/test', { method: 'POST', headers: session.auth });
  error(failed, 500, 'internal_error');
  assert.ok(!failed.text.includes(ACCESS_KEY));
  const healthOnly = await hub.request('/api/connectors/godaddy/test', { method: 'POST', headers: session.auth });
  assert.equal(healthOnly.value.connector.state, 'Available');
  const list = await hub.request('/api/connectors', { headers: { Cookie: session.cookie } });
  assert.deepEqual(Object.fromEntries(list.value.connectors.map(item => [item.id, item.state])), {
    github: 'Ready to Configure', meta: 'Requires Authorization', vercel: 'Error', 'google-drive': 'Requires Authorization', godaddy: 'Available',
  });
});

test('authenticated unknown routes return stable errors and never expose configured credentials', async t => {
  const githubValue = ['private', 'github', 'fixture', 'value'].join('-');
  const hub = await fixture(t, { env: { GITHUB_TOKEN: githubValue } });
  const session = await hub.login();
  error(await hub.request('/api/not-a-route', { headers: { Cookie: session.cookie } }), 404, 'route_not_found');
  error(await hub.request('/api/connectors/missing/test', { method: 'POST', headers: session.auth }), 404, 'connector_not_found');
  for (const target of ['/api/connectors', '/api/services', '/api/audit', '/api/not-a-route']) {
    const response = await hub.request(target, { headers: { Cookie: session.cookie } });
    for (const secret of [ACCESS_KEY, INGEST_KEY, VAULT_KEY.toString('base64'), githubValue]) assert.ok(!response.text.includes(secret));
  }
});

test('audit records actor, connector, action, outcome, and time without request bodies or raw failures', async t => {
  const hub = await fixture(t, { registry: [provider({ async test() { throw new HubError(401, 'authorization_required'); } })] });
  const session = await hub.login();
  await hub.request('/api/connectors/github/test', { method: 'POST', headers: session.auth });
  const audit = await hub.request('/api/audit', { headers: { Cookie: session.cookie } });
  assert.equal(audit.status, 200);
  assert.ok(audit.value.events.some(event => event.actor === session.actor && event.connector === 'hub' && event.action === 'login' && event.outcome === 'success'));
  assert.ok(audit.value.events.some(event => event.actor === session.actor && event.connector === 'github' && event.action === 'test' && event.outcome === 'failure' && event.code === 'authorization_required'));
  assert.ok(audit.value.events.every(event => event.createdAt === new Date(START).toISOString()));
  for (const secret of [ACCESS_KEY, INGEST_KEY, session.cookie, session.csrfToken]) assert.ok(!audit.text.includes(secret));
});

test('Drive first-page requests omit an empty provider page token and retain selected-folder scope', async t => {
  const requests = [];
  const hub = await fixture(t, { drive: { async list(parameters) { requests.push(parameters); return { files: [], nextPageToken: null }; } } });
  const session = await hub.login();
  const response = await hub.request('/api/drive/files?folderId=selected-root&query=proposal', { headers: { Cookie: session.cookie } });
  assert.equal(response.status, 200, response.text);
  assert.deepEqual(requests, [{ folderId: 'selected-root', query: 'proposal', pageToken: undefined }]);
  const nextPage = await hub.request('/api/drive/files?folderId=selected-root&pageToken=approved-next-page', { headers: { Cookie: session.cookie } });
  assert.equal(nextPage.status, 200);
  assert.equal(requests[1].pageToken, 'approved-next-page');
  error(await hub.request('/api/drive/files', { headers: { Cookie: session.cookie } }), 400, 'invalid_parameter');
  assert.equal(requests.length, 2);
});

test('readonly Drive configuration blocks writes before provider invocation while status declares the access mode', async t => {
  let writes = 0;
  const hub = await fixture(t, { env: { HUB_GOOGLE_DRIVE_SCOPE: 'https://www.googleapis.com/auth/drive.readonly' },
    drive: { async createFolder() { writes++; }, async upload() { writes++; } } });
  const session = await hub.login();
  const metadata = await hub.request('/api/connectors', { headers: { Cookie: session.cookie } });
  assert.equal(metadata.value.readOnlyDrive, true);
  error(await hub.request('/api/drive/folders', { method: 'POST', headers: session.auth, json: { parentId: 'selected-root', name: 'Project folder' } }), 403, 'drive_readonly');
  error(await hub.request('/api/drive/upload', { method: 'POST', headers: session.auth, json: { parentId: 'selected-root', name: 'project.txt', mimeType: 'text/plain', data: Buffer.from('Project').toString('base64') } }), 403, 'drive_readonly');
  assert.equal(writes, 0);
});

test('workplace service health requires expected endpoint behavior and becomes stale after five minutes', async t => {
  const calls = [];
  const hub = await fixture(t, { http: { async probe(url) {
    calls.push(url);
    if (url.endsWith('/api/inquiry')) return { status: 405, body: { ok: false, error: 'method_not_allowed' } };
    if (url.includes('dash.')) return { status: 503, body: {} };
    return { status: 200, body: { ok: true } };
  } } });
  const session = await hub.login();
  const before = await hub.request('/api/services', { headers: { Cookie: session.cookie } });
  assert.ok(before.value.services.every(item => item.state === 'Unknown'));
  const tested = await hub.request('/api/services/test', { method: 'POST', headers: session.auth });
  assert.equal(tested.status, 200);
  assert.equal(calls.length, 5);
  const statuses = Object.fromEntries(tested.value.services.map(item => [item.id, item.state]));
  assert.equal(statuses.inquiry, 'Reachable');
  assert.equal(statuses['cloudflare-dashboard'], 'Unavailable');
  hub.clock.value += 5 * 60 * 1000 + 1;
  const expired = await hub.request('/api/services', { headers: { Cookie: session.cookie } });
  assert.ok(expired.value.services.every(item => item.state === 'Stale'));
  assert.equal(calls.length, 5);
});

test('streamed request bodies enforce byte limits before JSON or inquiry acceptance', async t => {
  const hub = await fixture(t);
  const largeLogin = JSON.stringify({ key: 'x'.repeat(4097) });
  error(await hub.request('/api/login', { method: 'POST', headers: { Origin: hub.origin, 'Content-Type': 'application/json' }, body: largeLogin }), 413, 'body_too_large');
  const largeInquiry = JSON.stringify({ ...INQUIRY, message: 'x'.repeat(33 * 1024) });
  error(await hub.request('/api/internal/inquiries', { method: 'POST', headers: { Authorization: 'Bearer ' + INGEST_KEY, 'Content-Type': 'application/json' }, body: largeInquiry }), 413, 'body_too_large');
  assert.equal(hub.store.inquiryCount(), 0);
  const session = await hub.login();
  assert.equal((await hub.request('/api/session', { headers: { Cookie: session.cookie } })).status, 200);
});

test('vault credentials and inquiries are encrypted on disk and persist across process-store reopen', async t => {
  const fixture = await temporaryStore(t);
  const token = { accessToken: ['private', 'access', 'fixture', 'value'].join('-'), refreshToken: ['private', 'refresh', 'fixture', 'value'].join('-'), expiresAt: START + 3600_000, scope: 'selected-scope' };
  fixture.store.putSecret('google', token);
  fixture.store.acceptInquiry(INQUIRY);
  const session = fixture.store.createSession('fixture-owner');
  fixture.store.setConnection('github', { state: 'Connected', checkedAt: new Date(START).toISOString() });
  fixture.store.audit({ actor: 'fixture-owner', connector: 'github', action: 'test', outcome: 'success' });
  for (const filename of await readdir(fixture.dataDir)) {
    const contents = await readFile(path.join(fixture.dataDir, filename));
    for (const privateValue of [token.accessToken, token.refreshToken, INQUIRY.email, INQUIRY.message, session.token]) assert.ok(!contents.includes(Buffer.from(privateValue)));
  }
  assert.equal((await stat(fixture.dataDir)).mode & 0o777, 0o700);
  assert.equal((await stat(path.join(fixture.dataDir, 'hub.sqlite'))).mode & 0o777, 0o600);
  const reopened = fixture.reopen();
  assert.deepEqual(reopened.getSecret('google'), token);
  assert.equal(reopened.inquiryCount(), 1);
  assert.deepEqual(reopened.acceptInquiry(INQUIRY), { ok: true, id: INQUIRY.id });
  assert.equal(reopened.inquiryCount(), 1);
  assert.equal(reopened.session(session.token).actor, 'fixture-owner');
  assert.equal(reopened.connection('github').state, 'Connected');
  assert.equal(reopened.auditEvents()[0].outcome, 'success');
});

test('database symlinks are rejected even when their external target does not exist', async t => {
  const directory = await mkdtemp(path.join(tmpdir(), 'orgsuite-hub-symlinks-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  for (const existing of [false, true]) {
    const dataDir = path.join(directory, existing ? 'existing-link' : 'dangling-link');
    await mkdir(dataDir);
    const target = path.join(directory, existing ? 'existing-target.sqlite' : 'missing-target.sqlite');
    const original = Buffer.from('External file must remain untouched.');
    if (existing) await writeFile(target, original);
    await symlink(target, path.join(dataDir, 'hub.sqlite'));
    assert.throws(() => openStore({ dataDir, vaultKey: VAULT_KEY }), /Storage file must not be a symlink/);
    if (existing) assert.deepEqual(await readFile(target), original);
    else await assert.rejects(stat(target), { code: 'ENOENT' });
  }
});

test('OAuth authorization is official, PKCE-bound, session-bound, single-use, and cannot itself claim Connected', async t => {
  const clock = { value: START };
  const storage = await temporaryStore(t, clock);
  const config = loadConfig(environment(storage.dataDir, { GOOGLE_CLIENT_ID: 'fixture-client-id', GOOGLE_CLIENT_SECRET: ['fixture', 'client', 'secret'].join('-'), HUB_GOOGLE_ACCOUNT_EMAIL: 'owner@example.org' }));
  const oauthAccessValue = ['oauth', 'access', 'fixture', 'value'].join('-');
  const oauthRefreshValue = ['oauth', 'refresh', 'fixture', 'value'].join('-');
  const calls = [];
  let authorizationUrl;
  const http = { async json(url, options) {
    calls.push({ url, options });
    if (url === 'https://oauth2.googleapis.com/token') {
      const parameters = new URLSearchParams(options.body);
      assert.equal(parameters.get('grant_type'), 'authorization_code');
      assert.equal(parameters.get('redirect_uri'), config.origin + '/oauth/google/callback');
      assert.equal(createHash('sha256').update(parameters.get('code_verifier')).digest('base64url'), authorizationUrl.searchParams.get('code_challenge'));
      return { access_token: oauthAccessValue, refresh_token: oauthRefreshValue, expires_in: 3600, scope: config.google.driveScope };
    }
    assert.equal(url, 'https://openidconnect.googleapis.com/v1/userinfo');
    assert.equal(options.headers.Authorization, 'Bearer ' + oauthAccessValue);
    return { email: 'owner@example.org', email_verified: true };
  } };
  const oauth = createGoogleOAuth({ config, store: storage.store, http, now: () => clock.value });
  const session = storage.store.createSession('fixture-owner');
  const otherSession = storage.store.createSession('other-owner');
  authorizationUrl = new URL(oauth.begin('google-drive', session));
  assert.equal(authorizationUrl.origin, 'https://accounts.google.com');
  assert.equal(authorizationUrl.pathname, '/o/oauth2/v2/auth');
  assert.equal(authorizationUrl.searchParams.get('code_challenge_method'), 'S256');
  assert.equal(authorizationUrl.searchParams.get('scope'), 'openid email ' + config.google.driveScope);
  assert.ok(!authorizationUrl.href.includes(config.google.clientSecret));
  const parameters = new URLSearchParams({ state: authorizationUrl.searchParams.get('state'), code: 'one-use-code' });
  await assert.rejects(oauth.finish(parameters, otherSession), { status: 400, code: 'invalid_oauth_state' });
  assert.equal(calls.length, 0);
  assert.equal(await oauth.finish(parameters, session), 'google-drive');
  assert.equal(storage.store.getSecret('google').email, 'owner@example.org');
  assert.equal(storage.store.connection('google-drive'), null);
  await assert.rejects(oauth.finish(parameters, session), { status: 400, code: 'invalid_oauth_state' });
  assert.equal(calls.length, 2);
});

test('expired or deleted-session OAuth states cannot trigger a token exchange', async t => {
  const clock = { value: START };
  const storage = await temporaryStore(t, clock);
  const config = loadConfig(environment(storage.dataDir, { GOOGLE_CLIENT_ID: 'fixture-client-id', GOOGLE_CLIENT_SECRET: ['fixture', 'client', 'secret'].join('-') }));
  let calls = 0;
  const oauth = createGoogleOAuth({ config, store: storage.store, http: { async json() { calls++; throw new Error('Unexpected token exchange'); } }, now: () => clock.value });
  const session = storage.store.createSession('fixture-owner');
  const pending = new URL(oauth.begin('gmail', session));
  clock.value += 10 * 60 * 1000;
  await assert.rejects(oauth.finish(new URLSearchParams({ state: pending.searchParams.get('state'), code: 'expired' }), session), { code: 'invalid_oauth_state' });
  const next = new URL(oauth.begin('gmail', session));
  storage.store.deleteSession(session.id);
  await assert.rejects(oauth.finish(new URLSearchParams({ state: next.searchParams.get('state'), code: 'removed-session' }), session), { code: 'invalid_oauth_state' });
  assert.equal(calls, 0);
});

test('internal inquiry ingestion acknowledges durable canonical storage and retries are idempotent', async t => {
  const hub = await fixture(t);
  const options = { method: 'POST', headers: { Authorization: 'Bearer ' + INGEST_KEY }, json: INQUIRY };
  const accepted = await hub.request('/api/internal/inquiries', options);
  assert.equal(accepted.status, 200, accepted.text);
  assert.deepEqual(accepted.value, { ok: true, id: INQUIRY.id });
  assert.equal(hub.store.inquiryCount(), 1);
  const retry = await hub.request('/api/internal/inquiries', { ...options, json: { ...INQUIRY, name: '  ' + INQUIRY.name + '  ' } });
  assert.equal(retry.status, 200, retry.text);
  assert.deepEqual(retry.value, accepted.value);
  assert.equal(hub.store.inquiryCount(), 1);
  error(await hub.request('/api/internal/inquiries', { ...options, json: { ...INQUIRY, message: 'Changed inquiry content.' } }), 409, 'inquiry_id_conflict');
  assert.equal(hub.store.inquiryCount(), 1);
  const event = hub.store.auditEvents().find(item => item.action === 'accept');
  assert.equal(event.actor, 'inquiry-gateway');
  assert.equal(event.outcome, 'success');
});

test('internal ingestion rejects missing or weak authorization and validates exact payload and JSON content type', async t => {
  const hub = await fixture(t);
  const authorized = { Authorization: 'Bearer ' + INGEST_KEY };
  error(await hub.request('/api/internal/inquiries'), 405, 'method_not_allowed');
  error(await hub.request('/api/internal/inquiries', { method: 'POST', json: INQUIRY }), 401, 'ingestion_unauthorized');
  error(await hub.request('/api/internal/inquiries', { method: 'POST', headers: { Authorization: 'Bearer incorrect' }, json: INQUIRY }), 401, 'ingestion_unauthorized');
  for (const contentType of [undefined, 'text/plain']) {
    error(await hub.request('/api/internal/inquiries', { method: 'POST', headers: { ...authorized, ...(contentType ? { 'Content-Type': contentType } : {}) }, body: JSON.stringify(INQUIRY) }), 415, 'json_required');
  }
  error(await hub.request('/api/internal/inquiries', { method: 'POST', headers: { ...authorized, 'Content-Type': 'application/json' }, body: '{' }), 400, 'invalid_json');
  for (const payload of [null, [], { ...INQUIRY, extra: 'unexpected' }, { ...INQUIRY, service: 'invalid' }, { ...INQUIRY, email: 'not-an-email' }, { ...INQUIRY, id: 'unbounded-client-id' }, { ...INQUIRY, name: 'Control\u0000character' }, { ...INQUIRY, message: 'x'.repeat(8001) }]) {
    error(await hub.request('/api/internal/inquiries', { method: 'POST', headers: authorized, json: payload }), 400, 'invalid_inquiry');
  }
  assert.equal(hub.store.inquiryCount(), 0);
  const unavailable = await fixture(t, { env: { ORGSUITE_INQUIRY_INGEST_KEY: 'too-short' } });
  error(await unavailable.request('/api/internal/inquiries', { method: 'POST', headers: { Authorization: 'Bearer too-short' }, json: INQUIRY }), 503, 'ingestion_unavailable');
  assert.equal(unavailable.store.inquiryCount(), 0);
});

test('internal ingestion never acknowledges an inquiry when durable storage fails', async t => {
  const hub = await fixture(t, { store: store => ({ ...store, acceptInquiry() { throw new Error('private storage failure ' + INGEST_KEY); } }) });
  const response = await hub.request('/api/internal/inquiries', { method: 'POST', headers: { Authorization: 'Bearer ' + INGEST_KEY }, json: INQUIRY });
  error(response, 500, 'internal_error');
  assert.ok(!response.text.includes(INGEST_KEY));
  assert.equal(hub.store.inquiryCount(), 0);
});
