# OrgSuite canonical hosts

Updated 2026-10-19 UTC. This is an inventory and proposed disposition, not an uptime or ownership certificate.

## Identity and evidence

Primary workplace identity: https://pse-sent.com. Repository: https://github.com/pointgoddesscc-sketch/orgsuite-workspace. Linear reference: https://linear.app/pse-management.

Sources: repository history through commit 14dd8acf40a1cd155b3c1905af4ff560fbf1babb and user-supplied consolidated inventory dated 19 October 2026. User reports public probes and repo/docs/mail references, with no authenticated admin session. Raw probe records and mail evidence were not supplied in this task.

Current session verified GitHub repository reads. Public retrieval attempts for apex, workplace connectors and MCP health failed in the retrieval tool; these errors do not establish downtime or DNS failure. Other hosts were not independently probed.

The owner-domain column identifies a DNS namespace, not verified ownership. Keep/redirect/hold/retire are proposed inventory decisions, not completed infrastructure changes. Hold means do not promote or activate pending review. No registration, payment, customer-data or messaging flow is authorized by this document.

| Host | Owner domain / namespace | Status / purpose | Proposed action |
| --- | --- | --- | --- |
| pse-sent.com | pse-sent.com | Primary OrgSuite identity | keep |
| www.pse-sent.com | pse-sent.com | Apex alias; verify canonical redirect | keep |
| workplace.pse-sent.com | pse-sent.com | Reported workplace surface; verify access and purpose | keep |
| mail.pse-sent.com | pse-sent.com | Reported workplace surface; verify access and purpose | keep |
| chatgpt.pse-sent.com | pse-sent.com | Reported workplace surface; verify access and purpose | keep |
| webmail.pse-sent.com | pse-sent.com | Reported workplace surface; verify access and purpose | keep |
| admin.pse-sent.com | pse-sent.com | Reported workplace surface; verify access and purpose | keep |
| api.pse-sent.com | pse-sent.com | Reported workplace surface; verify access and purpose | keep |
| dash.pse-sent.com | pse-sent.com | Reported workplace surface; verify access and purpose | keep |
| host.pse-sent.com | pse-sent.com | Reported workplace surface; verify access and purpose | keep |
| auth.pse-sent.com | pse-sent.com | Reported workplace surface; verify access and purpose | keep |
| mcp.pse-sent.com | pse-sent.com | Reported workplace surface; verify access and purpose | keep |
| twilio.pse-sent.com | pse-sent.com | Reported workplace surface; verify access and purpose | keep |
| social.pse-sent.com | pse-sent.com | Reported workplace surface; verify access and purpose | keep |
| orgsuitetextplus.pse-sent.com | pse-sent.com | Reported workplace surface; verify access and purpose | keep |
| invoice.pse-sent.com | pse-sent.com | Invoice studio; review merchant and branding | hold |
| psebankinvoicemaker.pse-sent.com | pse-sent.com | Invoice app; unresolved banking branding | hold |
| psebankinvoiocemaker.pse-sent.com | pse-sent.com | Typo alias; redirect only after target and routes verified | redirect (proposed) |
| bank.pse-sent.com | pse-sent.com | Earlier user inventory reports no response; DNS/protocol status unknown | hold |
| psebank.pse-sent.com | pse-sent.com | Earlier user inventory reports no response; DNS/protocol status unknown | hold |
| orgsuite.pse-sent.com | pse-sent.com | Earlier user inventory reports no response; DNS/protocol status unknown | hold |
| smtp.pse-sent.com | pse-sent.com | Earlier user inventory reports no response; DNS/protocol status unknown | hold |
| imap.pse-sent.com | pse-sent.com | Earlier user inventory reports no response; DNS/protocol status unknown | hold |
| textplus.pse-sent.com | pse-sent.com | Earlier user inventory reports no response; DNS/protocol status unknown | hold |
| psemanagement.services | psemanagement.services | Separate independent sports/operations desk; affiliation unverified | hold |
| conversations.psemanagement.services | psemanagement.services | Separate inquiry surface; verify data handling before linking | hold |
| kidrockmanagementteamsent.com | kidrockmanagementteamsent.com | User reports historical zone deletion; current ownership/DNS unverified | retire (inventory only) |
| psebanknetwork.grok.me | grok.me (vendor domain) | Related user-reported experiment; not canonical workplace identity | hold |
| psebanking-giant-aurora-turbo.grok.me | grok.me (vendor domain) | Related user-reported experiment; not canonical workplace identity | hold |
| meadow-apex-frost-silver.grok.me | grok.me (vendor domain) | Related user-reported experiment; not canonical workplace identity | hold |
| palm-opal-cinder-giant.grok.me | grok.me (vendor domain) | Related user-reported experiment; not canonical workplace identity | hold |
| orgsuite-codex-command-center.vercel.app | vercel.app (vendor domain) | Reported/documented project; team ownership and deployment unverified | keep (conditional) |
| orgsuite-command-center.vercel.app | vercel.app (vendor domain) | Reported/documented project; team ownership and deployment unverified | keep (conditional) |
| orgsuite-public.vercel.app | vercel.app (vendor domain) | Reported/documented project; team ownership and deployment unverified | keep (conditional) |
| orgsuite-workplace-bots.vercel.app | vercel.app (vendor domain) | Reported/documented project; team ownership and deployment unverified | keep (conditional) |
| orgsuite-make-bot-work.vercel.app | vercel.app (vendor domain) | Reported/documented project; team ownership and deployment unverified | keep (conditional) |
| call-proton-mail-pse-sent.vercel.app | vercel.app (vendor domain) | Reported/documented project; team ownership and deployment unverified | keep (conditional) |
| pse-sent-telegram-mcp-pse-sent.vercel.app | vercel.app (vendor domain) | Reported/documented project; team ownership and deployment unverified | keep (conditional) |
| orgsuite-asc-mcp-pse-sent.vercel.app | vercel.app (vendor domain) | Reported/documented project; team ownership and deployment unverified | keep (conditional) |
| orgsuite-telegram-bot.vercel.app | vercel.app (vendor domain) | Reported/documented project; team ownership and deployment unverified | keep (conditional) |
| orgsuite-social-hub-pse-sent.vercel.app | vercel.app (vendor domain) | Reported/documented project; team ownership and deployment unverified | keep (conditional) |
| orgsuite-godaddy-health.vercel.app | vercel.app (vendor domain) | Reported/documented project; team ownership and deployment unverified | keep (conditional) |
| www.psemanagement.com | psemanagement.com | Different commercial site; do not treat as this workplace | hold / exclude |
| psebank.godaddysites.com | godaddysites.com (vendor domain) | Legacy bank marketing reference; ownership unverified | hold |

## Exact routes to preserve in the inventory

- Workplace: /connectors, /business.
- MCP: /api/health, /api/mcp.
- Twilio: /mcp, /sms. The SMS webhook is not a generic health endpoint; do not invoke it to test messaging.
- Auth: /oauth/authorize, /oauth/token. Never send fabricated tokens or credentials.
- psebanknetwork.grok.me: /register, /security.
- psebanking-giant-aurora-turbo.grok.me: /personal.
- palm-opal-cinder-giant.grok.me: /desk, /grokbot.
- orgsuite-asc-mcp-pse-sent.vercel.app: /api/health, /api/mcp.
- orgsuite-telegram-bot.vercel.app: /api/health.

## Boundaries

grok.me and grok.com are vendor domains, not OrgSuite production identity. Vendor-hosted project associations do not establish ownership of those vendors or an authenticated provider connection.

psemanagement.services is separate from psemanagement.com and is not established here as an official sports-team site. kidrockmanagementteamsent.com remains historical pending direct owner/DNS evidence; do not reattach it automatically.

A nonresponsive web URL does not prove SMTP or IMAP is unavailable. Verify MX records and provider-specific mail protocols separately.

See [alignment and verification handoff](workplace-alignment-2026-10-19.md).
