# OrgSuite Agent – simmple-login

**Repository:** https://github.com/pointgoddesscc-sketch/simmple-login (private)  
**Status:** Available – Cloudflare Workers AI agent  
**Role:** Official OrgSuite Agent for Point Goddess CC / PSE Management

This document makes `simmple-login` a first-class citizen of the **orgsuite-workspace** hub.

---

## Purpose

Professional streaming chat agent powered by Cloudflare Workers AI.

| Endpoint | Purpose |
|----------|--------|
| `POST /api/chat` | Streaming OrgSuite agent chat |
| `GET /api/health` | Health check |
| `GET /api/status` | Workspace status overview |

**Model:** `@cf/meta/llama-3.1-8b-instruct-fp8`

---

## Key capabilities (from source)

- Dark professional UI (`public/index.html` + `public/chat.js`)
- OrgSuite system prompt (workspace, security-conscious, no credential collection)
- Workspace status API that reports:
  - Hub: orgsuite-workspace
  - Slack bot: configured
  - Stripe dashboard: configured
  - Marketing page: vercel-ready
  - Agent: online
  - Security: no cookies; secrets via environment variables only
- Deployable via Wrangler (`npm run deploy`)

---

## Relationship to this hub

| Item | Location |
|------|----------|
| Source of truth for agent code | `simmple-login` repo |
| Documentation & workflow hub | **this repository** (`orgsuite-workspace`) |
| Secure mail context | `docs/secure-mail-proton-simplelogin.md` |
| Connectors status | `docs/connectors-status.md` |

The agent is designed to answer questions about the workspace, Slack, Stripe, marketing page, and professional workflows. It refuses to collect or store passwords/API keys.

---

## Local development & deploy (owner side)

```bash
npm install
npm run dev          # http://localhost:8787
npm run deploy       # Cloudflare Workers
```

Requires:
- Cloudflare account with Workers AI enabled
- `npx wrangler login` (once)

Secrets stay in Cloudflare dashboard / environment bindings only.

---

## Security posture

- No passwords, session cookies, or API secrets in the repository
- Agent system prompt explicitly refuses credential collection
- Aligns with OrgSuite least-privilege and secret-management rules

---

**Account:** pointgoddesscc@gmail.com  
**GitHub:** pointgoddesscc-sketch/simmple-login  
**Hub integration date:** 2026-08-15
