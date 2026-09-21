# OrgSuite Meta Notices Agent

Grok Automations created 21 Sep 2026. These are **watchers**, not a Meta App and not Meta AI.

## OrgSuite Meta Notices Agent

- Task ID: `e9ba5a1c-2655-4a39-b933-03a429b53a77`
- Cadence: weekly Monday 08:00 Africa/Lagos
- Notifications: push + email
- Linear: PSE-135

Checks official `thirdpartynotices` URLs and the GitHub NOTICE pack. Does not treat `mobile.facebook.com/legal/thirdparty.com` as valid.

## OrgSuite Legal Repo Push Watch

- Task ID: `ffdb693b-ef24-453e-a26a-7487f56984c7`
- Trigger: GitHub `push_to_branch` on `pointgoddesscc-sketch/orgsuite-workspace` (`repo` id `1330436637`) branch `main`
- Notifications: push + email

Summarizes only `legal/`, `api/legal/`, and Meta/Facebook docs. No secrets. No live Graph/Pixel/CAPI claims.

## Still Requires Authorization

Meta App Dashboard, Facebook Login, Pixel, CAPI, production Vercel host of `/legal/facebook-notices` and `/api/legal/data-deletion`.
