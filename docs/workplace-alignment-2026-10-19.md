# Workplace alignment and verification — 2026-10-19 UTC

## Completed in this change

- Expanded canonical host inventory, including separate domains, historical hosts, vendor-hosted experiments and exact routes.
- Distinguished proposed dispositions from completed changes.
- Marked September status matrices as historical.
- Confirmed repository read access through the connected GitHub tool.

This is a documentation remediation. No DNS, deployment, billing, customer communications, bank account opening, or provider OAuth was changed.

## Evidence and remaining work

| Item | Evidence now | Next concrete check |
| --- | --- | --- |
| GitHub | Reads succeeded at main commit 14dd8acf40a1cd155b3c1905af4ff560fbf1babb | Review this PR and its checks |
| Apex / registry / MCP health | Retrieval tool could not access them | Owner-authorized HTTPS check with timestamp, status, redirect chain and sanitized response |
| Other providers | Historic docs and user-reported labels only | Account identity, environment, scopes and minimal authorized read result per connector |
| Stale Vercel label | User reports “Apex is still PSE BANK”; exact-text repository search found no match | Locate deployed source/project and replace only after source mapping is established |
| Contact | User reports bank-style contact | Verify an existing neutral mailbox with inbound/outbound delivery before replacing |
| Invoice hosts | User reports two hostnames and active payment links | Verify ownership, route equivalence and merchant identity; no payment tests or new collection activity |
| grok.me banking sites | User-reported marketing and registration flows | Keep outside canonical production identity; owner review of misleading branding and retirement |
| Historical domain | User reports Cloudflare deletion alerts | Review authoritative DNS and account history; do not recreate zone automatically |

## Proposed copy for staging

Apex: “PSE SENT · OrgSuite — workspace operations and integrations. The bank demo is off.”

Vercel connector note: “Primary workplace identity: pse-sent.com (PSE SENT / OrgSuite). Deployment and provider connection require current verification.”

Do not substitute an invented contact address. Do not describe any service as a licensed bank or imply sports-team/artist affiliation without substantiation.

## Redirect implementation gate

Before adding any typo-host redirect: confirm control of both hosts, valid TLS on each, intended canonical target, path/query behavior, absence of redirect loops and compatibility with callback/webhook routes. Test in staging. Do not blanket-redirect OAuth callbacks, POST webhooks or payment flows. Retain rollback configuration. No redirect is deployed by this PR.

## Connector evidence contract

For each provider record provider name, exact account/tenant, environment, granted scopes, checked_at in UTC, safe read operation, sanitized result, and expiry/recheck policy. Never record tokens, cookies or secrets.

Use Connected only after a current authenticated provider operation succeeds. Use Requires Authorization for missing authorization, Unverified for missing evidence, and Degraded for a previously working connection with a failing current check. A static label, HTTP 200, configured secret name or health response alone is insufficient.

## Release acceptance

Human review and merge are required by AGENTS.md. Production changes additionally require verified owner approval under the existing staging-first work item. Capture staging URL, source commit, reproducible checks, authentication boundaries and rollback plan before release. This PR does not satisfy those release gates.
