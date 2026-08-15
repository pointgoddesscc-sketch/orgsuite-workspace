# Connectors Status – OrgSuite Workspace

All connectors below are active and wired to **pointgoddesscc@gmail.com** unless otherwise noted.

| Connector          | Status              | Primary Use                                      |
|--------------------|---------------------|--------------------------------------------------|
| Google Calendar    | Active              | Scheduling & events                              |
| Calendly           | Active              | Availability & booking                           |
| Linear             | Active (re-auth may be needed) | Issue tracking (PSE Management team)    |
| Outlook            | Active              | Email & calendar                                 |
| Microsoft Teams    | Active              | Collaboration                                    |
| Figma              | Active              | Design files                                     |
| Notion             | Active              | Documentation & knowledge base                   |
| Vercel             | Active              | Deployments                                      |
| Gmail              | Active              | Primary email (pointgoddesscc@gmail.com)         |
| GitHub             | Active              | Source of truth for all code                     |
| Stripe             | Active              | Payments (test mode available)                   |
| **simmple-login**  | Available           | OrgSuite Agent (Cloudflare Workers AI)           |
| **Proton Mail**    | Documented / Manual | Secure inbox (see secure-mail doc)               |
| **SimpleLogin**    | Documented / Manual | Email aliases on 8shield.net                     |
| **Proton Pass**    | Not connected       | Password manager – no live OrgSuite connector    |
| **Marketing Connectors** | Ready to Configure | Spotify Ads/Analytics + Meta Marketing API (official) |

### Notes

- **simmple-login** is the official OrgSuite Agent. Full details: `docs/orgsuite-agent-simmple-login.md`
- **Proton / SimpleLogin** addresses and aliases currently known are documented in `docs/secure-mail-proton-simplelogin.md`.
- There is **no live API connector** for Proton Mail, SimpleLogin, or Proton Pass. Aliases cannot be auto-synced. Any additional aliases must be added manually by the owner.
- **Marketing Connectors** (Spotify Ads/Analytics + Meta Marketing API) are fully documented in the private repo:
  https://github.com/pointgoddesscc-sketch/orgsuite-marketing-connectors  
  Environment variables only · Least privilege · Audit logging required · No secrets in code.
- These connectors remain synchronized with the account used for Working Copy and ChatGPT.

**Last updated:** 2026-08-15
