# OrgSuite Hub — Meta state verification

Verified: 22 September 2026  
Surfaces checked: Legal Center preview, GitHub pointgoddesscc-sketch, Linear PSE Management.  
Apex / production Command Center was **not** modified.

## Real authorization state

| Item | State | Source |
|---|---|---|
| Facebook profile Kim Uhelski | Active | User-reported (device screenshot). Not API-verified. |
| Instagram kimuhelski | Deactivated | User-reported (device screenshot). Not API-verified. |
| Meta / Facebook Page | Not created | No Page ID, URL, or Graph payload returned. |
| OrgSuite Hub Page | Pending / Not created | Intended name only. |
| Meta Workplace connection | Requires Authorization | No token, no App ID in this runtime. |
| Instagram reactivation | User Action Required | Owner must use official Instagram / Accounts Center. |
| Legal Center | Ready (app-ready) | Policies and gate present. Acceptance only after in-app checkboxes. |
| Page verification | Not Connected | Would require live Page ID from Meta. |
| Workplace integration health | Not Connected | Step 7 blocked. |

## Missing configuration (fail closed)

- META_APP_ID — missing
- META_REDIRECT_URI — missing
- META_PAGE_ID — missing

Continue with Meta is **Blocked — Configuration Required**. No fake OAuth.

## Exact user action still required

1. Reactivate Instagram kimuhelski in the official Instagram app.
2. Stay on Facebook profile Kim Uhelski.
3. Complete Legal Center checkboxes.
4. Create Page OrgSuite Hub / Product/service at facebook.com/pages/creation/
5. Place META_APP_ID and META_REDIRECT_URI in host env (not in chat).
6. Return a real Page ID before Workplace will show Verified.

Instagram is **not** a technical blocker for Facebook Page creation.
