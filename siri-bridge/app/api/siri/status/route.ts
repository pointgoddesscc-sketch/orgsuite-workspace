import { NextRequest } from 'next/server';
import { authorize, unauthorized } from '@/lib/auth';
import { getWorkplaceStatus } from '@/lib/linear';

export async function GET(req: NextRequest) {
  if (!authorize(req)) return unauthorized();

  try {
    const status = await getWorkplaceStatus();

    return Response.json({
      ok: true,
      summary: status.summary,
      data: status,
      requires_confirmation: false,
    });
  } catch (err) {
    console.error('Siri status error', err);
    return Response.json(
      { ok: false, error: 'Internal error' },
      { status: 500 }
    );
  }
}
