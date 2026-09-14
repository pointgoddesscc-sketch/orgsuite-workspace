# OrgSuite Workplace Status

**Last updated:** 2026-09-14  
**Primary hub:** [orgsuite-workspace](https://github.com/pointgoddesscc-sketch/orgsuite-workspace)  
**Linear project:** [OrgSuite Codex App](https://linear.app/pse-management/project/orgsuite-codex-app-9146b449b7a1)

---

## Hierarchy

```
OrgSuite
├── Production Core (pse-sent.com)
│   ├── Domain + Cloudflare zone          ✅ Done (PSE-81)
│   ├── Secured Workplace baseline        ✅ Done (PSE-77)
│   ├── Cloudflare dashboard              ✅ Done (PSE-98)
│   ├── MCP Gateway + OAuth 2.1           🔄 In Progress (PSE-86)
│   └── Connector Registry                🔄 Live, hardening open
├── Connectors
│   ├── Meta                              ✅ Done (PSE-99)
│   ├── Google + Microsoft cloud storage  ✅ Done (PSE-100)
│   ├── Firebase                          ⏳ Requires Authorization (PSE-102)
│   ├── Apple / ASC MCP                   ⏳ Requires Authorization (PSE-73)
│   ├── Telegram MCP                      ⏳ Requires Authorization (PSE-87)
│   └── Mail (Proton path)                ⏳ Requires Authorization (PSE-96)
├── Command Surfaces
│   ├── Codex / Workplace app             ✅ Live
│   └── Cloud Storage / Mail Host pages   ✅ Present
└── Feature Products
    ├── PSE Bank demo                     🔄 In Progress (PSE-93)
    ├── Calendar + Siri                   📋 Backlog
    └── Radio / Podcast / News            📋 Backlog
```

---

## Production Core

| Item | Status | Issue |
|------|--------|-------|
| pse-sent.com zone | **Completed** | PSE-81 |
| Secured Workplace baseline | **Completed** | PSE-77 |
| Cloudflare dashboard (`dash.pse-sent.com`) | **Completed** | PSE-98 |
| OAuth 2.1 + MCP gateway + registry | **In Progress** | PSE-86 |
| Cloudflare edge host (`host.pse-sent.com`) | In Progress | PSE-97 |
| Vercel domain attach | Requires Authorization | PSE-82 |

Live probes (2026-09-14):
- `pse-sent-workplace.vercel.app` → 200, health ok
- `dash.pse-sent.com` → 200
- `mcp.pse-sent.com/api/health` → ready:false (Telegram env missing)
- ASC MCP host → Completed; Apple API Requires Authorization

---

## Connectors — honest status

| Connector | Status | Blocker |
|-----------|--------|---------|
| Meta | **Completed** | — |
| Google + Microsoft cloud | **Completed** | Native Drive MCP still optional |
| Gmail / Outlook / Calendar / Linear / GitHub / Vercel / Notion / Canva / Stripe | **Connected** | — |
| Firebase | **Requires Authorization** | Owner must set `FIREBASE_*` on Vercel `pse-sent-workplace` |
| ASC MCP | **Requires Authorization** | Owner must set App Store Connect Issuer ID / Key ID / .p8 |
| Telegram MCP | **Requires Authorization** | Owner must set Telegram + KV + OAuth env on `pse-sent-telegram-mcp` |
| Apple Account bind | **Requires Authorization** | Accept iCloud T&Cs on device + Developer keys |
| Proton MX | **Requires Authorization** | Owner must add domain + addresses in Proton first |

---

## Owner actions required (cannot be done from Grok)

### High priority
1. **PSE-102 Firebase** — Vercel project `pse-sent-workplace` → Production env → paste `FIREBASE_*` service account vars → redeploy → confirm `/api/firebase/health` shows connected.
2. **PSE-73 ASC MCP** — Vercel project `orgsuite-asc-mcp` → set `APP_STORE_CONNECT_ISSUER_ID`, `APP_STORE_CONNECT_KEY_ID`, `APP_STORE_CONNECT_PRIVATE_KEY` → redeploy → paste MCP URL into Grok Custom Connector.
3. **PSE-87 Telegram MCP** — Vercel project `pse-sent-telegram-mcp` → set Telegram API ID/Hash, session encryption, cookie secret, KV, OAuth issuer/audience → redeploy until health `ready: true`.
4. **PSE-46** — Rotate the exposed Cloudflare Realtime secret (critical).

### Medium priority
5. **PSE-96 Proton** — Add `pse-sent.com` in Proton Mail domain settings, create addresses, then allow MX cutover.
6. **PSE-101 Apple** — Accept pending iCloud Terms on the signed-in iPhone.
7. **PSE-82** — Attach `pse-sent.com` in Vercel Domains (owner UI).

---

## Recommended next execution order

1. Owner clears the high-priority Requires Authorization items above.
2. Finish PSE-86 OAuth hardening (jwtMode off preview-fallback).
3. Close PSE-97 edge host if still needed.
4. Only then advance feature surfaces (Bank, Calendar, Radio).

---

## Rules

- Status labels: **Completed / Connected / Available / Ready to Configure / Proposed / Requires Authorization**
- Never mark Connected without a live probe in that session
- Secrets only in Vercel / Cloudflare / Apple env — never in git, Linear, or chat

**Maintainer:** Point Goddess CC · **Team:** PSE Management
