# OrgSuite Secured Workplace

Linear issue: [PSE-77](https://linear.app/pse-management/issue/PSE-77/build-orgsuite-secured-workplace-identity-secrets-least-privilege)
Linear doc: [Secured Workplace Baseline](https://linear.app/pse-management/document/orgsuite-secured-workplace-baseline-1c2361fb6426)

Created 2026-09-09. No secrets in this file.

## Purpose

Security operating model for PSE Management / OrgSuite so connectors do not outrun control.

## Rules

1. No secrets in Linear, Git, chat, or frontend JS.
2. Official OAuth/OIDC and least-privilege scopes only.
3. Native Grok connectors first. PIP is an aggregator, not the primary backend.
4. Never claim Connected without a live probe in that session.
5. Write actions require explicit owner intent.
6. Stripe livemode = production money.
7. Domains by Proxy emails are contacts, not credentials.

## Status vocabulary

Completed · Connected · Available · Ready to Configure · Proposed · Requires Authorization

## Kickoff evidence (2026-09-09 WAT)

| Check | Result |
| -- | -- |
| Linear | Connected · PSE Management |
| GitHub | Connected · `pointgoddesscc-sketch` |
| PIP gateway | Connected |
| Twilio via PIP | Requires Authorization · invalid username |
| PSE-46 client-side secret | Open / Urgent |

## Canonical path vs PIP

| Workflow | Canonical | PIP |
| -- | -- | -- |
| Workplace issues / docs | Native Linear | Do not use for source of truth |
| Code / PRs | Native GitHub | Optional read only |
| Deploy | Native Vercel | Not used |
| Mail / calendar | Native Gmail / Calendar / Outlook | Optional |
| SMS / voice | Not verified | Repair or isolate (PSE-78) |

## Open work

- PSE-46 rotate Cloudflare Realtime secret (owner-only)
- PSE-78 repair or isolate PIP Twilio
- PSE-79 least-privilege matrix
- PSE-18 GitHub OAuth App — Client Secret in Vercel env only

## Not claimed

No production deploy, no secret rotation, no Twilio send, no PR merge until reviewed.
