# GoDaddy Secure Integration – OrgSuite

**Status:** Ready to Configure (API keys required on host / Vercel)

**Primary domain:** `psemanagement.services`  
**Last recorded from owner WHOIS:** 2026-08-20

---

## Domain Identity (public record)

| Field | Value |
|-------|-------|
| Domain | psemanagement.services |
| Registrar | GoDaddy.com, LLC (IANA ID 146) |
| Registered | 2026-07-13T23:58:05.351Z |
| Expires | 2027-07-13T23:58:05.351Z |
| Last Updated | 2026-08-11T19:12:05.806Z |
| Domain Lock | On |
| Client statuses | deleteProhibited, renewProhibited, transferProhibited, updateProhibited |
| External transfer available | After 2026-09-11 |
| Name Servers | ns07.domaincontrol.com, ns08.domaincontrol.com |
| DNSSEC | Delegation Signed |
| GoDaddy Profile | Airo Airport |
| Abuse contact | abuse@godaddy.com · +1.480-624-2505 |

### Domains by Proxy (WHOIS privacy)

- Organization: Domains By Proxy, LLC
- Name: Registration Private
- Address: DomainsByProxy.com, 100 S. Mill Ave, Suite 1600, Tempe, Arizona, United States 85281
- Telephone: +1.4806242599
- Email: `2dee023ea92f4d5ea44412520ce6ec9a@domainsbyproxy.com`

Privacy contact only — **not** a credential.

---

## Architecture (Server-side Health Proxy)

Never call the GoDaddy API from the browser. Always proxy through a server route that holds the credentials.

### Required Environment Variables (host / Vercel only)

```
GODADDY_API_KEY=          # from developer.godaddy.com
GODADDY_API_SECRET=       # never commit
GODADDY_DOMAIN=psemanagement.services
```

### Recommended API Route (example pattern)

```
GET /api/godaddy/health
Authorization: none (server-side only)
```

Implementation outline (Next.js / Express / Cloudflare Worker):

1. Read `GODADDY_API_KEY` + `GODADDY_API_SECRET` from process.env
2. If missing → return 503 with clear message (no secrets leaked)
3. Call official endpoint:
   `GET https://api.godaddy.com/v1/domains/psemanagement.services`
   Header: `Authorization: sso-key ${KEY}:${SECRET}`
4. Return sanitized JSON only:
   ```json
   {
     "domain": "psemanagement.services",
     "status": "ACTIVE",
     "expires": "2027-07-13T23:58:05.351Z",
     "locked": true,
     "transferLockUntil": "2026-09-11",
     "nameservers": ["ns07.domaincontrol.com", "ns08.domaincontrol.com"],
     "dnssec": "signed",
     "checkedAt": "<ISO timestamp>"
   }
   ```
5. Rate-limit and cache (e.g. 5–15 min) to respect GoDaddy limits

### UI Card

Command Center Domain Health card should fetch the proxy endpoint and display:
- Expiration countdown
- Lock status
- DNSSEC status
- Last successful check

---

## Renewal & Automation Notes

- Expiration: **2027-07-13**
- Recommended reminders: 90 / 30 / 7 days prior
- Domain Lock is currently **On** (good)
- External registrar transfer becomes available after **2026-09-11**
- Any DNS changes should use the official GoDaddy API with dry-run first (see godaddy-secure-automation skill)

---

## Security Rules (non-negotiable)

- API key + secret never appear in repository, frontend, Linear, or chat
- Use Vercel Environment Variables or host secret manager
- Least privilege: only the scopes needed for domain info + optional DNS read
- All mutation scripts must default to dry-run
- Log access but never log the secret itself

---

## Related

- Linear: PSE-16 + Connector Checklist document
- Skill: godaddy-secure-automation
- Live Command Center: see current Vercel deployment linked in Linear

**Last updated:** 2026-08-20 by Grok / OrgSuite Engineering Partner
