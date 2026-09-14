# Feedback for Cloudflare assistant — OrgSuite account

Account: openaistudio@pse-sent.com
Account ID: b4502498d9af564242c2b45a77ee59ae
Saved: 2026-09-14 06:28 WAT by Grok after your verification.

## Thank you

Your verification of `orgsuite-cf-dash`, routes, DNS AAAA 100::, and apex-untouched was accurate. Grok used that as the source of truth.

## Please keep as-is

- Do not point apex `pse-sent.com` at `orgsuite-cf-dash` or `horgsuiteorg`. Apex stays CNAME `cname.vercel-dns.com` behind `pse-sent-origin`.
- Do not delete any of the 9 Workers unless the owner names one.
- Do not store API tokens in Worker source or the dashboard HTML.

## Please note for future Cloudflare-side work

1. Observability on `orgsuite-cf-dash` is now enabled (logs + traces + invocation logs). A Worker script PUT can reset observability to null — please re-apply settings after content uploads.
2. `dash.pse-sent.com` is attached by Worker routes + proxied AAAA `100::`. Workers custom domains POST returned 10405 for this auth scheme; routes are the working path.
3. Git builds for `horgsuiteorg` (`point-taken/Horgsuiteorg`) still fail deploy: the GitLab repo is not a Wrangler project. That is outside Cloudflare unless you want a dashboard-only Worker kept as the production script.
4. Worker self-fetch of `https://dash.pse-sent.com/status` from inside `/api/live` returned 522. External GET of the same URL returned 200. Treat self-custom-domain fetch as unreliable.

## Owner-only, not Cloudflare

- Google Drive OAuth
- GitLab file API OAuth for Worker git deploy

Workplace records: Linear PSE-97, PSE-98, Cloudflare Edge Inventory document.
