# X API Tracking & Avatar Synchronization

Professional configuration for Point Goddess CC / OrgSuite.

**Account email:** `pointgoddesscc@gmail.com`  
**Brand avatar:** Geometric AI head (shared across GitHub, GitLab, Gravatar, Meta, X)

---

## 1. Create the X API app (one-time, on your side)

1. Go to [https://developer.x.com](https://developer.x.com)
2. Sign in with the X account that will use the **same brand avatar**
3. Create a Project + App
4. Enable the permissions you need (usually Read + Write for posting/tracking)
5. Generate:
   - API Key
   - API Key Secret
   - Bearer Token
   - Access Token + Secret (if user-context actions are needed)

**Never commit these values to Git.** Store them only in:
- Local `.env` (gitignored)
- Vercel / Cloudflare / host secrets
- Password manager

---

## 2. Record trackable identity (fill when ready)

| Field | Value |
|-------|--------|
| X username | `@________` |
| X User ID | `________` |
| App name | `________` |
| App ID | `________` |
| Project name | `________` |
| Primary use | Tracking · automation · brand posts |

After you create the app, reply with username + App ID and this table will be updated in the workplace.

---

## 3. Environment template (safe)

Copy into a **local** `.env` only (never push):

```bash
# X API – Point Goddess CC (DO NOT COMMIT)
X_API_KEY=
X_API_KEY_SECRET=
X_BEARER_TOKEN=
X_ACCESS_TOKEN=
X_ACCESS_TOKEN_SECRET=
X_USERNAME=
X_USER_ID=
```

---

## 4. Avatar synchronization (professional process)

Full automatic sync across all platforms requires each platform’s API and your credentials.  
The **safe workplace standard** is:

### Canonical source
1. Keep the master image file offline (or in a private asset store)
2. Upload the **same file** to:
   - Gravatar (primary for email-based avatars)
   - GitHub profile
   - GitLab profile
   - Meta profile / Page
   - X profile

### Checklist (run when the image changes)

| Platform | Action | Done |
|----------|--------|------|
| Gravatar | Upload + set primary for `pointgoddesscc@gmail.com` | ☐ |
| GitHub | Settings → Profile → picture | ☐ |
| GitLab | Preferences → Profile → avatar | ☐ |
| Meta | Page / profile picture | ☐ |
| X | Profile → photo | ☐ |

### Optional automation (advanced)

If you later want scripts:
- **GitHub:** Profile avatar via API is limited; prefer manual or Gravatar-linked flows
- **X:** Media upload + profile update endpoints (needs user access token)
- **Gravatar:** Official upload is account-based in the Gravatar UI

Do **not** share API secrets with third-party “avatar bot” services.

---

## 5. Tracking in the workplace

Once X API credentials exist (in secrets only):

| Tracking goal | Approach |
|---------------|----------|
| Brand mentions | X API search / filtered stream |
| Own posts | User timeline endpoints |
| Link to OrgSuite work | Reference commit/PR URLs in posts |
| Identity consistency | Same avatar + same display name everywhere |

Document any dashboards or scripts under:
- `docs/x-api-tracking.md` (this file)
- Optional future repo: e.g. `x-brand-tracker` (create only when needed)

---

## 6. Security rules

- Never commit API keys, bearer tokens, or access tokens
- Never paste tokens into chat logs long-term
- Rotate keys if exposed
- Prefer read-only tokens until write automation is required
- Keep avatar file offline; do not rely on random CDN copies

---

## Related docs

- `docs/brand-identity.md` – unified avatar and accounts
- `docs/connectors-status.md` – live connectors
- `docs/workplace-index.md` – repositories

**Hub:** orgsuite-workspace  
**Email:** pointgoddesscc@gmail.com
