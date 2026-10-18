import { createHash, randomBytes } from 'node:crypto';
import { HubError } from './errors.mjs';

const random = () => randomBytes(32).toString('base64url');
const GMAIL_SCOPE = 'https://www.googleapis.com/auth/gmail.readonly';

export function createGoogleOAuth({ config, store, http, now = () => Date.now() }) {
  let refreshing;
  let generation = 0;
  const redirectUri = config.origin + '/oauth/google/callback';
  function configured() {
    if (!config.google.clientId || !config.google.clientSecret) throw new HubError(503, 'configuration_required');
  }
  function tokenFields(response, previous = {}) {
    if (!response || typeof response !== 'object' || typeof response.access_token !== 'string' || !response.access_token || response.access_token.length > 8192 ||
        /[^\x21-\x7e]/.test(response.access_token) ||
        (response.refresh_token !== undefined && (typeof response.refresh_token !== 'string' || !response.refresh_token || response.refresh_token.length > 8192 || /[^\x21-\x7e]/.test(response.refresh_token))) ||
        (response.scope !== undefined && (typeof response.scope !== 'string' || response.scope.length > 8192)) ||
        !Number.isFinite(Number(response.expires_in)) || Number(response.expires_in) <= 0 || Number(response.expires_in) > 86400) {
      throw new HubError(502, 'invalid_token_response');
    }
    return { accessToken: response.access_token, refreshToken: response.refresh_token || previous.refreshToken || '',
      expiresAt: now() + Number(response.expires_in) * 1000, scope: response.scope || previous.scope || '', email: previous.email || '' };
  }
  async function exchange(parameters) {
    configured();
    return http.json('https://oauth2.googleapis.com/token', { method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ ...parameters, client_id: config.google.clientId, client_secret: config.google.clientSecret }).toString(), maxBytes: 64 * 1024 });
  }
  return {
    begin(connector, session) {
      configured();
      if (!['google-drive', 'gmail'].includes(connector)) throw new HubError(400, 'connector_not_supported');
      const state = random(), verifier = random();
      const scope = connector === 'google-drive' ? config.google.driveScope : GMAIL_SCOPE;
      store.saveState(state, session.id, { verifier, connector, scope });
      const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      url.search = new URLSearchParams({ client_id: config.google.clientId, redirect_uri: redirectUri, response_type: 'code',
        scope: 'openid email ' + scope, state, access_type: 'offline', include_granted_scopes: 'true', prompt: 'consent select_account',
        code_challenge: createHash('sha256').update(verifier).digest('base64url'), code_challenge_method: 'S256' }).toString();
      return url.href;
    },
    async finish(parameters, session) {
      const state = parameters.get('state') || '';
      if (!/^[A-Za-z0-9_-]{43}$/.test(state)) throw new HubError(400, 'invalid_oauth_state');
      const pending = store.consumeState(state, session.id);
      if (!pending || parameters.has('error')) throw new HubError(400, 'invalid_oauth_state');
      const code = parameters.get('code');
      if (!code || code.length > 4096) throw new HubError(400, 'authorization_failed');
      const startedAtGeneration = generation;
      const response = await exchange({ grant_type: 'authorization_code', code, redirect_uri: redirectUri, code_verifier: pending.verifier });
      const previous = store.getSecret('google') || {};
      const token = tokenFields(response, previous);
      if (!token.scope.split(' ').includes(pending.scope)) throw new HubError(403, 'required_scope_missing');
      const identity = await http.json('https://openidconnect.googleapis.com/v1/userinfo', { headers: { Authorization: 'Bearer ' + token.accessToken } });
      if (!identity || typeof identity.email !== 'string' || !identity.email || identity.email_verified !== true ||
          (config.google.accountEmail && identity.email.toLowerCase() !== config.google.accountEmail.toLowerCase()) ||
          (previous.email && previous.email.toLowerCase() !== identity.email.toLowerCase())) {
        throw new HubError(403, 'google_account_mismatch');
      }
      token.email = identity.email;
      if (generation !== startedAtGeneration) throw new HubError(401, 'authorization_changed');
      generation++;
      store.putSecret('google', token);
      // OAuth completion alone does not mark either service Connected.
      return pending.connector;
    },
    async getAccessToken() {
      const current = store.getSecret('google');
      if (!current) throw new HubError(401, 'authorization_required');
      if (current.expiresAt > now() + 60_000) return current.accessToken;
      if (!current.refreshToken) throw new HubError(401, 'reauthorization_required');
      if (!refreshing || refreshing.generation !== generation) {
        const pending = { generation };
        pending.promise = (async () => {
          const response = await exchange({ grant_type: 'refresh_token', refresh_token: current.refreshToken });
          const token = tokenFields(response, current);
          const latest = store.getSecret('google');
          if (generation !== pending.generation || !latest || latest.refreshToken !== current.refreshToken) throw new HubError(401, 'authorization_changed');
          store.putSecret('google', token);
          return token.accessToken;
        })().finally(() => { if (refreshing === pending) refreshing = null; });
        refreshing = pending;
      }
      return refreshing.promise;
    },
    async disconnect() {
      const token = store.getSecret('google');
      generation++;
      store.deleteSecret('google');
      for (const id of ['google-drive', 'gmail']) store.setConnection(id, { state: 'Requires Authorization', checkedAt: new Date(now()).toISOString(), detail: 'Local Google credentials removed. Remote revocation is being verified.' });
      if (token) {
        try {
          await http.bytes('https://oauth2.googleapis.com/revoke', { method: 'POST',
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ token: token.refreshToken || token.accessToken }).toString(), maxBytes: 4096 });
        } catch { throw new HubError(502, 'remote_revocation_unconfirmed'); }
      }
      for (const id of ['google-drive', 'gmail']) store.setConnection(id, { state: 'Requires Authorization', checkedAt: new Date(now()).toISOString(), detail: 'Google access revoked and local credentials removed.' });
    }
  };
}
