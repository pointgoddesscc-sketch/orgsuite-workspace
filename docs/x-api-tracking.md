# X API Tracking & Avatar Synchronization

Professional configuration for Point Goddess CC / OrgSuite.

**Account email:** `pointgoddesscc@gmail.com`  
**Brand avatar:** Geometric AI head (shared across GitHub, GitLab, Gravatar, Meta, X)

---

## Verified X account

| Field | Value |
|-------|--------|
| **X username** | `@PointGoddessCc` |
| **X User ID** | `2048576362781331456` |
| **Display name** | Captain Clark - @PointGoddessCc |
| **Example post** | https://x.com/pointgoddesscc/status/2087075340447305869 |
| **App name** | *Create at developer.x.com* |
| **App ID** | *Add after app is created* |

---

## 1. Create the X Developer App (you must do this)

I cannot create the app inside your X account. Follow these steps:

1. Open **https://developer.x.com** while signed in as **@PointGoddessCc**
2. Apply / open the Developer Portal
3. Create a **Project** (e.g. `OrgSuite` or `PointGoddessCC`)
4. Create an **App** inside that project
5. Set App permissions (start with **Read**, add **Write** only if you will post via API)
6. Generate and copy:
   - API Key
   - API Key Secret
   - Bearer Token
   - Access Token + Secret (User context)
7. Confirm the **X profile photo** is the same geometric AI head used on GitHub / GitLab / Gravatar

**Never paste API secrets into chat or commit them to Git.**

After the app exists, reply with only:
- App name
- App ID  
(Do not send keys.)

---

## 2. Environment template (local only)

```bash
# X API – Point Goddess CC (DO NOT COMMIT)
X_API_KEY=
X_API_KEY_SECRET=
X_BEARER_TOKEN=
X_ACCESS_TOKEN=
X_ACCESS_TOKEN_SECRET=
X_USERNAME=PointGoddessCc
X_USER_ID=2048576362781331456
```

---

## 3. Avatar synchronization checklist

Master image = geometric AI head.

| Platform | Action | Status |
|----------|--------|--------|
| Gravatar | Primary for `pointgoddesscc@gmail.com` | Keep synced |
| GitHub | `pointgoddesscc-sketch` profile | ✅ |
| GitLab | `@pointgoddesscc` | ✅ |
| Meta | Business / Meta AI profiles | Keep synced |
| **X** | `@PointGoddessCc` profile photo | Confirm same file |

---

## 4. Tracking goals (after app is live)

| Goal | Method |
|------|--------|
| Brand / account posts | User timeline for `2048576362781331456` |
| Mentions | Search / filtered stream |
| Link to work | Include GitHub PR or OrgSuite URLs in posts |
| Identity | Same avatar + `@PointGoddessCc` everywhere |

---

## 5. Security rules

- Never commit tokens
- Never share keys in chat long-term
- Rotate if exposed
- Prefer read-only until write automation is required

---

## Related docs

- `docs/brand-identity.md`
- `docs/connectors-status.md`
- `docs/workplace-index.md`

**Hub:** orgsuite-workspace  
**Email:** pointgoddesscc@gmail.com
