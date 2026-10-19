# Unified AI Workplace — Administrator Handoff

Issue: #21
Branch: `feature/unified-ai-workplace-21`
Status: **Specification and activation only — not deployed**

## Owner decisions
- [ ] Approve staging FQDN and determine actual authoritative DNS host (no assumed control).
- [ ] Approve organization and SSO tenant (OIDC/SAML), MFA and admin owners.
- [ ] Approve data residency, retention period, backups, and deletion policy.
- [ ] Approve provider-specific model IDs, budgets, rate limits and legal/data-processing terms.
- [ ] Select developers (2-3) and assign them to issue #21; never invent identities.

## Server-side credentials
Use Vault/GCP Secret Manager or approved GitHub Actions secrets; never issue bodies, commits, logs or browser localStorage.
- `OPENAI_API_KEY`, `GEMINI_API_KEY`, `XAI_API_KEY`: unprovisioned until admin validates.
- Meta integration: **Pending verification/approval**; do not create fake key values or assume Meta AI consumer session access.
- OAuth credentials for Google Drive/Gmail/Calendar, GitHub App, Canva; use least privilege, PKCE and owner-approved write actions.

## Build milestones
1. Next.js UI, SSO/MFA, Owner/Admin/Member/Viewer, HTTPS staging.
2. Server-side orchestration adapters; use real provider health checks. Never mark “API Ready” without a real response.
3. Postgres/pgvector memory, ACLs, provenance, retention, export and delete.
4. Provider comparison, consolidated synthesis, tracing, audit logging.
5. Approved Google/GitHub/Canva OAuth connectors with approval-before-write.
6. Task queue, handoffs, notifications, retries and human confirmation.
7. Security testing and owner-approved staging verification.

## Release blockers
Do not claim the application is live until authenticated HTTPS staging, redacted provider proof, memory ACL and deletion tests, OAuth consent scopes, human approval tests, mobile responsiveness, and incident rollback are verified. Existing repo docs are leads, not live connectivity proof.

## Security checklist
- Enforce tenant and project isolation on every server query.
- Encrypt credentials and storage, audit access, rotate and revoke secrets.
- Prevent prompt-injection from retrieved content and cross-provider tool escalation.
- No cross-provider forwarding of sensitive context without owner authorization.
- Block external writes and outbound communication until a human approves.
- Document rollback, token revocation, data export/delete, and cost ceilings.
