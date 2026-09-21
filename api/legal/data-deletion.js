/**
 * OrgSuite Meta data-deletion callback stub.
 * Status: Ready to Configure. Does not verify signed_request until META_APP_SECRET
 * is present in the host environment. Never log or return the secret.
 *
 * Vercel: api/legal/data-deletion.js
 * Meta App Dashboard → Settings → Advanced → Data Deletion Request URL
 */

const crypto = require('crypto');

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) return resolve({});
      try {
        if ((req.headers['content-type'] || '').includes('application/json')) {
          return resolve(JSON.parse(raw));
        }
        return resolve(Object.fromEntries(new URLSearchParams(raw)));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function confirmationCode() {
  return crypto.randomBytes(16).toString('hex');
}

module.exports = async function handler(req, res) {
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const base = `${proto}://${host}`;

  if (req.method === 'GET') {
    const url = new URL(req.url, base);
    const id = url.searchParams.get('id') || url.searchParams.get('confirmation_code');
    if (!id) {
      return json(res, 200, {
        service: 'orgsuite-meta-data-deletion',
        status: 'ready_to_configure',
        live_verification: false,
        hint: 'POST signed_request from Meta. GET ?id=confirmation_code for status.',
      });
    }
    return json(res, 200, {
      status: 'pending',
      confirmation_code: id,
      note: 'Stub only. Wire a real deletion job after META_APP_SECRET is on the host.',
    });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return json(res, 405, { error: 'method_not_allowed' });
  }

  let body;
  try {
    body = await parseBody(req);
  } catch {
    return json(res, 400, { error: 'invalid_body' });
  }

  const signed = body.signed_request;
  const secret = process.env.META_APP_SECRET;
  if (!signed) {
    return json(res, 400, {
      error: 'missing_signed_request',
      live_verification: false,
    });
  }
  if (!secret) {
    const code = confirmationCode();
    return json(res, 202, {
      url: `${base}/api/legal/data-deletion?id=${code}`,
      confirmation_code: code,
      status: 'accepted_unverified',
      note: 'META_APP_SECRET is not set. Request queued as stub only.',
    });
  }

  const code = confirmationCode();
  return json(res, 200, {
    url: `${base}/api/legal/data-deletion?id=${code}`,
    confirmation_code: code,
    status: 'accepted_pending_verify_implementation',
  });
};
