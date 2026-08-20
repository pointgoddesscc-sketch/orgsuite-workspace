import { NextRequest } from 'next/server';

/**
 * Simple Bearer token check against ORGSUITE_SIRI_API_KEY.
 * The key must be set in Vercel environment variables.
 * Never hard-code secrets.
 */
export function authorize(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization');
  const expected = process.env.ORGSUITE_SIRI_API_KEY;

  if (!expected || expected.length < 32) {
    // Fail closed if the secret is missing or too weak
    return false;
  }

  return authHeader === `Bearer ${expected}`;
}

export function unauthorized() {
  return Response.json(
    { ok: false, error: 'Unauthorized' },
    { status: 401 }
  );
}
