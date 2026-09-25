# OrgSuite Hub — Meta state verification

Updated: 22 September 2026
PR: https://github.com/pointgoddesscc-sketch/orgsuite-workspace/pull/14
Branch: feat/orgsuite-hub-legal-gate
Linear: PSE-142
Apex / production Command Center: not modified
Preview host: not deployed this session

## Diagnostics (this runtime)

| Key | State |
|---|---|
| META_APP_ID | Missing |
| META_REDIRECT_URI | Missing |
| META_PAGE_ID | Missing |

Continue with Meta: disabled. No OAuth URL built.

## Real authorization state

| Item | State | Source |
|---|---|---|
| Facebook Kim Uhelski | Active | user-reported |
| Instagram kimuhelski | Deactivated | user-reported |
| Meta OAuth | Blocked — Configuration Required | app-ready |
| OrgSuite Hub Page | Not created | no Graph payload |
| Page verification | Not Connected | ingest requires source=graph |
| Workplace connection | Not Connected | blocked |
| Legal Center | Ready | separate from Meta auth |

## Remaining user action

1. Reactivate Instagram in the official app (optional for Page create).
2. Create OrgSuite Hub / Product/service on Facebook while on Kim Uhelski.
3. Place META_APP_ID and META_REDIRECT_URI in host env.
4. Return a Graph Page payload before Verified is allowed.
