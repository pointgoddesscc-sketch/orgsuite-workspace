# Secure Mail – Proton + SimpleLogin

**Status:** Documented from verified sources in GitHub (adsgpt-psemanagement).  
**Live Proton / Proton Pass / SimpleLogin account access:** Not connected via OrgSuite connectors (no Proton API connector available).  
**Account ownership:** pointgoddesscc@gmail.com / PSE Management context.

---

## Official links

| Service | URL | Purpose |
|---------|-----|---------|
| Proton Mail | https://mail.proton.me/ | Secure inbox |
| SimpleLogin | https://app.simplelogin.io/ | Email aliases management |
| Proton Pass | https://pass.proton.me/ | Password manager (related Proton ecosystem) |

---

## Verified addresses & aliases (from adsgpt-psemanagement)

These are the only addresses currently recorded in the OrgSuite GitHub source of truth:

| Label | Address | Type | Notes |
|-------|---------|------|-------|
| Proton address | `pacerssportsent@pm.me` | Proton Mail | Primary project address |
| Team | `psebank@pm.me` | Proton Mail | Team contact |
| Project alias | `igpt.flannels193@8shield.net` | SimpleLogin alias | Domain: **8shield.net** |

**Alias domain:** `8shield.net` (managed via SimpleLogin)

---

## How this relates to OrgSuite

- The AdsGPT landing page (`adsgpt-psemanagement`) publicly links these for the psemanagement.services project.
- All other OrgSuite work should prefer these secure addresses over personal Gmail when external-facing aliases are needed.
- **Never commit real passwords, recovery codes, or Proton Pass vault items** into any repository. Keep them only in Proton Pass.

---

## Proton Pass aliases – current limitation

OrgSuite currently has **no live connector** to Proton Pass or SimpleLogin APIs.

Therefore:
- I cannot automatically list or sync “all Proton Pass aliases”.
- The table above contains only what is already committed in GitHub.
- To expand the list, the owner must manually add new aliases here (or via a future authorized integration).

**Recommended next step (Requires Authorization):**  
If you want automated alias inventory, we would need either:
1. Manual export from SimpleLogin / Proton Pass → update this doc, or  
2. A future secure webhook / Make.com / Cloudflare Worker that the owner configures with a SimpleLogin API key stored only in environment variables.

---

## Security rules (mandatory)

- Never store Proton passwords, 2FA seeds, or recovery phrases in GitHub, Linear, or chat.
- Use Proton Pass for all credentials.
- Prefer SimpleLogin aliases for external services, marketing forms, and third-party sign-ups.
- Gmail (`pointgoddesscc@gmail.com`) remains the primary account for Google / GitHub / Linear connectors.

---

**Last verified from:** `pointgoddesscc-sketch/adsgpt-psemanagement` (README + index.html)  
**Hub:** orgsuite-workspace  
**Updated:** 2026-08-15
