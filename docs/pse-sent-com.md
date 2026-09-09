# pse-sent.com production zone

Linear: https://linear.app/pse-management/issue/PSE-81/pse-sentcom-production-zone-cloudflare-live-vercel-attach-dns

Vercel console: https://pse-sent-com.vercel.app

## Verified 2026-09-09 20:38 WAT

- NS: gene.ns.cloudflare.com, jobs.ns.cloudflare.com
- Apex is Cloudflare-proxied (104.21.9.58 / 172.67.159.34). These are anycast edges, not origin IPs.
- HTTPS on the apex currently serves a Cloudflare bot-management challenge.
- Mail is iCloud: MX mx01/mx02.mail.icloud.com, SPF `v=spf1 include:icloud.com ~all`, apple-domain TXT present.
- Missing: www, api, auth, mcp, _dmarc.

## Do not invent A records

Attach the Vercel project `pse-sent-com`, then CNAME-flatten `@` and `www` to `cname.vercel-dns.com`. Keep iCloud MX.

## Blockers in this session

No Cloudflare connector. Vercel MCP cannot add custom domains. GoDaddy PAT missing; this domain is not on the psemanagement.services allowlist.
