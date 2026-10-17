const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');

function accepted(status = 200) {
  return { ok: true, status, headers: { get: () => 'application/json' }, json: async () => ({ ok: true }) };
}

function setup(reply, { storageFailure = false } = {}) {
  const output = { textContent: '' };
  const button = { disabled: false };
  const fields = new Map([
    ['name', 'Test Visitor'],
    ['email', 'visitor@example.invalid'],
    ['message', 'A test inquiry']
  ]);
  const storage = new Map();
  const requests = [];
  let submit;
  const form = {
    dataset: { service: 'contact' },
    querySelector(selector) {
      return selector === '.js-out' ? output : button;
    },
    addEventListener(type, callback) {
      if (type === 'submit') submit = callback;
    },
    reset() { fields.clear(); }
  };
  const elements = { app: { innerHTML: '' }, rf: {}, ham: {} };
  vm.runInNewContext(source, {
    window: { IFMS: {} },
    location: { pathname: '/contact' },
    document: {
      addEventListener() {},
      getElementById(id) { return elements[id] || null; },
      querySelectorAll() { return [form]; }
    },
    addEventListener() {},
    FormData: class { entries() { return fields.entries(); } },
    localStorage: {
      getItem(key) { return storage.get(key) || null; },
      setItem(key, value) {
        if (storageFailure) throw new Error('Storage unavailable');
        storage.set(key, value);
      }
    },
    fetch(url, options) {
      if (url === '/api/health') return Promise.resolve({ json: async () => ({ ok: true }) });
      requests.push({ url, options });
      return reply();
    }
  });
  return {
    output, button, fields, storage, requests,
    submit() { return submit({ currentTarget: form, preventDefault() {} }); }
  };
}

test('confirms receipt only after a successful HTTP response', async () => {
  let resolve;
  const pending = new Promise(done => { resolve = done; });
  const app = setup(() => pending);
  const submission = app.submit();
  assert.equal(app.output.textContent, 'Sending request…');
  assert.equal(app.button.disabled, true);
  await app.submit();
  assert.equal(app.requests.length, 1, 'a pending request must not submit twice');
  resolve(accepted(201));
  await submission;
  assert.match(app.output.textContent, /^Received · IFMS-/);
  assert.equal(app.button.disabled, false);
  assert.equal(app.requests[0].url, '/api/inquiry');
  assert.equal(app.requests[0].options.method, 'POST');
  assert.equal(JSON.parse(app.requests[0].options.body).message, 'A test inquiry');
});

for (const status of [400, 500]) {
  test(`HTTP ${status} preserves the inquiry and reports unconfirmed delivery`, async () => {
    const app = setup(async () => ({ ok: false, status }));
    await app.submit();
    assert.match(app.output.textContent, /^Saved on this device only · IFMS-/);
    assert.match(app.output.textContent, /Delivery was not confirmed/);
    assert.doesNotMatch(app.output.textContent, /Received/);
    assert.equal(app.fields.get('message'), 'A test inquiry');
    assert.equal(JSON.parse(app.storage.get('ifms_inquiries')).length, 1);
    assert.equal(app.button.disabled, false);
  });
}

test('network failure preserves input and allows retry with the same request ID', async () => {
  let fail = true;
  const app = setup(async () => {
    if (fail) throw new TypeError('Network unavailable');
    return accepted();
  });
  await app.submit();
  assert.match(app.output.textContent, /Saved on this device only/);
  assert.match(app.output.textContent, /Submit again to retry/);
  assert.doesNotMatch(app.output.textContent, /Received/);
  assert.equal(app.fields.get('message'), 'A test inquiry');
  assert.equal(app.button.disabled, false);
  const first = JSON.parse(app.requests[0].options.body);
  app.fields.set('message', 'An updated test inquiry');
  fail = false;
  await app.submit();
  const retry = JSON.parse(app.requests[1].options.body);
  assert.equal(retry.id, first.id);
  const saved = JSON.parse(app.storage.get('ifms_inquiries'));
  assert.equal(saved.length, 1, 'retry must update the existing local inquiry');
  assert.equal(saved[0].message, 'An updated test inquiry');
  assert.match(app.output.textContent, /^Received · IFMS-/);
});

test('storage failure does not claim a local save or prevent server delivery', async () => {
  const failed = setup(async () => ({ ok: false, status: 503 }), { storageFailure: true });
  await failed.submit();
  assert.match(failed.output.textContent, /Delivery was not confirmed/);
  assert.doesNotMatch(failed.output.textContent, /Saved|Received/);
  assert.equal(failed.fields.get('message'), 'A test inquiry');
  assert.equal(failed.button.disabled, false);

  const delivered = setup(async () => accepted(), { storageFailure: true });
  await delivered.submit();
  assert.match(delivered.output.textContent, /^Received · IFMS-/);
  assert.equal(delivered.requests.length, 1);
});

for (const [name, response] of [
  ['an HTML fallback page', { ok: true, headers: { get: () => 'text/html' }, json: async () => ({ ok: true }) }],
  ['malformed JSON', { ok: true, headers: { get: () => 'application/json' }, json: async () => { throw new SyntaxError('Invalid JSON'); } }],
  ['a negative acknowledgement', { ok: true, headers: { get: () => 'application/json' }, json: async () => ({ ok: false }) }],
  ['a mismatched receipt ID', { ok: true, headers: { get: () => 'application/json' }, json: async () => ({ ok: true, id: 'another-request' }) }]
]) {
  test(`HTTP success with ${name} does not claim receipt`, async () => {
    const app = setup(async () => response);
    await app.submit();
    assert.match(app.output.textContent, /Delivery was not confirmed/);
    assert.doesNotMatch(app.output.textContent, /Received/);
    assert.equal(app.fields.get('message'), 'A test inquiry');
    assert.equal(app.button.disabled, false);
  });
}
