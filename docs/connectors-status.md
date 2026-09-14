# Connectors Status – OrgSuite Workspace

Workplace source of truth. Host: GitHub `pointgoddesscc-sketch/orgsuite-workspace` (PSE SENT Vercel team for linked projects).

**Rule:** Status is Connected only when an official connector or verified forward exists. Saying “it is ours” does not create a vendor API session.

Official Grok surface: [grok.com](https://grok.com) / this Grok workspace. `grok.me` is not an xAI host used here.

## Authorized connectors (this Grok workplace)

| Connector | Status | Notes |
|-----------|--------|-------|
| Gmail | Connected | Live session identity `pointgoddesscc@gmail.com` (ORG SUITE). 527 messages / 421 threads verified 2026-09-14. Inbox also shows mail to `chrisemerson360agency@gmail.com` and `openaistudio@pse-sent.com`. |
| Outlook | Connected | Mailbox `chrisemerson360agency@outlook.com`. Inbox 113 / 82 unread verified 2026-09-14. |
| Google Calendar | Connected | Free/busy |
| Google Drive (PIP) | Connected | ORG SUITE / `pointgoddesscc@gmail.com`. Quota 0.41 GB / 15 GB verified 2026-09-14. |
| Google Drive (native MCP) | Requires Authorization | `search_files` returned Auth required. First-party Drive card not completed. |
| OneDrive / Graph Files | Requires Authorization | Not in this Grok tool session. Outlook mail ≠ Files.ReadWrite.All. |
| Calendly | Connected | Booking |
| GitHub | Connected | `pointgoddesscc-sketch` |
| Vercel | Connected | Team PSE SENT (`pse-sent`) |
| Linear | Connected | PSE Management |
| Notion | Connected | |
| Figma | Connected | |
| Canva | Connected | |
| Stripe | Connected | |
| Microsoft Teams | Connected | Graph mail/chat surface; reauth has failed in prior sweeps |
| Gmail Contacts / People API | Not available | No connector |
| Gemini | Not available | No connector in this workspace |

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
| GoDaddy Conversations `kidrockmananagement.com` | Workspace verified via Gmail notifications | Not a Conversations admin API |
| Canary Mail | Client only | Syncs the Gmail mailbox. No Canary team API. Ticket delete stays in the Canary app. |
| Canary Mail Copilot | Not available via API | |
| Proton Mail / Proton Pass | Not connected | Documented only |
| SimpleLogin hosted API | Not connected | Self-host docs only |
| Meta / ChatGPT / OpenAI account login | Not connected | Mail wrappers ≠ session |
| Domains By Proxy control panel | Requires Authorization | Owner signs in at the registrar |

## Hosting we own

- GitHub workspace: https://github.com/pointgoddesscc-sketch/orgsuite-workspace
- License nodes: https://github.com/pointgoddesscc-sketch/orgsuite-canary-ios-acknowledgements
- Vercel acknowledgements project: https://orgsuite-canary-acknowledgements.vercel.app
- Vercel team: PSE SENT — no catch-all login proxy deployed
- Cloud Storage workplace page: `cloud-storage/` (not claimed live on Vercel)

## What this workplace page is not

- Not a password vault
- Not a Canary / Proton / Meta / DBP login bridge
- Not a Gemini or grok.me host
- Not proof that every address in Gmail has an API
- Not a live OneDrive file system

Owner next steps stay official: authorize each vendor in its own product, then we mark that row Connected.

**Last updated:** 2026-09-14
