# OpenAI Capability Upgrade — OrgSuite (2026-10-18)

Status: **Implementation specification only — not deployed, installed, or production verified.**
Target: `feature/unified-ai-workplace-21`. Production changes require owner approval and passing tests.

## Objectives
Integrate supported OpenAI capabilities into the OrgSuite backend using officially documented APIs and account-authorized connectors. No feature is "active" merely because it is documented or appears in the UI.

## Capability and acceptance matrix

| Capability | Implementation requirement | Acceptance evidence |
| --- | --- | --- |
| Model routing | Discover model IDs from account-accessible API and maintain approved allowlist; never presume ChatGPT model names imply API access | Recorded models-list response (redacted), test inference per enabled model |
| Text/reasoning | Backend OpenAI API client; timeouts, retries, cost limits, logging | Staging request ID, successful response, latency and spend |
| Codex engineering | GitHub-authorized branch and PR workflow, checks and review | PR and passing CI, no direct production push |
| Tools and agents | Server-side tool registry with typed schemas, least-privilege scopes, approval gates | Tested read-only and approval-required actions, audit trail |
| Skills | Versioned skill manifests with instructions, inputs, outputs, permitted tools, owner, tests | Registry lists skill versions and test results |
| Search/research | Web or approved enterprise search with source citations | Evidence-backed research run |
| Documents/data | Authorized Google Drive/Docs/Sheets access, data minimization | Redacted test document and scope check |
| Audio/images | Enable only supported models and consent/rights-cleared media | Staging input/output test and rights checklist |
| Realtime | Realtime API session with per-session auth, quotas and timeout | Short staging session and logs |
| Monitoring | Health, error metrics, rate limit/cost alarms, capability status | Timestamped monitoring evidence |
| Security | Secrets manager, OAuth, tenant isolation, retention policies, no hard-coded tokens | Secret scan, permission test, admin review |

## Proposed reusable skills
- workplace-triage: read and categorize authorized tasks; no outgoing communication without approval.
- email-draft-review: draft business correspondence; sending requires explicit approval.
- calendar-brief: summarize authorized events; editing/sending invites gated.
- drive-knowledge: source-grounded retrieval and document preparation.
- github-engineer: issue -> branch -> tests -> PR; human review for merge.
- deployment-readiness: inspect DNS/SSL/health evidence without assuming connectivity.
- incident-monitor: identify failures and escalate without destructive remediation.
- compliance-review: check attribution, consent, rights and user communications.

## Implementation gates
1. Inventory current backend handlers, package versions, feature flags, model use, and configuration. Record exact baseline commit.
2. Confirm account entitlements and current official API documentation; pin SDK dependency and test model IDs.
3. Add an adapter-based OpenAI service on the feature branch with structured configuration, strict authentication, quotas, request timeouts, and redacted audit logs.
4. Add versioned skill registry; grant only explicit tool capabilities and per-connector OAuth scopes.
5. Implement simulated and staging end-to-end tests for reads, drafts, approvals, rejected writes, tool failures and rate limits.
6. Review privacy and permission boundaries for contacts, Gmail, Drive and other systems.
7. Produce a staging HTTPS endpoint, source commit SHA, repeatable test report, and human-approved PR.
8. Deploy only after owner authorization. Recheck actual live endpoint before marking **Connected** or **Completed**.

## Required environment variables (names only; no secrets)
`OPENAI_API_KEY`, `OPENAI_PROJECT_ID`, `OPENAI_MODEL_ALLOWLIST`, `OPENAI_REQUEST_TIMEOUT_MS`, `OPENAI_DAILY_BUDGET_USD`, `OPENAI_AUDIT_LOG_REDACTED`.

## Current evidence and limits
- GitHub repository README documents the OrgSuite architecture and states production AI workplace/OAuth/MCP work is in progress as of 2026-09-22.
- Existing AGENTS.md instructs a feature-branch, PR-reviewed, no-secrets workflow.
- OpenAI announced GPT-6, GPT-6 Astra, Sol and Luna; **model availability must be checked through the workspace's own authenticated API account**.
- No OpenAI API credentials, current production deployment, staging test execution, or live tool invocation was verified by this documentation change.

## References
- https://platform.openai.com/docs/models
- https://platform.openai.com/docs
- https://openai.com/index/gpt-6-astra/
- https://openai.com/index/introducing-gpt-6-sol-and-luna/
