'use strict';

const assert = require('node:assert/strict');
const { Readable } = require('node:stream');
const test = require('node:test');
const { ALLOWED_SERVICES, MAX_BODY_BYTES, createHubAcceptor, createInquiryHandler, validateInquiry } = require('../server/inquiry.cjs');

const inquiry = () => ({ name: 'Test Visitor', email: 'visitor@example.invalid', message: 'A test inquiry', service: 'contact', id: 'IFMS-TEST123' });
const accepted = async record => ({ ok: true, id: record.id });
const environment = (overrides = {}) => ({
  INQUIRY_HUB_ORIGIN: 'https://hub.example.invalid',
  ORGSUITE_INQUIRY_INGEST_KEY: Buffer.alloc(32, 1).toString('base64url'),
  ...overrides
});

function request({ method = 'POST', contentType = 'application/json', body = JSON.stringify(inquiry()), headers = {}, parsed = false } = {}) {
  const req = Readable.from(parsed ? [] : Array.isArray(body) ? body : [body]);
  req.method = method;
  req.headers = { 'content-type': contentType, ...headers };
  if (parsed) req.body = body;
  return req;
}

function response() {
  return {
    statusCode: undefined,
    headers: {},
    ended: false,
    setHeader(name, value) { this.headers[name.toLowerCase()] = value; },
    end(body) { this.ended = true; this.body = JSON.parse(body); }
  };
}

async function run(options = {}, input = {}) {
  const res = response();
  await createInquiryHandler(options)(request(input), res);
  return res;
}

for (const method of ['GET', 'HEAD', 'PUT', 'DELETE', 'OPTIONS']) {
  test(`${method} cannot create a receipt`, async () => {
    const res = await run({ acceptInquiry: () => assert.fail('must not accept') }, { method });
    assert.equal(res.statusCode, 405);
    assert.equal(res.headers.allow, 'POST');
    assert.deepEqual(res.body, { ok: false, error: 'method_not_allowed' });
  });
}

test('requires a JSON content type before consuming the body', async () => {
  for (const contentType of ['', 'text/plain', 'application/json-not-really']) {
    const res = await run({ acceptInquiry: accepted }, { contentType });
    assert.equal(res.statusCode, 415);
    assert.equal(res.body.ok, false);
  }
});

test('rejects malformed JSON and invalid UTF-8', async () => {
  for (const body of ['', '{broken', Buffer.from([0xff])]) {
    const res = await run({ acceptInquiry: accepted }, { body });
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.error, 'invalid_json');
  }
});

test('validates the five required fields, service choices, and client request identifier', () => {
  for (const service of ALLOWED_SERVICES) assert.equal(validateInquiry({ ...inquiry(), service }).service, service);
  const invalid = [null, [], {}, { ...inquiry(), extra: true }, { ...inquiry(), name: 42 },
    { ...inquiry(), name: 'Test\nName' }, { ...inquiry(), email: 'no-address' }, { ...inquiry(), email: 'a@b.invalid\u0000' },
    { ...inquiry(), message: ' ' }, { ...inquiry(), message: 'x'.repeat(8001) }, { ...inquiry(), service: 'unknown' },
    { ...inquiry(), id: 'someone-else' }, { ...inquiry(), id: 'IFMS-<script>' }];
  for (const record of invalid) assert.throws(() => validateInquiry(record), { status: 400, code: 'invalid_inquiry' });
  assert.deepEqual(validateInquiry({ ...inquiry(), name: '  Test Visitor  ', message: '\nA test inquiry\n' }), inquiry());
});

test('invalid records never reach the acceptance callback', async () => {
  const res = await run({ acceptInquiry: () => assert.fail('must not accept') }, { body: JSON.stringify({ ...inquiry(), service: 'unknown' }) });
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.error, 'invalid_inquiry');
});

test('bounds streamed, declared, and platform-parsed request bodies to 32 KiB', async () => {
  for (const input of [
    { body: [' '.repeat(MAX_BODY_BYTES), ' '] },
    { headers: { 'content-length': String(MAX_BODY_BYTES + 1) } },
    { parsed: true, body: { ...inquiry(), message: 'x'.repeat(MAX_BODY_BYTES) } },
    { parsed: true, body: ' '.repeat(MAX_BODY_BYTES + 1) }
  ]) {
    const res = await run({ acceptInquiry: () => assert.fail('must not accept') }, input);
    assert.equal(res.statusCode, 413);
    assert.equal(res.body.error, 'body_too_large');
  }
});

test('does not acknowledge before durable acceptance completes', async () => {
  let resolve;
  let began;
  const entered = new Promise(done => { began = done; });
  const pending = new Promise(done => { resolve = done; });
  const res = response();
  const completion = createInquiryHandler({ acceptInquiry: record => { began(); return pending; } })(request(), res);
  await entered;
  assert.equal(res.ended, false);
  resolve({ ok: true, id: inquiry().id });
  await completion;
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { ok: true, id: inquiry().id });
  assert.equal(res.headers['cache-control'], 'no-store');
});

test('acceptance failure, empty acknowledgement, and mismatched IDs fail closed', async () => {
  for (const acceptInquiry of [async () => { throw new Error('private transport details'); },
    async () => undefined, async () => ({ ok: false }), async () => ({ ok: true }),
    async () => ({ ok: true, id: 'IFMS-OTHER' })]) {
    const res = await run({ acceptInquiry });
    assert.equal(res.statusCode, 502);
    assert.equal(res.body.ok, false);
    assert.doesNotMatch(JSON.stringify(res.body), /private transport details/u);
  }
});

test('platform-parsed JSON still goes through validation and acceptance', async () => {
  const res = await run({ acceptInquiry: accepted }, { parsed: true, body: inquiry(), contentType: 'application/json; charset=utf-8' });
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.id, inquiry().id);
});

test('missing configuration returns 503 without making an outbound call', async () => {
  const res = await run({ env: {}, fetchImpl: () => assert.fail('must not fetch') });
  assert.equal(res.statusCode, 503);
  assert.deepEqual(res.body, { ok: false, error: 'inquiry_unavailable' });
});

test('rejects unsafe origins, embedded credentials, and incomplete ingestion keys', async () => {
  for (const INQUIRY_HUB_ORIGIN of ['http://hub.example.invalid', 'ftp://hub.example.invalid',
    'https://user:pass@hub.example.invalid', 'https://hub.example.invalid/other',
    'https://hub.example.invalid/?redirect=1', 'https://hub.example.invalid/#section',
    'https://hub.example.invalid/path/..', 'https://hub.example.invalid\\path', 'http://localhost:3100']) {
    const acceptInquiry = createHubAcceptor({ env: environment({ INQUIRY_HUB_ORIGIN }), fetchImpl: () => assert.fail('must not fetch') });
    await assert.rejects(acceptInquiry(inquiry()), { status: 503, code: 'inquiry_unavailable' });
  }
  await assert.rejects(createHubAcceptor({ env: environment({ ORGSUITE_INQUIRY_INGEST_KEY: 'short' }) })(inquiry()), { status: 503 });
});

test('forwards only to the fixed Hub ingestion route, with redirect refusal and matching receipt', async () => {
  let call;
  const acceptInquiry = createHubAcceptor({ env: environment(), fetchImpl: async (url, options) => {
    call = { url, options };
    return Response.json({ ok: true, id: inquiry().id });
  } });
  assert.deepEqual(await acceptInquiry(inquiry()), { ok: true, id: inquiry().id });
  assert.equal(call.url, 'https://hub.example.invalid/api/internal/inquiries');
  assert.equal(call.options.method, 'POST');
  assert.equal(call.options.redirect, 'error');
  assert.ok(call.options.signal instanceof AbortSignal);
  assert.equal(call.options.headers.Authorization, `Bearer ${environment().ORGSUITE_INQUIRY_INGEST_KEY}`);
  assert.deepEqual(JSON.parse(call.options.body), inquiry());
});

test('permits HTTP only for explicitly configured development loopback', async () => {
  for (const origin of ['http://localhost:3100', 'http://127.0.0.1:3100', 'http://[::1]:3100']) {
    const acceptInquiry = createHubAcceptor({ env: environment({ NODE_ENV: 'development', INQUIRY_HUB_ORIGIN: origin }),
      fetchImpl: async () => Response.json({ ok: true, id: inquiry().id }) });
    assert.equal((await acceptInquiry(inquiry())).ok, true);
  }
  await assert.rejects(createHubAcceptor({ env: environment({ NODE_ENV: 'development', INQUIRY_HUB_ORIGIN: 'http://hub.example.invalid' }) })(inquiry()), { status: 503 });
});

test('Hub failure, HTML, malformed JSON, and incorrect or oversized acknowledgements fail closed', async () => {
  const replies = [
    () => Response.json({ ok: true, id: inquiry().id }, { status: 503 }),
    () => new Response('<html>app shell</html>', { headers: { 'content-type': 'text/html' } }),
    () => new Response('{broken', { headers: { 'content-type': 'application/json' } }),
    () => Response.json({ ok: false, id: inquiry().id }),
    () => Response.json({ ok: true, id: 'IFMS-OTHER' }),
    () => Response.json({ ok: true }),
    () => new Response('x'.repeat(16 * 1024 + 1), { headers: { 'content-type': 'application/json' } }),
    () => Response.json({ ok: true, id: inquiry().id }, { headers: { 'content-length': '9999999' } })
  ];
  for (const reply of replies) {
    const res = await run({ env: environment(), fetchImpl: async () => reply() });
    assert.equal(res.statusCode, 502);
    assert.equal(res.body.ok, false);
  }
});

test('Hub timeout aborts the request and returns no receipt', async () => {
  let aborted = false;
  const acceptInquiry = createHubAcceptor({ env: environment(), timeoutMs: 5, fetchImpl: (url, { signal }) => new Promise((resolve, reject) => {
    signal.addEventListener('abort', () => { aborted = true; reject(new Error('aborted')); }, { once: true });
  }) });
  const res = await run({ acceptInquiry });
  assert.equal(aborted, true);
  assert.equal(res.statusCode, 502);
  assert.equal(res.body.ok, false);
});
