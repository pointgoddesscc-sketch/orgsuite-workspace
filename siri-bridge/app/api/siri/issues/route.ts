import { NextRequest } from 'next/server';
import { authorize, unauthorized } from '@/lib/auth';
import { prepareIssue } from '@/lib/linear';

/**
 * Create-issue endpoint.
 * Always returns requires_confirmation: true so Siri AI / Shortcuts
 * must ask the user before any write is performed.
 */
export async function POST(req: NextRequest) {
  if (!authorize(req)) return unauthorized();

  try {
    const body = await req.json().catch(() => ({}));
    const title = String(body.title || 'Siri-created issue').slice(0, 200);
    const description = String(body.description || '').slice(0, 4000);
    const priority = typeof body.priority === 'number' ? body.priority : 3;

    const draft = await prepareIssue({ title, description, priority });

    return Response.json({
      ok: true,
      summary: `Ready to create Linear issue: "${draft.title}". Confirm to proceed.`,
      data: draft,
      requires_confirmation: true,
    });
  } catch (err) {
    console.error('Siri issues error', err);
    return Response.json(
      { ok: false, error: 'Internal error' },
      { status: 500 }
    );
  }
}
