# GoDaddy Secure Integration – OrgSuite

**Status:** Production UI live. Domain JSON still owner-gated.

**Primary domain:** `psemanagement.services`

## Live

| Item | Value |
|------|-------|
| Vercel project | `orgsuite-godaddy-health` |
| Production URL | https://orgsuite-godaddy-health.vercel.app |
| Health endpoint | https://orgsuite-godaddy-health.vercel.app/api/godaddy/health |
| Current response without env keys | HTTP 503 `keys_missing` |

## Owner-only (cannot be done from Grok connectors)

There is no Vercel Environment Variables write tool in this workplace session.

1. Open https://vercel.com/pse-sent/orgsuite-godaddy-health/settings/environment-variables
2. Add Production + Preview:
   - `GODADDY_API_KEY`
   - `GODADDY_API_SECRET`
3. Generate those values at https://developer.godaddy.com — do not paste them into chat, GitHub, or Linear.
4. Redeploy production.

Until then the health route stays 503 by design.

## Preview-failure emails

`orgsuite-godaddy-health` and `orgsuite-pointgoddess-sync` are Git-linked to this docs repo root. Root `vercel.json` now uses `ignoreCommand` so those two projects skip git preview builds. Production stays the manual/file deploy already live.

No secrets in this file.
