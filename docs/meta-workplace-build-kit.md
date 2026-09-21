# OrgSuite Meta + Grok Workplace Build Kit

**Status**
- Legal notices pack: **Completed** on GitHub (`legal/facebook-third-party-notices/`)
- Architecture and env templates: **Ready to Configure**
- Meta App Dashboard, Login, Pixel, CAPI, xAI keys: **Requires Authorization**
- This kit is **not** a live wiring of Facebook or Grok

Linear: [PSE-135](https://linear.app/pse-management/issue/PSE-135/facebook-meta-third-party-notices-pack-published-to-orgsuite-workspace)

## URL fix

Do not link `https://mobile.facebook.com/legal/thirdparty.com`.

| Use | URL |
| --- | --- |
| Official product notices | https://www.facebook.com/legal/thirdpartynotices/ |
| Mobile public notices | https://m.facebook.com/legal/thirdpartynotices |
| OrgSuite hosted copy (this repo) | `/legal/facebook-notices/` → `legal/facebook-third-party-notices/index.html` |
| First captured node | ACE / DOC software, Copyright 1993–2009, Douglas C. Schmidt et al. |

## Proposed service topology

```
Web / iOS / Android
  → API Gateway (HTTPS only)
    → Auth Service     Facebook Login token debug + internal JWT
    → Graph Service    Graph API with appsecret_proof
    → Events Service   Pixel event_id + Conversions API SHA-256
    → Grok Service     xAI server-side only
    → Compliance       data deletion + notices hosting
Secret Manager / Vercel env / Vault — never the repo
```

## Files in this pack

| Path | Purpose |
| --- | --- |
| `legal/facebook-third-party-notices/NOTICE.txt` | Attribution source of truth |
| `legal/facebook-third-party-notices/index.html` | Hosted notices page |
| `env/meta-grok.env.example` | Empty env template |
| `docker-compose.meta-workplace.yml` | Local Postgres + Redis + nginx legal static |
| `legal/facebook-third-party-notices/nginx.legal.conf` | 301 from broken path |

## Backend rules (implement only after Meta App exists)

1. Verify Login tokens with Graph `debug_token` using `APP_ID|APP_SECRET` on the server.
2. Reject tokens whose `app_id` does not match `META_APP_ID`.
3. Send CAPI events with the **same** `event_id` the browser sent to Pixel.
4. Hash email/phone with SHA-256 of trimmed lowercase values before CAPI.
5. Verify webhooks with `x-hub-signature-256` and `META_APP_SECRET` using timing-safe compare.
6. Implement Meta data-deletion callback (`signed_request`) before App Review.
7. Block child accounts. Do not send events for users under 13 (policy) / apply your age-gate.
8. Never put `META_APP_SECRET`, `META_CAPI_TOKEN`, or `GROK_API_KEY` in client bundles.

## Frontend rules

- `NEXT_PUBLIC_META_APP_ID` and `NEXT_PUBLIC_META_PIXEL_ID` only.
- Default consent denied until the user grants it.
- Android/iOS SDK IDs come from the real App Dashboard, not sample numbers.
- Ship the Facebook SDK copyright block from `NOTICE.txt`.

## Grok Workplace

Grok stays complementary. Server wrapper may call OrgSuite tools. Do not claim Grok contacted Meta unless an authorized API call succeeds.

## Host locally

```bash
cp env/meta-grok.env.example .env.local
# fill secrets on the host only
docker compose -f docker-compose.meta-workplace.yml up -d
# legal page: http://127.0.0.1:8088/legal/facebook-notices/
```

## Meta App Dashboard URLs to register later

- Privacy Policy
- Terms of Service
- Data deletion callback
- Third-party notices: OrgSuite `/legal/facebook-notices/`

None of those dashboard fields are set from this session.
