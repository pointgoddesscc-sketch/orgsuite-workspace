import { NextRequest, NextResponse } from "next/server";
import { getServerClient, sanitizeAccount } from "@/lib/pipedream";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const externalUserId =
    request.nextUrl.searchParams.get("external_user_id") ||
    process.env.NEXT_PUBLIC_EXTERNAL_USER_ID;

  if (!externalUserId) {
    return NextResponse.json({ error: "external_user_id is required" }, { status: 400 });
  }

  try {
    const client = getServerClient();
    const result = await client.accounts.list({ externalUserId });
    const raw = Array.isArray(result) ? result : ((result as { data?: unknown[] }).data ?? []);
    return NextResponse.json({
      accounts: raw.map((account) => sanitizeAccount(account as Parameters<typeof sanitizeAccount>[0])),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "List failed";
    console.error("Pipedream accounts list error:", message);
    return NextResponse.json({ error: "Failed to list connected accounts." }, { status: 502 });
  }
}
