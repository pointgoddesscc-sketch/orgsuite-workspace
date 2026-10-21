#!/usr/bin/env node
/** Fail-closed checks for OrgSuite Hub Meta gate. No network. No secrets. */

function formatCheck(key, raw) {
  const value = String(raw || "").trim();
  if (!value) return { key, state: "Missing", valid: false };
  if (key === "META_APP_ID" && !/^\d{6,20}$/.test(value)) return { key, state: "Invalid format", valid: false };
  if (key === "META_REDIRECT_URI") {
    try {
      const u = new URL(value);
      if (u.protocol !== "https:") return { key, state: "Invalid format", valid: false };
    } catch {
      return { key, state: "Invalid format", valid: false };
    }
  }
  if (key === "META_PAGE_ID" && !/^\d{6,20}$/.test(value)) return { key, state: "Invalid format", valid: false };
  return { key, state: "Configured", valid: true };
}

function ingestGraphPage(payload, intended = "OrgSuite Hub") {
  if (!payload || payload.source !== "graph") return { ok: false };
  if (!/^\d{6,20}$/.test(String(payload.id || ""))) return { ok: false };
  if (String(payload.name || "") !== intended) return { ok: false };
  return { ok: true };
}

const cases = [
  ["missing app id", formatCheck("META_APP_ID", "").state === "Missing"],
  ["invalid app id", formatCheck("META_APP_ID", "abc").state === "Invalid format"],
  ["valid app id shape", formatCheck("META_APP_ID", "123456789012").state === "Configured"],
  ["http redirect rejected", formatCheck("META_REDIRECT_URI", "http://example.com/cb").state === "Invalid format"],
  ["https redirect accepted", formatCheck("META_REDIRECT_URI", "https://example.com/cb").state === "Configured"],
  ["missing page id", formatCheck("META_PAGE_ID", "").state === "Missing"],
  ["reject user paste as verified", ingestGraphPage({ id: "123456789012", name: "OrgSuite Hub" }).ok === false],
  ["accept graph payload", ingestGraphPage({ source: "graph", id: "123456789012", name: "OrgSuite Hub" }).ok === true],
  ["reject wrong name", ingestGraphPage({ source: "graph", id: "123456789012", name: "Org suite hub" }).ok === false],
  ["empty preview env", !process.env.META_APP_ID && !process.env.META_REDIRECT_URI && !process.env.META_PAGE_ID]
];

let failed = 0;
for (const [name, ok] of cases) {
  if (!ok) {
    failed += 1;
    console.error("FAIL", name);
  } else {
    console.log("PASS", name);
  }
}

if (failed) process.exit(1);
console.log("OK", cases.length, "checks");
