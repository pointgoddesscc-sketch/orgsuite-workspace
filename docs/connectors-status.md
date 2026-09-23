# Connectors Status – OrgSuite Workspace

Workplace source of truth. Host: GitHub `pointgoddesscc-sketch/orgsuite-workspace` (PSE SENT Vercel team for linked projects).

**Rule:** Status is Connected only when an official connector or verified forward exists. Saying “it is ours” does not create a vendor API session.

Official Grok **chat** login: [grok.com](https://grok.com). That is vendor. Workplace public URLs are **pse-sent.com** and PSE SENT Vercel. `grok.me` is not an OrgSuite host.

Linear checklist twin: [OrgSuite Connector Rollout Checklist & Status](https://linear.app/pse-management/document/orgsuite-connector-rollout-checklist-and-status-2f33b168b2b9)

Canonical host list: [`docs/canonical-hosts.md`](canonical-hosts.md)

## Sweep 2026-09-23 04:16 WAT

Owner asked to remove grok.me from workplace paper. Live identity: GitHub `pointgoddesscc-sketch`, Linear workspace PSE Management.

| Connector | Status | Notes |
|-----------|--------|-------|
| Linear | Connected | Workspace PSE Management |
| GitHub | Connected | `pointgoddesscc-sketch` (72 public repos). |
| Gmail | Connected | Verified this week |
| Outlook | Connected | Verified this week |
| Google Calendar | Connected | Prior verified |
| Google Drive (PIP) | Connected | Prior verified |
| Google Drive (native MCP) | Requires Authorization | First-party Drive card not completed |
| OneDrive / Graph Files | Requires Authorization | Outlook mail ≠ Files.ReadWrite.All |
| Calendly | Connected | Prior verified |
| Vercel | Connected | Team PSE SENT. GoDaddy MCP still missing `GODADDY_PAT` |
| Notion | Connected | Prior verified |
| Figma | Connected | Prior verified |
| Canva | Connected | Prior verified |
| Stripe | Connected | Prior verified |
| Make | Connected | Prior verified |
| Cloudflare | Connected | Prior verified |
| Microsoft Teams | Requires Authorization | Prior Graph 401 |
| GoDaddy public suggest/availability | Available | Official MCP search only |
| GoDaddy account DNS (`orgsuite-godaddy-mcp`) | Requires Authorization | Health `keys_missing` |
| Twilio (PIP) | Requires Authorization | invalid username |
| GitLab (PIP) | Requires Authorization | Pipedream reconnect |
| Telegram bot | Requires Authorization | See PSE-87 |
| Automations (Grok) | Connected | Jobs exist; vendor keys still the break |
| Google Contacts | Requires Authorization | Auth card unavailable this session |

## Hosting we own

- https://pse-sent.com
- https://mcp.pse-sent.com/api/mcp
- https://dash.pse-sent.com
- https://host.pse-sent.com
- https://github.com/pointgoddesscc-sketch/orgsuite-workspace
- https://linear.app/pse-management
- Vercel team PSE SENT (`orgsuite-*-vercel.app` projects)

## What this workplace page is not

- Not a password vault
- Not owner of grok.me / grok.com
- Not a live GoDaddy DNS write until PAT exists
- Not a live Twilio call

**Last updated:** 2026-09-23 04:16 WAT
