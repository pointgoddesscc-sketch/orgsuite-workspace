'use strict';

const MAX_BODY_BYTES = 32 * 1024;
const MAX_ACK_BYTES = 16 * 1024;
const ALLOWED_SERVICES = Object.freeze(['contact', 'game', 'player', 'event', 'meet', 'vip', 'management']);
const FIELDS = ['name', 'email', 'message', 'service', 'id'];

class InquiryError extends Error {
  constructor(status, code) {
    super(code);
    this.name = 'InquiryError';
    this.status = status;
    this.code = code;
  }
}

/** Shared by the public receiver and the authenticated, durable Hub receiver. */
function validateInquiry(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input) ||
      Object.keys(input).length !== FIELDS.length ||
      !FIELDS.every(field => Object.hasOwn(input, field) && typeof input[field] === 'string')) {
    throw new InquiryError(400, 'invalid_inquiry');
  }
  const record = Object.fromEntries(FIELDS.map(field => [field, input[field].trim()]));
  if (!record.name || record.name.length > 160 || /[\u0000-\u001f\u007f]/u.test(record.name) ||
      record.email.length > 254 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/u.test(record.email) ||
      /[\u0000-\u001f\u007f]/u.test(record.email) ||
      !record.message || record.message.length > 8000 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(record.message) ||
      !ALLOWED_SERVICES.includes(record.service) || !/^IFMS-[A-Z0-9]{1,48}$/u.test(record.id)) {
    throw new InquiryError(400, 'invalid_inquiry');
  }
  return record;
}

function isJson(contentType) {
  return typeof contentType === 'string' && /^application\/json(?:\s*;|$)/iu.test(contentType);
}

function declaredSize(headers, maximum) {
  const length = headers['content-length'];
  if (length !== undefined && (!/^\d+$/u.test(String(length)) || Number(length) > maximum)) {
    throw new InquiryError(413, 'body_too_large');
  }
}

async function readJsonBody(req) {
  declaredSize(req.headers, MAX_BODY_BYTES);
  let bytes;
  if (req.body !== undefined) {
    try {
      bytes = Buffer.isBuffer(req.body) ? req.body : Buffer.from(
        typeof req.body === 'string' ? req.body : JSON.stringify(req.body), 'utf8');
    } catch {
      throw new InquiryError(400, 'invalid_json');
    }
  } else {
    bytes = await new Promise((resolve, reject) => {
      const chunks = [];
      let size = 0;
      let settled = false;
      const fail = error => {
        if (settled) return;
        settled = true;
        chunks.length = 0;
        reject(error);
      };
      req.on('data', chunk => {
        if (settled) return; // Drain an oversized request without retaining its body.
        const part = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        size += part.length;
        if (size > MAX_BODY_BYTES) return fail(new InquiryError(413, 'body_too_large'));
        chunks.push(part);
      });
      req.once('end', () => {
        if (!settled) {
          settled = true;
          resolve(Buffer.concat(chunks));
        }
      });
      req.once('error', () => fail(new InquiryError(400, 'invalid_json')));
      req.once('aborted', () => fail(new InquiryError(400, 'invalid_json')));
    });
  }
  if (bytes.length > MAX_BODY_BYTES) throw new InquiryError(413, 'body_too_large');
  try {
    return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
  } catch {
    throw new InquiryError(400, 'invalid_json');
  }
}

function hubConfiguration(env) {
  const origin = env.INQUIRY_HUB_ORIGIN;
  const key = env.ORGSUITE_INQUIRY_INGEST_KEY;
  let url;
  try { url = new URL(origin); } catch { throw new InquiryError(503, 'inquiry_unavailable'); }
  const loopback = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  const developmentHttp = env.NODE_ENV === 'development' && loopback && url.protocol === 'http:';
  if (typeof origin !== 'string' || !/^https?:\/\/[^/?#\\]+\/?$/iu.test(origin) ||
      (url.protocol !== 'https:' && !developmentHttp) || url.username || url.password ||
      url.href !== `${url.origin}/` || typeof key !== 'string' || key.length < 32 || /\s/u.test(key)) {
    throw new InquiryError(503, 'inquiry_unavailable');
  }
  return { endpoint: new URL('/api/internal/inquiries', url).href, key };
}

async function readAcknowledgement(response) {
  if (!response.ok || !isJson(response.headers.get('content-type'))) {
    throw new InquiryError(502, 'inquiry_not_accepted');
  }
  const length = response.headers.get('content-length');
  if (length !== null && (!/^\d+$/u.test(length) || Number(length) > MAX_ACK_BYTES)) {
    throw new InquiryError(502, 'invalid_acknowledgement');
  }
  if (!response.body) throw new InquiryError(502, 'invalid_acknowledgement');
  let size = 0;
  const chunks = [];
  for await (const chunk of response.body) {
    const part = Buffer.from(chunk);
    size += part.length;
    if (size > MAX_ACK_BYTES) throw new InquiryError(502, 'invalid_acknowledgement');
    chunks.push(part);
  }
  try {
    return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(chunks)));
  } catch {
    throw new InquiryError(502, 'invalid_acknowledgement');
  }
}

/** Fixed server-to-server destination; credentials never enter browser code. */
function createHubAcceptor({ env = process.env, fetchImpl = globalThis.fetch, timeoutMs = 8000 } = {}) {
  return async function acceptInquiry(record) {
    const { endpoint, key } = hubConfiguration(env);
    if (typeof fetchImpl !== 'function') throw new InquiryError(503, 'inquiry_unavailable');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetchImpl(endpoint, {
        method: 'POST',
        redirect: 'error',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
        body: JSON.stringify(record)
      });
      const receipt = await readAcknowledgement(response);
      if (!receipt || receipt.ok !== true || receipt.id !== record.id) {
        throw new InquiryError(502, 'invalid_acknowledgement');
      }
      return { ok: true, id: record.id };
    } catch (error) {
      if (error instanceof InquiryError) throw error;
      throw new InquiryError(502, 'inquiry_not_accepted');
    } finally {
      clearTimeout(timeout);
    }
  };
}

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.end(JSON.stringify(body));
}

/** acceptInquiry must resolve {ok:true,id} only after durable acceptance. */
function createInquiryHandler(options = {}) {
  const acceptInquiry = options.acceptInquiry || createHubAcceptor(options);
  return async function inquiryHandler(req, res) {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return json(res, 405, { ok: false, error: 'method_not_allowed' });
    }
    if (!isJson(req.headers['content-type'])) {
      return json(res, 415, { ok: false, error: 'json_required' });
    }
    let record;
    try {
      record = validateInquiry(await readJsonBody(req));
    } catch (error) {
      const failure = error instanceof InquiryError ? error : new InquiryError(400, 'invalid_inquiry');
      return json(res, failure.status, { ok: false, error: failure.code });
    }
    try {
      const receipt = await acceptInquiry(record);
      if (!receipt || receipt.ok !== true || receipt.id !== record.id) {
        throw new InquiryError(502, 'invalid_acknowledgement');
      }
      return json(res, 200, { ok: true, id: record.id });
    } catch (error) {
      const failure = error instanceof InquiryError && [502, 503].includes(error.status)
        ? error : new InquiryError(502, 'inquiry_not_accepted');
      return json(res, failure.status, { ok: false, error: failure.code });
    }
  };
}

module.exports = { ALLOWED_SERVICES, InquiryError, MAX_BODY_BYTES, createHubAcceptor, createInquiryHandler, readJsonBody, validateInquiry };
