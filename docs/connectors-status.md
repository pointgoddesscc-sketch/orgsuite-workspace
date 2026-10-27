# Connectors Status – OrgSuite Workspace

Workplace source of truth. Host: GitHub `pointgoddesscc-sketch/orgsuite-workspace`.

**Audit refreshed:** 2026-10-27. This table separates current session evidence from older notes. A dashboard/project existing is not proof that its feature works end-to-end.

## Current-session verification

| Connector / service | Current status | Evidence and next action |
|---|---|---|
| GitHub | Connected — verified | Repository listing and read/write access verified for the workplace and workspace repositories. [GitHub account](https://github.com/pointgoddesscc-sketch) |
| Vercel | Connected — verified | Project listing, project details, deployment records, and workplace build logs were readable. Workplace production deployment state is READY. [Vercel team](https://vercel.com/pse-sent) |
| Workplace web app | Deployed — smoke test still needed | Latest production deployment is READY. This does not confirm all UI routes, auth flows, or provider integrations work. [Workplace project](https://vercel.com/pse-sent/pse-sent-workplace) · [Workplace URL](https://workplace.pse-sent.com) |
| Gmail | Draft action verified | A rich-HTML TextPlus marketing draft was created and then found in Drafts. Account profile lookup returned no profile details; sending is not tested. [Open Gmail Drafts](https://mail.google.com/mail/u/0/#drafts) |
| Stripe | Account access verified; payments untested | The connected account list returned MANAGEMENT TEAM in live mode. No payment or charge was created. Use test mode for integration tests. [Stripe Dashboard](https://dashboard.stripe.com/) |
| Twilio | Requires configuration | The Twilio Vercel project exists and has a READY deployment, but its environment-variable listing contains an incorrectly named variable entry rather than the expected Twilio variable names. Do not expose secrets in chat. [Twilio Console](https://console.twilio.com/) · [Twilio Vercel project](https://vercel.com/pse-sent/private-voice-agent-twilio) |
| TextPlus Live | Deployment exists; runtime configuration missing | Latest deployment is READY but is not marked Production in the returned record. No Vercel environment variables were returned for this project. [TextPlus Live project](https://vercel.com/pse-sent/orgsuite-textplus-live) |
| AppSheet | Not verified through a connector | Only the public sign-in/dashboard link is available in this audit. Open it and sign in to verify app access and deployment. [AppSheet](https://www.appsheet.com/) |
| Automation event sources | Connector action unavailable | The event-source listing action returned an error. Do not claim app-event automation is connected until rechecked. |

## Existing project and connector links

- Primary site: https://pse-sent.com
- Workplace: https://workplace.pse-sent.com
- KR Management site: https://kidrockmanagementteamsent.com
- MCP gateway: https://mcp.pse-sent.com/api/mcp
- Command center: https://orgsuite-codex-command-center.vercel.app
- Unified AI hub: https://orgsuite-command-center.vercel.app
- Public / SEO site: https://orgsuite-public.vercel.app
- Linear project: https://linear.app/pse-management/project/orgsuite-codex-app-9146b449b7a1

## Historical connector notes — reverify before relying on them

The previous 2026-10-22 sweep recorded Linear, Outlook, Google Calendar, Google Drive (PIP), Notion, Canva, Make, Cloudflare, and the support mail forward as connected. These were not all live-probed in this 2026-10-27 session, so retain those as historical notes rather than fresh verification.

The prior sweep also recorded:
- GoDaddy DNS — Requires Authorization (`GODADDY_PAT` missing)
- Twilio — Requires Authorization (invalid username was noted)
- Telegram bot — Requires Authorization
- Firebase — Requires Authorization (Firebase environment variables)
- App Store Connect MCP — Requires Authorization
- Native Drive / OneDrive — Requires Authorization

## Safety and change-control rules

- Only mark a provider Connected after an official connector or verified forward is available and an authorized live probe succeeds.
- A READY deployment confirms a deployment state, not that every feature works.
- Never place API keys, access tokens, service-account JSON, private keys, or passwords in Git, Linear, or chat.
- Do not make live payments, send campaign emails, publish to social media, or send SMS/calls during an audit without explicit approval.
- Keep the PSE SENT workplace on its own project. Do not overwrite the apex site: `pse-sent.com` has historically served the PSE BANK site. Confirm owner approval before any apex cutover.

**Maintainer:** Point Goddess CC · **Team:** PSE Management
