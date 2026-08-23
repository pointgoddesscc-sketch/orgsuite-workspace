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
| **GoDaddy**        | API-ready           | Domain & DNS for **psemanagement.services**. Keys on host/Vercel only. See `docs/godaddy-secure-integration.md` |
| **Make.com + OpenAI** | Ready to Configure | Scenario automation + OpenAI modules (us2.make.com). Connection lives in Make encrypted store; not yet user-confirmed live. |
| **simmple-login**  | Available           | OrgSuite Agent (Cloudflare Workers AI)           |
| **Proton Mail**    | Documented / Manual | Secure inbox (see secure-mail doc)               |
| **SimpleLogin (API clients)** | Documented / Working | Email aliases via existing Chrome/Safari clients |
| **SimpleLogin Full App** | Source complete · Self-host ready | Full dashboard, subdomain, API under our control |
| **Proton Pass**    | Not connected       | Password manager – no live OrgSuite connector    |
| **Marketing Connectors** | Ready to Configure | Spotify Ads/Analytics + Meta Marketing API (official) |
| **X (Twitter) API** | Ready to Configure | `@PointGoddessCc` · User ID `2048576362781331456`. Developer App + tokens required. See `docs/x-api-tracking.md` and `docs/bot-x-bridge-2026-08-23.md` |
| **Bot ↔ Agent Bridge** | Design Completed | Primary path: `orgsuite-meta-ai-agent` (WhatsApp). Live webhook + env **Requires Authorization**. See `docs/bot-x-bridge-2026-08-23.md` |
| **Siri / Shortcuts** | Design Completed | Apple-compliant Shortcut → HTTPS `/api/siri`. On-device install + token **Requires Authorization**. See `docs/siri-bridge-2026-08-23.md` |

### Primary Domain: psemanagement.services (2026-08-20)

Full public record + Domains by Proxy contact + secure health-proxy architecture:
→ **`docs/godaddy-secure-integration.md`**

Key facts:
- Expires **2027-07-13**
- Domain Lock **On**
- External transfer available after **2026-09-11**
- Name servers: ns07/ns08.domaincontrol.com
- DNSSEC: Signed
- Privacy email: `2dee023ea92f4d5ea44412520ce6ec9a@domainsbyproxy.com`

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
- **X API**, **Bot ↔ Agent Bridge**, and **Siri / Shortcuts** packages prepared 2026-08-23. Live tokens, webhooks, and on-device Shortcut installation remain owner-only (**Requires Authorization**). No secrets stored in Git or sandbox.
- These connectors remain synchronized with the account used for Working Copy and ChatGPT.

**Last updated:** 2026-08-23
