# GoDaddy Secure Integration – OrgSuite

**Status:** Deployed & Ready for API keys only

**Primary domain:** `psemanagement.services`  
**Last recorded from owner WHOIS:** 2026-08-20  
**Auto-renews:** Jul 13, 2027

---

## Live Project (2026-08-20)

| Item | Value |
|------|-------|
| **Vercel Project** | `orgsuite-godaddy-health` |
| **Production URL** | https://orgsuite-godaddy-health.vercel.app |
| **Health Endpoint** | https://orgsuite-godaddy-health.vercel.app/api/godaddy/health |
| **Domain hard-coded** | `psemanagement.services` |

### One remaining step (owner only)

1. Vercel → Project `orgsuite-godaddy-health` → **Settings → Environment Variables**
2. Add for Production + Preview:
   - `GODADDY_API_KEY`
   - `GODADDY_API_SECRET`
3. Redeploy (or wait for next automatic deploy)

Generate keys at: https://developer.godaddy.com

Until the keys are present the endpoint returns HTTP 503 with a clear message. No secrets exist in the codebase.

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

### Required Environment Variables (Vercel only)

```
GODADDY_API_KEY=
GODADDY_API_SECRET=
```

Domain is hard-coded inside the route to `psemanagement.services`.

### Response shape (when keys are present)

```json
{
  "ok": true,
  "domain": "psemanagement.services",
  "status": "ACTIVE",
  "expires": "2027-07-13T...",
  "locked": true,
  "renewAuto": true,
  "nameServers": ["ns07.domaincontrol.com", "ns08.domaincontrol.com"],
  "checkedAt": "<ISO timestamp>"
}
```

---

## Security Rules (non-negotiable)

- API key + secret never appear in repository, frontend, Linear, or chat
- Use Vercel Environment Variables only
- Least privilege: only the scopes needed for domain info
- All mutation scripts must default to dry-run

---

## Related

- Linear: PSE-16 + Connector Checklist document
- Skill: godaddy-secure-automation

**Last updated:** 2026-08-20 by Grok / OrgSuite Engineering Partner
