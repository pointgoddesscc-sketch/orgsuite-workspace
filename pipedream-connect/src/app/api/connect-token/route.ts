import { NextRequest, NextResponse } from "next/server";
import { getAllowedOrigins, getServerClient } from "@/lib/pipedream";

export const runtime = "nodejs";
const MAX_EXTERNAL_USER_ID = 250;

function originAllowed(origin: string | null): boolean {
  if (!origin) return true;
  return getAllowedOrigins().includes(origin);
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!originAllowed(origin)) {
    return NextResponse.json({ error: "Origin not allowed" }, { status: 403 });
  }

  let body: { external_user_id?: string } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const externalUserId =
    body.external_user_id?.trim() || process.env.NEXT_PUBLIC_EXTERNAL_USER_ID || "";

  if (!externalUserId) {
    return NextResponse.json({ error: "external_user_id is required" }, { status: 400 });
  }
  if (externalUserId.length > MAX_EXTERNAL_USER_ID) {
    return NextResponse.json({ error: "external_user_id exceeds 250 characters" }, { status: 400 });
  }

  try {
    const client = getServerClient();
    const token = await client.tokens.create({
      externalUserId,
      allowedOrigins: getAllowedOrigins(),
    });
    return NextResponse.json({
      token: token.token,
      expiresAt: token.expiresAt,
      connectLinkUrl: token.connectLinkUrl ?? null,
      projectId: process.env.PIPEDREAM_PROJECT_ID || "proj_qzsEmM9",
      environment: process.env.PIPEDREAM_PROJECT_ENVIRONMENT || "development",
      externalUserId,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Token create failed";
    console.error("Pipedream Connect token error:", message);
    return NextResponse.json({
      error: "Failed to create Connect token. Confirm PIPEDREAM_CLIENT_ID, PIPEDREAM_CLIENT_SECRET, and project proj_qzsEmM9.",
    }, { status: 502 });
  }
}
