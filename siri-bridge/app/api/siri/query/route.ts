import { NextRequest } from 'next/server';
import { authorize, unauthorized } from '@/lib/auth';
import { runNaturalQuery } from '@/lib/linear';

export async function POST(req: NextRequest) {
  if (!authorize(req)) return unauthorized();

  try {
    const body = await req.json().catch(() => ({}));
    const query = String(body.query || '').slice(0, 500);

    if (!query) {
      return Response.json(
        { ok: false, error: 'query is required' },
        { status: 400 }
      );
    }

    const result = await runNaturalQuery(query);

    return Response.json({
      ok: true,
      summary: result.summary,
      data: result,
      requires_confirmation: false,
    });
  } catch (err) {
    console.error('Siri query error', err);
    return Response.json(
      { ok: false, error: 'Internal error' },
      { status: 500 }
    );
  }
}
