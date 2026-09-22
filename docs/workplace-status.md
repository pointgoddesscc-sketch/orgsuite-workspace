# OrgSuite Workplace Status

**Last updated:** 2026-09-22 23:55 WAT  
**Primary hub:** [orgsuite-workspace](https://github.com/pointgoddesscc-sketch/orgsuite-workspace)  
**Linear project:** [OrgSuite Codex App](https://linear.app/pse-management/project/orgsuite-codex-app-9146b449b7a1)  
**Destination project:** [Add WhatsApp Business / Meta AI as Orgsuite destination](https://linear.app/pse-management/project/add-whatsapp-business-meta-ai-as-orgsuite-destination-343283c7be02)

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
│   ├── Linear + GitHub                   ✅ Connected (this session)
│   ├── Meta                              ✅ Code done (PSE-99); Page login still owner
│   ├── Google + Microsoft cloud storage  ✅ Docs done (PSE-100); native Drive/OneDrive owner
│   ├── GoDaddy account DNS               ⏳ Requires Authorization (PSE-16)
│   ├── Twilio PIP                        ⏳ Requires Authorization (PSE-128)
│   ├── GitLab PIP                        ⏳ Requires Authorization
│   ├── Firebase                          ⏳ Requires Authorization (PSE-102)
│   ├── Apple / ASC MCP                   ⏳ Requires Authorization (PSE-73)
│   ├── Telegram MCP                      ⏳ Requires Authorization (PSE-87)
│   └── Mail (Proton path)                ⏳ Requires Authorization (PSE-96)
├── Command Surfaces
│   ├── Codex / Workplace app             ✅ Live
│   └── Cloud Storage / Mail Host pages   ✅ Present
└── Feature Products
    ├── WhatsApp / Meta as destination    🔄 In Progress / atRisk
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

---

## Connectors — honest status (2026-09-22 session)

| Connector | Status | Blocker |
|-----------|--------|---------|
| Linear | **Connected** | — |
| GitHub | **Connected** | — |
| Gmail / Outlook / Calendar / Vercel / Notion / Canva / Stripe / Make / Cloudflare | **Connected** | Prior probes; automations still active |
| GoDaddy public suggest | **Available** | Search only |
| GoDaddy account DNS | **Requires Authorization** | Set `GODADDY_PAT` on Vercel `orgsuite-godaddy-mcp` |
| Twilio PIP | **Requires Authorization** | Invalid username |
| GitLab PIP | **Requires Authorization** | Pipedream reconnect |
| Telegram MCP | **Requires Authorization** | Token + KV on Vercel |
| Firebase | **Requires Authorization** | `FIREBASE_*` on `pse-sent-workplace` |
| ASC MCP | **Requires Authorization** | App Store Connect keys |
| Microsoft Teams | **Requires Authorization** | Graph 401 |
| Native Drive / OneDrive | **Requires Authorization** | Owner Grok cards |

Full matrix: [`docs/connectors-status.md`](connectors-status.md)

---

## Owner actions required (cannot be done from Grok)

### High priority
1. **PSE-16 GoDaddy** — Vercel `orgsuite-godaddy-mcp` → Production env → `GODADDY_PAT` → redeploy → health ok:true.
2. **PSE-128 Twilio** — Reconnect Twilio inside Pipedream. Do not paste SID/token in chat.
3. **GitLab PIP** — Reconnect GitLab in Pipedream.
4. **PSE-46** — Rotate the exposed Cloudflare Realtime secret.
5. **PSE-102 Firebase** — `FIREBASE_*` on `pse-sent-workplace` → redeploy → `/api/firebase/health` connected.
6. **PSE-87 Telegram MCP** — Telegram + KV + OAuth env until health `ready: true`.

### Medium priority
7. **PSE-73 ASC MCP** — App Store Connect Issuer / Key / .p8 on `orgsuite-asc-mcp`.
8. **PSE-96 Proton** — Add domain + addresses, then MX cutover.
9. **PSE-101 Apple** — Accept pending iCloud Terms on device.
10. **PSE-82** — Attach domain in Vercel UI.

---

## Rules

- Status labels: **Completed / Connected / Available / Ready to Configure / Proposed / Requires Authorization**
- Never mark Connected without a live probe in that session
- Secrets only in Vercel / Cloudflare / Apple env — never in git, Linear, or chat

**Maintainer:** Point Goddess CC · **Team:** PSE Management
