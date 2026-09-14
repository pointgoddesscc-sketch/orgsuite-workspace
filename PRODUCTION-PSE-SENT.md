# pse-sent.com — Production Domain

Primary OrgSuite production zone.

**Rules**
- Cloudflare Registrar only.
- Do not add a second zone.
- Do not move nameservers to GoDaddy.

## Live Endpoints

| Endpoint | Purpose |
|----------|---------|
| https://pse-sent.com | Primary site |
| https://mcp.pse-sent.com/api/mcp | MCP gateway |
| https://mcp.pse-sent.com/api/health | Health check |
| https://dash.pse-sent.com | Cloudflare dashboard (in progress) |
| https://host.pse-sent.com | Edge host (in progress) |

## Linked Work

- Linear project: **OrgSuite Codex App**
- Key issues: PSE-81 (zone Done), PSE-86 (OAuth + MCP gateway), PSE-82 (Vercel Domains attach — owner action), PSE-98 / PSE-97 (dashboard + edge)

## Vercel

- Team: PSE SENT
- Prefer attaching the domain through official Vercel Domains flow (owner action on PSE-82).

Last arranged: 2026-09-14
