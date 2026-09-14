# OrgSuite Workplace Status

**Last arranged:** 2026-09-14  
**Primary hub:** [orgsuite-workspace](https://github.com/pointgoddesscc-sketch/orgsuite-workspace)  
**Linear project:** [OrgSuite Codex App](https://linear.app/pse-management/project/orgsuite-codex-app-9146b449b7a1)

This document is the arranged view of what is live, what is in flight, and the recommended order of work.

---

## Hierarchy (how the workplace is supposed to be structured)

```
OrgSuite
├── Production Core (pse-sent.com)
│   ├── Domain + Cloudflare zone
│   ├── MCP Gateway + OAuth 2.1
│   ├── Connector Registry
│   └── Security / Identity / Audit
├── Connectors
│   ├── Meta (Facebook / Messenger / WhatsApp path)
│   ├── Google + Microsoft cloud storage
│   ├── Firebase
│   ├── Apple / ASC
│   ├── Telegram
│   └── Mail (Proton / SimpleLogin)
├── Command Surfaces
│   ├── Codex Command Center
│   ├── Scoopz Command Center
│   └── Cloud Storage / Mail Host pages
└── Feature Products
    ├── PSE Bank demo
    ├── Calendar + Siri bridge
    ├── Radio / Podcast / News
    └── World Cup / event desks
```

---

## Current Snapshot

### Production Core

| Item | Status | Owner issue |
|------|--------|-------------|
| pse-sent.com zone live on Cloudflare | **Completed** | PSE-81 |
| Vercel attach + DNS | Partially complete | PSE-82 (owner action) |
| OAuth 2.1 + MCP gateway + registry | In Progress | PSE-86 |
| Secured Workplace (identity, secrets, least privilege) | In Review | PSE-77 |
| Cloudflare dashboard (dash.pse-sent.com) | In Progress | PSE-98 |
| Cloudflare edge host (host.pse-sent.com) | In Progress | PSE-97 |

### Connectors

| Connector | Status | Issue |
|-----------|--------|-------|
| Meta (FB / Messenger / Business Suite / AI Router) | **Completed** | PSE-99 |
| Google Drive + OneDrive workplace mount | **Completed** | PSE-100 |
| Gmail / Outlook / Calendar / Linear / GitHub / Vercel / Notion / Canva / Stripe | **Connected** | See connectors-status.md |
| Firebase workplace connector | In Progress | PSE-102 |
| ASC MCP (App Store Connect) | In Progress | PSE-73 |
| SimpleLogin MCP | In Progress | PSE-83 |
| Official Meta MCP servers → Grok | In Progress | PSE-95 |
| Apple Account bind | In Progress | PSE-101 |
| Telegram MCP | In Progress | PSE-87 |
| Proton MX (blocked by iCloud) | In Progress | PSE-96 |

### Features

| Feature | Status | Issue |
|---------|--------|-------|
| PSE Bank demo | In Progress | PSE-93 |
| World Cup match centre | Deployed / Backlog cleanup | PSE-91, PSE-92 |
| Calendar main feature + Siri | Backlog | PSE-43 |
| Radio / Podcast / News Station | Backlog | PSE-50, PSE-51 |
| Public findability | In Progress | PSE-69 |

---

## Recommended Execution Order

1. **Close security and production gaps**
   - Finish PSE-77 (In Review → Done)
   - Advance PSE-86 (MCP + OAuth registry)
   - Resolve any open critical secrets (PSE-46)

2. **Finish active connector work**
   - Firebase (PSE-102)
   - ASC MCP + Apple keys (PSE-73)
   - Telegram MCP ready=true (PSE-87)
   - Cloudflare surfaces (PSE-98, PSE-97)

3. **Mail & identity cleanup**
   - PSE-96 (Proton MX path)
   - PSE-101 (Apple Account)

4. **Feature surfaces**
   - PSE Bank (PSE-93)
   - Calendar (PSE-43)
   - Radio / News when capacity allows

5. **Backlog hygiene**
   - Close or re-scope stale Backlog items that no longer match current architecture

---

## Rules of Arrangement

- Status labels must be honest: **Completed / Connected / Available / Ready to Configure / Proposed / Requires Authorization**.
- Never mark a connector Connected unless an official authenticated path exists.
- This repository remains the single documentation hub.
- Linear remains the single source of truth for work tracking.
- All production secrets stay in Vercel / Cloudflare / Apple environment variables — never in git.

---

**Maintainer:** Point Goddess CC  
**Team:** PSE Management
