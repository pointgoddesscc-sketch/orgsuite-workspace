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
| **GoDaddy**        | API-ready           | Domain & DNS (secure automation skill). Keys on host/Vercel only. |
| **Make.com + OpenAI** | Ready to Configure | Scenario automation + OpenAI modules (us2.make.com). Connection lives in Make encrypted store; not yet user-confirmed live. |
| **simmple-login**  | Available           | OrgSuite Agent (Cloudflare Workers AI)           |
| **Proton Mail**    | Documented / Manual | Secure inbox (see secure-mail doc)               |
| **SimpleLogin (API clients)** | Documented / Working | Email aliases via existing Chrome/Safari clients |
| **SimpleLogin Full App** | Source complete · Self-host ready | Full dashboard, subdomain, API under our control |
| **Proton Pass**    | Not connected       | Password manager – no live OrgSuite connector    |
| **Marketing Connectors** | Ready to Configure | Spotify Ads/Analytics + Meta Marketing API (official) |

### Domain Proxy Contact (WHOIS privacy) — 2026-08-20

Public Domains by Proxy (GoDaddy) WHOIS privacy details recorded from owner WHOIS view:

- **Organization:** Domains By Proxy, LLC
- **Name:** Registration Private
- **Address:** DomainsByProxy.com, 100 S. Mill Ave, Suite 1600, Tempe, Arizona, United States 85281
- **Telephone:** +1.4806242599
- **Email:** `2dee023ea92f4d5ea44412520ce6ec9a@domainsbyproxy.com`

Privacy-protected contact only — **not** an API credential or login. Used for domain correspondence (renewals, abuse notices, transfers). API keys stay in host / Vercel environment variables only. See Linear document [OrgSuite Connector Rollout Checklist & Status](https://linear.app/pse-management/document/orgsuite-connector-rollout-checklist-and-status-2f33b168b2b9) and issue PSE-16.

### Notes

- **simmple-login** is the official OrgSuite Agent. Full details: `docs/orgsuite-agent-simmple-login.md`
- **Proton / SimpleLogin** addresses and aliases currently known are documented in `docs/secure-mail-proton-simplelogin.md`.
- **SimpleLogin Full App** (complete self-host control layer) is permanently tracked in:
  **`docs/simplelogin-selfhost-control.md`**  
  Fork: https://github.com/pointgoddesscc-sketch/app  
  This gives full ownership of dashboard, subdomain feature, and API. Local-dev and production self-host paths are documented there.
- There is **no live API connector** for Proton Mail or Proton Pass. Aliases cannot be auto-synced from the hosted service. Any additional aliases must be added manually by the owner or via the self-hosted instance.
- **Marketing Connectors** (Spotify Ads/Analytics + Meta Marketing API) are fully documented in the private repo:
  https://github.com/pointgoddesscc-sketch/orgsuite-marketing-connectors  
  Environment variables only · Least privilege · Audit logging required · No secrets in code.
- **Make.com + OpenAI**: The OpenAI connection must be created inside Make.com (Connections → Create connection → paste API key from the secure phone folder). Status will move to “Connected – user confirmed” only after explicit confirmation. Secrets never leave Make’s encrypted store or the local device.
- These connectors remain synchronized with the account used for Working Copy and ChatGPT.

**Last updated:** 2026-08-20
