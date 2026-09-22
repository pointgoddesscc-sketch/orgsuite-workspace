# OrgSuite Workspace

**OrgSuite** is the unified workplace ecosystem for Point Goddess CC / PSE Management.

It connects multi-AI work (Grok, ChatGPT/Codex, Copilot), official connectors, secure domain operations, and device workflows into one command center.

## Live Surfaces

| Surface | URL |
|---------|-----|
| Primary production domain | https://pse-sent.com |
| MCP gateway | https://mcp.pse-sent.com/api/mcp |
| Codex Command Center | https://orgsuite-codex-command-center.vercel.app |
| Unified AI hub | https://orgsuite-command-center.vercel.app |
| Public / SEO site | https://orgsuite-public.vercel.app |

**Source of truth:** this repository  
**Linear project:** [OrgSuite Codex App](https://linear.app/pse-management/project/orgsuite-codex-app-9146b449b7a1)  
**Vercel team:** PSE SENT

---

## Current Status — 2026-09-22

This date is a **docs closeout on `main`** from a Linear + GitHub session. Vendor secrets were not written.

### Tier 1 — Production Core (priority)

| Item | Status | Linear |
|------|--------|--------|
| pse-sent.com Cloudflare zone + DNS | **Done** | PSE-81 |
| Production AI Workplace (OAuth 2.1 + MCP gateway + connector registry) | In Progress | PSE-86 |
| Secured Workplace (identity, secrets, least privilege, audit) | Done | PSE-77 |
| Cloudflare dashboard (`dash.pse-sent.com`) | Done | PSE-98 |
| Cloudflare edge host (`host.pse-sent.com`) | In Progress | PSE-97 |

### Tier 2 — Connectors (this session)

| Connector | Status | Linear |
|-----------|--------|--------|
| Linear + GitHub | **Connected** | live this session |
| Meta (Facebook / Messenger / Business Suite / AI Router) | Code Done / login owner | PSE-99 |
| Google + Microsoft cloud storage mount | Docs Done / native owner | PSE-100 |
| GoDaddy account DNS | Requires Authorization | PSE-16 |
| Twilio PIP | Requires Authorization | PSE-128 |
| Firebase workplace connector | Requires Authorization | PSE-102 |
| ASC MCP (App Store Connect) | Requires Authorization | PSE-73 |
| Official Meta MCP servers → Grok | In Progress | PSE-95 |
| Apple Account workplace bind | Requires Authorization | PSE-101 |
| Telegram MCP arming | Requires Authorization | PSE-87 |
| WhatsApp / Meta as OrgSuite destination | In Progress / atRisk | destination project |

### Tier 3 — Features & Surfaces

| Feature | Status | Notes |
|---------|--------|-------|
| PSE Bank demo platform | In Progress | PSE-93 |
| World Cup match centre | Backlog / deployed | PSE-91 / PSE-92 |
| Calendar as main feature + Siri bridge | Backlog | PSE-43 |
| Radio / Podcast / News Station | Backlog | PSE-50 / PSE-51 |
| Public findability | In Progress | PSE-69 |

Full connector matrix: [`docs/connectors-status.md`](docs/connectors-status.md)  
Workplace status: [`docs/workplace-status.md`](docs/workplace-status.md)  
Full repository index: [`docs/workplace-index.md`](docs/workplace-index.md)

---

## Recommended Daily Order of Work

1. **Owner keys** (GoDaddy PAT, Twilio PIP, GitLab PIP, PSE-46 secret rotate)
2. **Security & production core** (PSE-86, Firebase, Telegram MCP)
3. **Mail & identity** (PSE-96 Proton MX, Apple bind)
4. **Feature surfaces** (Bank, Calendar, Radio)
5. **Backlog / polish**

---

## Quick Start – Working Copy (iPhone / Android)

1. Clone: `https://github.com/pointgoddesscc-sketch/orgsuite-workspace.git`
2. Set identity once:
   - Name: `Point Goddess CC`
   - Email: `pointgoddesscc@gmail.com`
3. Daily: Pull → work → Commit → Push → (PR if on feature branch)

**Never force-push to `main`.**

---

## Quick Start – ChatGPT Codex / Grok

- This repository is the designated primary hub.
- Follow `AGENTS.md` and everything under `docs/`.
- Prefer feature branches + Pull Requests for code. Docs closeouts may land on `main` when the owner says so.
- Never invent live connectors, credentials, or remote browser control.
- Status labels: **Completed / Connected / Available / Ready to Configure / Proposed / Requires Authorization**.

---

## Key Documentation

| Document | Purpose |
|----------|---------|
| [`AGENTS.md`](AGENTS.md) | Rules for Codex, Grok, and any agent |
| [`docs/connectors-status.md`](docs/connectors-status.md) | Live connector matrix (source of truth) |
| [`docs/workplace-status.md`](docs/workplace-status.md) | Hierarchy + owner actions |
| [`docs/workplace-index.md`](docs/workplace-index.md) | Repository map |
| [`docs/cloud-connectors.md`](docs/cloud-connectors.md) | Cloud storage architecture |
| [`docs/secure-mail-proton-simplelogin.md`](docs/secure-mail-proton-simplelogin.md) | Mail aliases |
| [`PRODUCTION-PSE-SENT.md`](PRODUCTION-PSE-SENT.md) | pse-sent.com notes |
| [`docs/public-findability.md`](docs/public-findability.md) | SEO / public positioning |

---

## Account & Team

- **Email:** pointgoddesscc@gmail.com  
- **GitHub:** pointgoddesscc-sketch  
- **Linear:** PSE Management  
- **Vercel team:** PSE SENT  
- **X:** @PointGoddessCc

This workspace is arranged as the single professional source of truth for OrgSuite.
