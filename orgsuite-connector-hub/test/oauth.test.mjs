import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { openStore } from '../src/store.mjs';
import { createGoogleOAuth } from '../src/oauth.mjs';

const SCOPE = 'https://www.googleapis.com/auth/drive.file';
const value = label => ['fixture', label, 'value'].join('-');
const NOW = 1780000000000;
const previous = () => ({ accessToken: value('old-access'), refreshToken: value('old-refresh'),
  expiresAt: NOW - 1, scope: SCOPE, email: 'owner@example.invalid' });
const response = (label = 'new') => ({ access_token: value(label + '-access'), expires_in: 3600, scope: SCOPE });
const deferred = () => { let resolve; const promise = new Promise(done => { resolve = done; }); return { promise, resolve }; };
const rejects = (status, code) => error => error.status === status && error.code === code;

function fixture(t, http = {}) {
  const dataDir = mkdtempSync(path.join(tmpdir(), 'orgsuite-oauth-'));
  const store = openStore({ dataDir, vaultKey: Buffer.alloc(32, 42), now: () => NOW });
  t.after(() => { store.close(); rmSync(dataDir, { recursive: true, force: true }); });
  const config = { origin: 'https://hub.example.invalid', google: { clientId: 'fixture-client', clientSecret: value('client'),
    driveScope: SCOPE, accountEmail: 'owner@example.invalid' } };
  const oauth = createGoogleOAuth({ config, store, now: () => NOW, http: {
    async json(url) {
      if (String(url).includes('/userinfo')) return { email: 'owner@example.invalid', email_verified: true };
      return response();
    }, async bytes() { return {}; }, ...http } });
  const session = store.createSession('fixture-owner');
  const consent = () => {
    const url = new URL(oauth.begin('google-drive', session));
    return new URLSearchParams({ state: url.searchParams.get('state'), code: 'fixture-code' });
  };
  return { store, oauth, session, consent };
}

test('missing authorization and absent offline refresh fail without a provider call', async t => {
  const app = fixture(t, { async json() { assert.fail('provider should not be called'); } });
  await assert.rejects(app.oauth.getAccessToken(), rejects(401, 'authorization_required'));
  app.store.putSecret('google', { ...previous(), refreshToken: '' });
  await assert.rejects(app.oauth.getAccessToken(), rejects(401, 'reauthorization_required'));
});

test('fresh access tokens are reused without exposing refresh credentials to a provider', async t => {
  const app = fixture(t, { async json() { assert.fail('refresh should not be called'); } });
  const saved = { ...previous(), expiresAt: NOW + 3600_000 };
  app.store.putSecret('google', saved);
  assert.equal(await app.oauth.getAccessToken(), saved.accessToken);
});

test('concurrent expired-token users share one refresh and preserve the offline token', async t => {
  const pending = deferred();
  let calls = 0;
  const app = fixture(t, { async json(url, options) {
    assert.equal(url, 'https://oauth2.googleapis.com/token');
    const form = new URLSearchParams(options.body);
    assert.equal(form.get('grant_type'), 'refresh_token');
    assert.equal(form.get('refresh_token'), previous().refreshToken);
    calls++; return pending.promise;
  } });
  app.store.putSecret('google', previous());
  const first = app.oauth.getAccessToken(), second = app.oauth.getAccessToken();
  pending.resolve(response());
  assert.deepEqual(await Promise.all([first, second]), [response().access_token, response().access_token]);
  assert.equal(calls, 1);
  assert.equal(app.store.getSecret('google').refreshToken, previous().refreshToken);
});

test('an in-flight refresh cannot resurrect credentials after disconnect', async t => {
  const pending = deferred();
  const app = fixture(t, { async json() { return pending.promise; } });
  app.store.putSecret('google', previous());
  const refresh = app.oauth.getAccessToken();
  const rejected = assert.rejects(refresh, rejects(401, 'authorization_changed'));
  await app.oauth.disconnect();
  assert.equal(app.store.getSecret('google'), null);
  pending.resolve(response());
  await rejected;
  assert.equal(app.store.getSecret('google'), null);
  assert.equal(app.store.connection('google-drive').state, 'Requires Authorization');
});

test('failed remote revocation still removes local access and reports the limitation', async t => {
  const app = fixture(t, { async bytes() { throw new Error('upstream unavailable'); } });
  app.store.putSecret('google', previous());
  await assert.rejects(app.oauth.disconnect(), rejects(502, 'remote_revocation_unconfirmed'));
  assert.equal(app.store.getSecret('google'), null);
  await assert.rejects(app.oauth.getAccessToken(), rejects(401, 'authorization_required'));
  assert.match(app.store.connection('gmail').detail, /Local Google credentials removed/);
});

test('an old refresh cannot overwrite a completed new consent', async t => {
  const pending = deferred();
  const app = fixture(t, { async json(url, options) {
    if (String(url).includes('/userinfo')) return { email: 'owner@example.invalid', email_verified: true };
    return new URLSearchParams(options.body).get('grant_type') === 'refresh_token'
      ? pending.promise : { ...response('consent'), refresh_token: value('consent-refresh') };
  } });
  app.store.putSecret('google', previous());
  const refresh = app.oauth.getAccessToken();
  const rejected = assert.rejects(refresh, rejects(401, 'authorization_changed'));
  assert.equal(await app.oauth.finish(app.consent(), app.session), 'google-drive');
  pending.resolve(response('obsolete'));
  await rejected;
  assert.equal(app.store.getSecret('google').accessToken, response('consent').access_token);
});

test('consent pending during disconnect cannot restore authorization later', async t => {
  const pending = deferred();
  const app = fixture(t, { async json(url) {
    if (String(url).includes('/userinfo')) return { email: 'owner@example.invalid', email_verified: true };
    return pending.promise;
  } });
  const consent = app.oauth.finish(app.consent(), app.session);
  const rejected = assert.rejects(consent, rejects(401, 'authorization_changed'));
  await app.oauth.disconnect();
  pending.resolve(response());
  await rejected;
  assert.equal(app.store.getSecret('google'), null);
});

test('malformed token fields are rejected before any credential is stored', async t => {
  for (const bad of [null, {}, { ...response(), access_token: 'bad\r\nvalue' },
    { ...response(), refresh_token: [] }, { ...response(), scope: {} }, { ...response(), expires_in: 0 }]) {
    const app = fixture(t, { async json() { return bad; } });
    await assert.rejects(app.oauth.finish(app.consent(), app.session), rejects(502, 'invalid_token_response'));
    assert.equal(app.store.getSecret('google'), null);
  }
});

test('missing scope, malformed identity, or a different account cannot be connected', async t => {
  for (const [scope, identity, code] of [
    ['unrelated-scope', null, 'required_scope_missing'],
    [SCOPE, { email: {}, email_verified: true }, 'google_account_mismatch'],
    [SCOPE, { email: 'another@example.invalid', email_verified: true }, 'google_account_mismatch'],
    [SCOPE, { email: 'owner@example.invalid', email_verified: false }, 'google_account_mismatch']
  ]) {
    const app = fixture(t, { async json(url) { return String(url).includes('/userinfo') ? identity : { ...response(), scope }; } });
    await assert.rejects(app.oauth.finish(app.consent(), app.session), rejects(403, code));
    assert.equal(app.store.getSecret('google'), null);
  }
});
