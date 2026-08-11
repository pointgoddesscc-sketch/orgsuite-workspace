# GoDaddy Secure Integration – OrgSuite Workspace

## Principle
All GoDaddy domain and DNS operations use the official API only. Credentials never leave the host environment and are never exposed to browser code or committed to the repository.

## Domain Proxy / WHOIS Privacy Contact

**Domains by Proxy email:**  
`30aa800b8c51400883f9307e174501f1@domainsbyproxy.com`

This is the privacy-protected contact address used for domain-related correspondence (renewals, abuse notices, registrar messages, etc.).  
It is **not** an API key, password, or login credential. Treat it as operational contact information only.

## Setup (one-time)

1. Log into [GoDaddy Developer Center](https://developer.godaddy.com).
2. Create API keys (start with OTE / test environment).
3. Store them securely on the host only:

```bash
export GODADDY_API_KEY="your-key"
export GODADDY_API_SECRET="your-secret"
# Optional: production base URL when ready
# export GODADDY_BASE_URL="https://api.godaddy.com/v1"
```

Or place them in a local `.env` (never commit it).

4. Copy the reference client from the godaddy-secure-automation skill:
   `scripts/godaddy_client.py` (or the version kept under `codex-app/server/` when the proxy layer is added).

## Command Center Integration

The OrgSuite Codex Command Center surfaces:

- Domain list / expiration health (read-only by default)
- DNS record overview for selected domains
- Connection status: **Connected** | **Needs authorization** | **Unavailable**

Any write operations (DNS updates, renewals) must:

- Run through a server-side endpoint
- Default to dry-run
- Log the change for the Orgsuite habit / audit trail

## Security Checklist

- [ ] Keys loaded only from environment / vault
- [ ] No keys in frontend JavaScript or HTML
- [ ] Rate-limit respect and error handling present
- [ ] Dry-run flag default for mutations
- [ ] Audit log of domain/DNS changes
- [x] Domain proxy contact recorded (WHOIS privacy only)

## Related

- Linear: [PSE-16](https://linear.app/pse-management/issue/PSE-16/connect-godaddy-secure-automation-full-orgsuite-connectors-to-codex)
- Skill: godaddy-secure-automation
- Command Center: `codex-app/` (live: https://orgsuite-codex-command-center.vercel.app)
- Vercel project: orgsuite-codex-command-center
