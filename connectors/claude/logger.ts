/**
 * Minimal structured logger stub for the Claude client.
 * Replace with your OrgSuite / pino / winston logger in production.
 */

type LogLevel = "info" | "warn" | "error" | "debug";

function log(level: LogLevel, meta: Record<string, unknown> | string, msg?: string) {
  const payload =
    typeof meta === "string"
      ? { level, msg: meta, ts: new Date().toISOString() }
      : { level, ...meta, msg, ts: new Date().toISOString() };
  // In production: send to your logging backend (no secrets, no full prompts)
  console[level === "debug" ? "log" : level](JSON.stringify(payload));
}

export function createLogger(name: string) {
  return {
    info: (meta: Record<string, unknown> | string, msg?: string) =>
      log("info", typeof meta === "string" ? meta : { ...meta, component: name }, msg),
    warn: (meta: Record<string, unknown> | string, msg?: string) =>
      log("warn", typeof meta === "string" ? meta : { ...meta, component: name }, msg),
    error: (meta: Record<string, unknown> | string, msg?: string) =>
      log("error", typeof meta === "string" ? meta : { ...meta, component: name }, msg),
    debug: (meta: Record<string, unknown> | string, msg?: string) =>
      log("debug", typeof meta === "string" ? meta : { ...meta, component: name }, msg),
  };
}
