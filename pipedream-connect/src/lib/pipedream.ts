import { PipedreamClient } from "@pipedream/sdk";

export const PIPEDREAM_PROJECT_ID = "proj_qzsEmM9";
export const PIPEDREAM_ENVIRONMENT = "development" as const;

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set. Copy .env.example to .env.local.`);
  }
  return value;
}

function parseAllowedOrigins(): string[] {
  const raw = process.env.PIPEDREAM_ALLOWED_ORIGINS ?? '["http://localhost:3000"]';
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((item) => typeof item === "string");
    }
  } catch {
    return raw.split(",").map((item) => item.trim()).filter(Boolean);
  }
  return ["http://localhost:3000"];
}

export function getServerClient(): PipedreamClient {
  const projectId = process.env.PIPEDREAM_PROJECT_ID || PIPEDREAM_PROJECT_ID;
  const environment =
    (process.env.PIPEDREAM_PROJECT_ENVIRONMENT as "development" | "production" | undefined) ||
    PIPEDREAM_ENVIRONMENT;

  if (environment !== "development" && environment !== "production") {
    throw new Error("PIPEDREAM_PROJECT_ENVIRONMENT must be development or production");
  }

  return new PipedreamClient({
    projectId,
    projectEnvironment: environment,
    clientId: requiredEnv("PIPEDREAM_CLIENT_ID"),
    clientSecret: requiredEnv("PIPEDREAM_CLIENT_SECRET"),
  });
}

export function getAllowedOrigins(): string[] {
  return parseAllowedOrigins();
}

export function sanitizeAccount(account: {
  id?: string;
  name?: string | null;
  healthy?: boolean;
  dead?: boolean;
  app?: { name?: string; nameSlug?: string; imgSrc?: string } | null;
}) {
  return {
    id: account.id ?? null,
    name: account.name ?? null,
    healthy: account.healthy ?? null,
    dead: account.dead ?? null,
    appName: account.app?.name ?? null,
    appSlug: account.app?.nameSlug ?? null,
    appImg: account.app?.imgSrc ?? null,
  };
}
