import { HubError } from './errors.mjs';

const PROVIDERS = new Set([
  'https://www.googleapis.com', 'https://gmail.googleapis.com', 'https://oauth2.googleapis.com',
  'https://openidconnect.googleapis.com', 'https://api.github.com', 'https://graph.facebook.com',
  'https://api.vercel.com', 'https://api.cloudflare.com',
  'https://pse-sent.com', 'https://psemanagement.services', 'https://dash.pse-sent.com',
  'https://host.pse-sent.com', 'https://orgsuite-godaddy-health.vercel.app'
]);

async function readBounded(response, maximum) {
  const declared = response.headers.get('content-length');
  if (declared && (!/^\d+$/.test(declared) || Number(declared) > maximum)) throw new HubError(502, 'provider_response_too_large');
  if (!response.body) return Buffer.alloc(0);
  let size = 0;
  const chunks = [];
  for await (const chunk of response.body) {
    size += chunk.length;
    if (size > maximum) {
      throw new HubError(502, 'provider_response_too_large');
    }
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

export function createHttp({ fetchImpl = globalThis.fetch, timeoutMs = 8000 } = {}) {
  async function request(value, options = {}, inspect = false) {
    const url = new URL(value);
    if (!PROVIDERS.has(url.origin) || url.username || url.password) throw new HubError(400, 'provider_origin_denied');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetchImpl(url, { method: options.method || 'GET', headers: options.headers,
        body: options.body, redirect: 'error', signal: controller.signal });
      const data = await readBounded(response, options.maxBytes || 1024 * 1024);
      if (!inspect && !response.ok) {
        if (response.status === 401) throw new HubError(401, 'authorization_required');
        if (response.status === 403) throw new HubError(403, 'insufficient_scope');
        if (response.status === 429) throw new HubError(503, 'provider_rate_limited');
        throw new HubError(502, 'provider_request_failed');
      }
      return { status: response.status, mimeType: response.headers.get('content-type') || 'application/octet-stream', data };
    } catch (error) {
      if (error instanceof HubError) throw error;
      throw new HubError(502, 'provider_unavailable');
    } finally { clearTimeout(timeout); }
  }
  return {
    async json(url, options) {
      const response = await request(url, options);
      try { return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(response.data)); }
      catch { throw new HubError(502, 'provider_invalid_response'); }
    },
    async bytes(url, options) { return request(url, options); },
    async probe(url) {
      const response = await request(url, { maxBytes: 64 * 1024 }, true);
      let body = null;
      if (/application\/json/i.test(response.mimeType)) {
        try { body = JSON.parse(response.data.toString('utf8')); } catch {}
      }
      return { status: response.status, body };
    }
  };
}
