import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { createRegistry } from '../src/connectors/registry.mjs';
import { HubError } from '../src/errors.mjs';

const fixtureCredential = 'provider-fixture-value';
const zoneId = 'a'.repeat(32);

function configuration() {
  return {
    google: { clientId: 'fixture-client', clientSecret: fixtureCredential },
    github: { token: fixtureCredential, repositories: ['pointgoddesscc-sketch/orgsuite-workspace'] },
    meta: { token: fixtureCredential, appId: '123456789', appSecret: 'fixture-app-value', adAccountId: '123456', version: 'v23.0' },
    vercel: { token: fixtureCredential, teamId: 'team_fixture', projectIds: ['prj_fixture'] },
    cloudflare: { token: fixtureCredential, zoneIds: [zoneId] },
  };
}

function setup(config = configuration(), response = () => ({}), probe = async () => ({ status: 503, body: { ok: false } })) {
  const calls = [];
  const driveResult = { identity: { email: 'owner@example.org' }, summary: { roots: [] }, activity: [] };
  const registry = createRegistry({
    config,
    getGoogleAccessToken: async () => fixtureCredential,
    http: {
      async json(url, options) { calls.push({ url, options }); return response(new URL(url), options); },
      async probe(url) { calls.push({ url, options: { method: 'GET' } }); return probe(url); },
    },
    drive: { async status() { return driveResult; } },
  });
  return { registry, calls, driveResult, provider: (id) => registry.find((provider) => provider.id === id) };
}

test('registry has explicit providers, setup readiness, and no credential metadata', () => {
  const { registry } = setup();
  assert.deepEqual(registry.map(({ id }) => id), ['google-drive', 'gmail', 'github', 'meta', 'vercel', 'cloudflare', 'godaddy']);
  assert.ok(registry.every(({ configured }) => configured));
  const metadata = JSON.stringify(registry);
  assert.ok(!metadata.includes(fixtureCredential));
  assert.ok(!metadata.includes('fixture-app-value'));
  assert.ok(!registry.some(({ capabilities }) => capabilities.includes('campaigns:write')));
});

test('missing provider configuration rejects before making requests', async () => {
  const { registry, calls } = setup({});
  for (const provider of registry.filter(({ id }) => id !== 'godaddy')) {
    assert.equal(provider.configured, false);
    await assert.rejects(provider.test(), { status: 503, code: 'configuration_required' });
  }
  assert.equal(calls.length, 0);
});

test('Drive delegates its status to the selected-root adapter', async () => {
  const { provider, driveResult, calls } = setup();
  assert.equal(await provider('google-drive').test(), driveResult);
  assert.equal(calls.length, 0);
});

test('Gmail reads profile and message IDs only and removes unneeded response fields', async () => {
  const { provider, calls } = setup(undefined, (url) => url.pathname.endsWith('/profile')
    ? { emailAddress: 'owner@example.org', messagesTotal: 10, threadsTotal: 5, access_token: fixtureCredential }
    : { messages: [{ id: 'message-1', threadId: 'thread-1', snippet: 'private message content', access_token: fixtureCredential }] });
  const result = await provider('gmail').test();
  assert.deepEqual(result.identity, { email: 'owner@example.org' });
  assert.deepEqual(result.summary, { messagesTotal: 10, threadsTotal: 5 });
  assert.deepEqual(result.activity, [{ type: 'inbox_message', id: 'message-1', threadId: 'thread-1' }]);
  assert.ok(calls.every(({ url, options }) => new URL(url).origin === 'https://gmail.googleapis.com' && options.method === 'GET' && !options.body));
  assert.equal(new URL(calls[1].url).searchParams.get('labelIds'), 'INBOX');
  assert.ok(!JSON.stringify(result).includes(fixtureCredential));
  assert.ok(!JSON.stringify(result).includes('private message content'));
});

test('GitHub probes only allowlisted repositories and returns bounded commit metadata', async () => {
  const { provider, calls } = setup(undefined, (url) => {
    if (url.pathname === '/user') return { login: 'workplace-owner', token: fixtureCredential };
    if (url.pathname.endsWith('/commits')) return [{ sha: 'a'.repeat(40), author: { login: 'contributor' }, commit: { message: 'private commit body', committer: { date: '2026-10-17T00:00:00Z' } }, token: fixtureCredential }];
    return { full_name: 'pointgoddesscc-sketch/orgsuite-workspace', default_branch: 'main', private: true, open_issues_count: 3, token: fixtureCredential };
  });
  const result = await provider('github').test();
  assert.equal(result.identity.login, 'workplace-owner');
  assert.equal(result.summary.repositories[0].repository, 'pointgoddesscc-sketch/orgsuite-workspace');
  assert.equal(result.activity[0].author, 'contributor');
  assert.ok(calls.every(({ url, options }) => new URL(url).origin === 'https://api.github.com' && options.method === 'GET' && !options.body));
  assert.ok(!JSON.stringify(result).includes(fixtureCredential));
  assert.ok(!JSON.stringify(result).includes('private commit body'));
});

test('GitHub defaults to this repository when no explicit allowlist is provided', async () => {
  const config = configuration(); delete config.github.repositories;
  const { provider, calls } = setup(config, (url) => url.pathname === '/user' ? { login: 'owner' }
    : url.pathname.endsWith('/commits') ? [] : { full_name: 'pointgoddesscc-sketch/orgsuite-workspace' });
  await provider('github').test();
  assert.ok(calls.slice(1).every(({ url }) => new URL(url).pathname.startsWith('/repos/pointgoddesscc-sketch/orgsuite-workspace')));
});

test('Meta uses app-secret proof and reads only account and aggregate insights', async () => {
  const { provider, calls } = setup(undefined, (url) => url.pathname.endsWith('/insights')
    ? { data: [{ impressions: '150', clicks: '12', spend: '2.50', access_token: fixtureCredential }] }
    : { id: 'act_123456', name: 'Workplace advertising', account_status: 1, currency: 'USD', timezone_name: 'America/New_York', access_token: fixtureCredential });
  const result = await provider('meta').test();
  assert.equal(result.identity.accountId, 'act_123456');
  assert.equal(result.summary.spend, '2.50');
  assert.equal(result.summary.datePreset, 'last_7d');
  const expectedProof = createHmac('sha256', 'fixture-app-value').update(fixtureCredential).digest('hex');
  for (const { url: value, options } of calls) {
    const url = new URL(value);
    assert.equal(url.origin, 'https://graph.facebook.com');
    assert.ok(['/v23.0/act_123456', '/v23.0/act_123456/insights'].includes(url.pathname));
    assert.equal(url.searchParams.get('appsecret_proof'), expectedProof);
    assert.equal(url.searchParams.has('access_token'), false);
    assert.equal(options.method, 'GET');
    assert.equal(options.body, undefined);
  }
  assert.ok(!JSON.stringify(result).includes(fixtureCredential));
  assert.ok(!JSON.stringify(result).includes(expectedProof));
});

test('Vercel restricts reads to configured projects and selected team', async () => {
  const { provider, calls } = setup(undefined, (url) => url.pathname.includes('/projects/')
    ? { id: 'prj_fixture', name: 'orgsuite', framework: 'nextjs', env: [{ value: fixtureCredential }] }
    : { deployments: [{ uid: 'dpl_fixture', state: 'READY', createdAt: 1, secret: fixtureCredential }] });
  const result = await provider('vercel').test();
  assert.equal(result.summary.projects[0].id, 'prj_fixture');
  assert.equal(result.activity[0].state, 'READY');
  assert.ok(calls.every(({ url, options }) => new URL(url).origin === 'https://api.vercel.com' && new URL(url).searchParams.get('teamId') === 'team_fixture' && options.method === 'GET' && !options.body));
  assert.equal(new URL(calls[1].url).searchParams.get('projectId'), 'prj_fixture');
  assert.ok(!JSON.stringify(result).includes(fixtureCredential));
});

test('Cloudflare verifies token then reads only configured zones', async () => {
  const { provider, calls } = setup(undefined, (url) => url.pathname.endsWith('/verify')
    ? { success: true, result: { status: 'active', value: fixtureCredential } }
    : { success: true, result: { id: zoneId, name: 'example.org', status: 'active', paused: false, secret: fixtureCredential } });
  const result = await provider('cloudflare').test();
  assert.equal(result.identity.tokenStatus, 'active');
  assert.deepEqual(result.summary.zones, [{ id: zoneId, name: 'example.org', status: 'active', paused: false }]);
  assert.ok(calls.every(({ url, options }) => new URL(url).origin === 'https://api.cloudflare.com' && options.method === 'GET' && !options.body));
  assert.deepEqual(calls.map(({ url }) => new URL(url).pathname), ['/client/v4/user/tokens/verify', `/client/v4/zones/${zoneId}`]);
  assert.ok(!JSON.stringify(result).includes(fixtureCredential));
});

test('GoDaddy exposes public health only, including unready and successful probes', async () => {
  for (const [status, ready] of [[503, false], [200, true]]) {
    const { provider, calls } = setup(undefined, undefined, async () => ({ status, body: { ok: ready, secret: fixtureCredential } }));
    const result = await provider('godaddy').test();
    assert.equal(calls[0].url, 'https://orgsuite-godaddy-health.vercel.app/api/godaddy/health');
    assert.equal(result.identity.verification, 'health_only');
    assert.equal(result.summary.ready, ready);
    assert.equal(result.summary.accountAccessVerified, false);
    assert.ok(!JSON.stringify(result).includes(fixtureCredential));
  }
});

test('malformed identifiers and URL injection are rejected before a provider request', async () => {
  const cases = [
    ['github', { repositories: ['https://example.org/owner/repo'] }],
    ['github', { repositories: ['../repo'] }],
    ['github', { repositories: ['owner/..'] }],
    ['github', { repositories: ['owner/repo?redirect=evil'] }],
    ['github', { token: 'value\r\nInjected: true' }],
    ['meta', { adAccountId: '../accounts' }],
    ['meta', { appId: 'not-a-real-app-id' }],
    ['meta', { version: 'https://example.org' }],
    ['vercel', { projectIds: ['../project'] }],
    ['vercel', { teamId: 'team?target=evil' }],
    ['cloudflare', { zoneIds: ['not-a-zone-id'] }],
  ];
  for (const [id, invalid] of cases) {
    const config = configuration(); Object.assign(config[id], invalid);
    const { provider, calls } = setup(config);
    await assert.rejects(provider(id).test(), { status: 503, code: 'configuration_invalid' });
    assert.equal(calls.length, 0);
  }
});

test('selected account and project mismatches fail instead of claiming a connection', async () => {
  for (const id of ['github', 'meta', 'vercel']) {
    const { provider } = setup(undefined, (url) => url.pathname === '/user' ? { login: 'owner' } : { id: 'different-account', full_name: 'different/repository' });
    await assert.rejects(provider(id).test(), { status: 502, code: 'provider_response_invalid' });
  }
});

test('provider authorization errors propagate with safe stable codes', async () => {
  const { provider } = setup(undefined, () => { throw new HubError(401, 'authorization_required'); });
  await assert.rejects(provider('github').test(), { status: 401, code: 'authorization_required' });
});

test('inactive Cloudflare token cannot be considered connected', async () => {
  const { provider, calls } = setup(undefined, () => ({ success: true, result: { status: 'disabled' } }));
  await assert.rejects(provider('cloudflare').test(), { status: 401, code: 'authorization_required' });
  assert.equal(calls.length, 1);
});
