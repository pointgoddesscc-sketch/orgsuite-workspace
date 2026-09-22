# Connectors Status – OrgSuite Workspace

Workplace source of truth. Host: GitHub `pointgoddesscc-sketch/orgsuite-workspace` (PSE SENT Vercel team for linked projects).

**Rule:** Status is Connected only when an official connector or verified forward exists. Saying “it is ours” does not create a vendor API session.

Official Grok surface: [grok.com](https://grok.com) / this Grok workspace. `grok.me` is not an xAI host used here.

Linear checklist twin: [OrgSuite Connector Rollout Checklist & Status](https://linear.app/pse-management/document/orgsuite-connector-rollout-checklist-and-status-2f33b168b2b9)

## Sweep 2026-09-22 23:46 WAT (Linear + GitHub only)

Owner asked to act with the two working pipes. Live identity: GitHub `pointgoddesscc-sketch`, Linear workspace PSE Management.

| Connector | Status | Notes |
|-----------|--------|-------|
| Linear | Connected | Workspace PSE Management, team PSE. 7 projects In Progress. 127 issues (38 started / 68 backlog / 18 todo / 23 done / 1 canceled). |
| GitHub | Connected | `pointgoddesscc-sketch` (72 public repos). This file lives in `orgsuite-workspace`. |
| Gmail | Connected | Prior verified; automations still active. |
| Outlook | Connected | Prior verified; Outlook-to-Gmail automation active. |
| Google Calendar | Connected | Prior verified. |
| Google Drive (PIP) | Connected | Prior verified. |
| Google Drive (native MCP) | Requires Authorization | First-party Drive card not completed. |
| OneDrive / Graph Files | Requires Authorization | Outlook mail ≠ Files.ReadWrite.All. |
| Calendly | Connected | Prior verified. |
| Vercel | Connected | Team PSE SENT. GoDaddy MCP project still missing `GODADDY_PAT`. |
| Notion | Connected | Prior verified. |
| Figma | Connected | Prior verified. |
| Canva | Connected | Prior verified. |
| Stripe | Connected | Prior verified. |
| Make | Connected | Prior verified. |
| Cloudflare | Connected | Prior verified. |
| Microsoft Teams | Requires Authorization | Prior Graph 401. |
| GoDaddy public suggest/availability | Available | Official MCP search only. |
| GoDaddy account DNS (`orgsuite-godaddy-mcp`) | Requires Authorization | Health `keys_missing` HTTP 503. Owner sets `GODADDY_PAT` on Vercel. See PSE-16. |
| Twilio (PIP) | Requires Authorization | `Authentication Error - invalid username`. No SMS/call from this session. See PSE-128. |
| GitLab (PIP) | Requires Authorization | Pipedream GitLab reconnect required. |
| Telegram bot | Requires Authorization | No live Bot API getMe this session. Token stays in Vercel/Firebase. See PSE-87. |
| Automations (Grok) | Connected | Multiple Gmail/Outlook jobs active. Broken layer is vendor keys, not the jobs. |

## Cloud storage mount (PSE-100)

Architecture and UI: `docs/cloud-connectors.md` + `cloud-storage/`.

SSO target:

- Google: Gmail + Drive + Docs + Sheets + Calendar in one OAuth 2.1 PKCE S256 consent
- Microsoft: Mail.ReadWrite, Mail.Send, Files.ReadWrite.All, Calendars.ReadWrite, User.Read, offline_access

Refresh tokens belong in the Workplace Vault only.

## Mail and privacy aliases (inbound only)

| Address / service | Status | Notes |
|-------------------|--------|-------|
| `30aa800b8c51400883f9307e174501f1@domainsbyproxy.com` | Connected as inbound forward | `donotreply@domainsbyproxy.com` → `chrisemerson360agency@gmail.com` (verified 2026-09-01) |
| `2dee023ea92f4d5ea44412520ce6ec9a@domainsbyproxy.com` | Documented | psemanagement.services privacy alias (see `docs/godaddy-secure-integration.md`) |
| GoDaddy Conversations | Workspace verified via Gmail notifications | Not a Conversations admin API |
| Canary Mail | Client only | Syncs the Gmail mailbox. No Canary team API. |
| Proton Mail / Proton Pass | Not connected | Documented only |
| Meta / ChatGPT / OpenAI account login | Not connected | Mail wrappers ≠ session |

## Hosting we own

- GitHub workspace: https://github.com/pointgoddesscc-sketch/orgsuite-workspace
- Linear workspace: https://linear.app/pse-management
- Destination project: Add WhatsApp Business / Meta AI as Orgsuite destination
- Vercel team: PSE SENT — no catch-all login proxy deployed

## What this workplace page is not

- Not a password vault
- Not a Canary / Proton / Meta / DBP login bridge
- Not a Gemini or grok.me host
- Not proof that every address in Gmail has an API
- Not a live OneDrive file system
- Not a live Twilio call or GoDaddy DNS write

Owner next steps stay official: authorize each vendor in its own product, then we mark that row Connected.

**Last updated:** 2026-09-22 23:46 WAT
