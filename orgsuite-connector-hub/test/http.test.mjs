import test from 'node:test';
import assert from 'node:assert/strict';
import { createHttp } from '../src/http.mjs';

const googleUrl = 'https://www.googleapis.com/drive/v3/about?fields=user';
const jsonHeaders = { 'content-type': 'application/json' };

test('HTTP origin restrictions reject unknown origins, HTTP, and URL credentials before fetch', async () => {
  let requests = 0;
  const http = createHttp({ fetchImpl: async () => { requests++; return new Response('{}', { headers: jsonHeaders }); } });
  const denied = [
    'https://example.org/api',
    'http://www.googleapis.com/drive/v3/about',
    'https://www.googleapis.com.example.org/drive/v3/about',
    'https://www.googleapis.com:8443/drive/v3/about',
    'https://user@www.googleapis.com/drive/v3/about',
    'https://user:password@www.googleapis.com/drive/v3/about',
    'file:///etc/passwd',
  ];
  for (const url of denied) {
    await assert.rejects(http.json(url), { status: 400, code: 'provider_origin_denied' });
  }
  assert.equal(requests, 0);
});

test('provider credentials stay on the original allowed request and redirects are disabled', async () => {
  const credential = ['fixture', 'credential'].join('-');
  const calls = [];
  const http = createHttp({ fetchImpl: async (url, options) => {
    calls.push({ url: String(url), options });
    return new Response('', { status: 302, headers: { location: 'https://example.org/collect' } });
  } });
  await assert.rejects(http.json(googleUrl, { headers: { Authorization: `Bearer ${credential}` } }), {
    status: 502, code: 'provider_request_failed',
  });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, googleUrl);
  assert.equal(calls[0].options.headers.Authorization, `Bearer ${credential}`);
  assert.equal(calls[0].options.redirect, 'error');
});

test('declared response size is bounded before consuming the response body', async () => {
  let consumed = false;
  const http = createHttp({ fetchImpl: async () => ({
    ok: true, status: 200,
    headers: new Headers({ 'content-length': '100', ...jsonHeaders }),
    body: { async *[Symbol.asyncIterator]() { consumed = true; yield Buffer.from('{}'); } },
  }) });
  await assert.rejects(http.json(googleUrl, { maxBytes: 10 }), { status: 502, code: 'provider_response_too_large' });
  assert.equal(consumed, false);
});

test('streamed response size stays bounded when the provider omits a length header', async () => {
  const http = createHttp({ fetchImpl: async () => new Response(new ReadableStream({
    start(controller) {
      controller.enqueue(new Uint8Array([1, 2, 3, 4]));
      controller.enqueue(new Uint8Array([5, 6, 7, 8]));
      controller.close();
    },
  })) });
  await assert.rejects(http.bytes(googleUrl, { maxBytes: 5 }), { status: 502, code: 'provider_response_too_large' });
});

test('provider authorization and throttling failures use stable public error codes', async () => {
  const cases = [
    [401, 401, 'authorization_required'],
    [403, 403, 'insufficient_scope'],
    [429, 503, 'provider_rate_limited'],
  ];
  for (const [providerStatus, status, code] of cases) {
    const providerDetail = ['private', 'provider', 'detail'].join('-');
    const http = createHttp({ fetchImpl: async () => new Response(JSON.stringify({ message: providerDetail }), {
      status: providerStatus, headers: jsonHeaders,
    }) });
    await assert.rejects(http.json(googleUrl), (error) => {
      assert.equal(error.status, status);
      assert.equal(error.code, code);
      assert.equal(error.message, code);
      assert.equal(String(error).includes(providerDetail), false);
      return true;
    });
  }
});

test('malformed JSON and invalid UTF-8 are rejected without reflecting provider content', async () => {
  for (const data of [Buffer.from('{ broken JSON'), Buffer.from([123, 34, 120, 34, 58, 34, 192, 175, 34, 125])]) {
    const http = createHttp({ fetchImpl: async () => new Response(data, { headers: jsonHeaders }) });
    await assert.rejects(http.json(googleUrl), { status: 502, code: 'provider_invalid_response' });
  }
});

test('a stalled provider request is aborted and returns a stable failure', async () => {
  let aborted = false;
  const http = createHttp({ timeoutMs: 5, fetchImpl: async (_url, { signal }) => new Promise((_resolve, reject) => {
    signal.addEventListener('abort', () => { aborted = true; reject(new Error('aborted provider request')); }, { once: true });
  }) });
  await assert.rejects(http.json(googleUrl), { status: 502, code: 'provider_unavailable' });
  assert.equal(aborted, true);
});

test('binary downloads retain bytes and provider MIME type', async () => {
  const payload = new Uint8Array([0, 1, 128, 255]);
  const http = createHttp({ fetchImpl: async () => new Response(payload, { headers: { 'content-type': 'image/png' } }) });
  const result = await http.bytes(googleUrl);
  assert.equal(result.status, 200);
  assert.equal(result.mimeType, 'image/png');
  assert.deepEqual(result.data, Buffer.from(payload));
});

test('public health probes retain HTTP 503 and parsed readiness data without asserting account access', async () => {
  const url = 'https://orgsuite-godaddy-health.vercel.app/api/godaddy/health';
  const body = { ok: false, error: 'keys_missing' };
  const http = createHttp({ fetchImpl: async () => new Response(JSON.stringify(body), { status: 503, headers: jsonHeaders }) });
  const result = await http.probe(url);
  assert.deepEqual(result, { status: 503, body });
  assert.equal(Object.hasOwn(result, 'connected'), false);
  assert.equal(Object.hasOwn(result, 'accountAccessVerified'), false);
});
