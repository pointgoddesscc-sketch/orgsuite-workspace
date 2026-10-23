# OrgSuite Self-Hosted Integration Hub

**Status:** Architecture baseline documented; implementation and provider authorizations remain in progress.  
**Source of truth:** `pointgoddesscc-sketch/orgsuite-workspace`  
**Hosting target:** Vercel team PSE SENT; source and CI/CD in GitHub.

## Goal

Host OrgSuite-owned integration services, dashboards, adapter APIs, webhook receivers, and operational checks in our Vercel projects with source controlled in GitHub. Avoid making ChatGPT-hosted plugins the runtime for OrgSuite's production workflows.

## Important boundary

ChatGPT's Plugin Manager manages integrations available inside ChatGPT. It does **not** install arbitrary apps into Vercel or convert third-party services into OrgSuite-owned infrastructure. Vercel can host our code and integration adapters, but external services (Meta/Facebook, Metricool, Google, Stripe, Twilio, etc.) still require their official APIs, OAuth grants, webhooks, terms, and sometimes paid accounts. Keep existing ChatGPT connectors as optional operator tools; do not make them production dependencies.

## Target architecture

- **GitHub**: canonical source, pull requests, code review, automated tests, dependency/security checks.
- **Vercel**: deploy the OrgSuite command center, API gateway, adapter endpoints, scheduled jobs where supported, and health endpoints.
- **Cloudflare**: DNS, TLS/routing, edge controls, and WAF where already configured; avoid replacing existing DNS or mail records without a reviewed change.
- **OrgSuite adapter layer**: typed provider interfaces and one adapter per provider. Each adapter declares required environment variables, supported read/write actions, OAuth scopes, webhook validation, and a health probe.
- **Credential storage**: Vercel project environment variables or a dedicated managed secret store. Never commit tokens, refresh tokens, private keys, session cookies, or production secrets.
- **Data layer**: persist only the minimum operational metadata required; use an approved database with access controls and retention rules. Do not log secrets or unnecessary personal data.
- **Operator controls**: health/status page, audit trail, rate limits, idempotency for writes, retries with backoff, and a human-approval gate for public posts, billing, destructive changes, or outbound messages.

## Provider connection states

Use only these labels:
- **Connected** — live authenticated probe succeeds for the intended account/brand.
- **Configured** — code and required configuration are present, but end-to-end behavior is not proven.
- **Ready to authorize** — adapter exists but the owner must complete OAuth or provide a secret in the provider/Vercel console.
- **Blocked** — probe fails or required permissions/configuration are missing.
- **Proposed** — not implemented.

A Vercel deployment marked `READY` only means the deployment build completed; it does not prove every route, integration, or production workflow works.

## Delivery sequence

1. Inventory all current Vercel projects, GitHub repositories, domains, and existing provider connections; preserve existing live services.
2. Select or confirm the canonical OrgSuite gateway and command-center projects; avoid creating duplicate projects without a reason.
3. Add a provider registry and typed health interface; expose safe status metadata only (never secrets).
4. Implement one adapter at a time, starting with read-only status probes and official OAuth; test against the intended account/brand.
5. Add webhook signature validation, input validation, rate limiting, idempotency, audit events, and explicit approval gates for writes.
6. Configure GitHub checks and Vercel preview deployments; promote to production only after tests and a reviewed change.
7. Run smoke tests for public routes, API auth, provider status, webhook verification, logs, and rollback readiness.
8. Update `docs/connectors-status.md` only with evidence from live probes; document blockers and the exact owner action required.

## Metricool / Facebook known blocker

The live Metricool brand-settings probe returned: “This brand doesn't have any social network connected yet” for brand ID `7598764`. Treat the integration as **Blocked** until the intended Facebook Page is visible to the Metricool API and a read-only probe succeeds. Do not claim scheduling, analytics, or publishing works before that verification.

Connection settings: https://app.metricool.com/brands/connections?blogId=7598764

## Acceptance criteria

- [ ] Canonical GitHub repo and Vercel project are explicitly identified and linked.
- [ ] Production deployment is inspected, and key routes are smoke-tested over HTTPS.
- [ ] Every adapter has documented scopes, env var names, health probe, failure behavior, and test coverage.
- [ ] OAuth credentials are stored only in Vercel/approved secret storage.
- [ ] Webhooks reject invalid signatures and replayed requests.
- [ ] Writes are disabled until provider authorization and approval policy are configured.
- [ ] Metricool can identify the intended Facebook Page through a live probe.
- [ ] Connector status documentation matches actual probe results.
- [ ] Rollback and incident steps are documented.

## Immediate constraints

This document is the architecture baseline, not evidence that the implementation is complete. The current gateway project has a deployment marked `READY`, while its Vercel project response reports `live: false`; production runtime health must be checked before describing it as fully live. External OAuth actions require the account owner to complete authorization.
