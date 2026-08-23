# Siri ↔ OrgSuite Bridge

**Date:** 2026-08-23  
**Status:** Design & documentation **Completed** · Live on-device installation **Requires Authorization**

## Architecture (Apple-supported only)

```
Siri / HomePod
  → Shortcut (or App Intent) on-device
  → HTTPS POST to authenticated OrgSuite endpoint
  → Short speakable JSON response
  → Siri speaks the reply
```

No direct HomePod control. No bypass of iCloud, Face ID, or Sign in with Apple.

## 1. Shortcut Specification — Completed

- **Name:** OrgSuite Status (or Ask OrgSuite)
- **Triggers:** “Hey Siri, OrgSuite status”, “Hey Siri, ask OrgSuite”, etc.
- **Core action:** Get Contents of URL → POST `/api/siri` with Bearer token
- **Auth:** Token stored only in Shortcuts Secure storage / Keychain — never hard-coded in a shared file
- **Response fields used:** `message` / `spoken`, `status`, optional `error`
- **Failure handling:** Clear spoken fallbacks for network / auth / empty reply

Full action sequence and I/O contract are in the sandbox package and can be recreated on any device.

## 2. Secure Endpoint Design — Completed

- **Route:** `POST /api/siri`
- **Env:** `SIRI_API_TOKEN` (required), optional `XAI_API_KEY`
- **Security:** Timing-safe token compare, POST only, no-store, short speakable replies, no token logging
- **Reference implementation:** prepared as Vercel-style serverless handler

Live deployment of the route = **Requires Authorization**.

## 3. Multi-Device Checklist — Completed

Covers iPhone, iPad, Mac, HomePod, and Apple Watch.

All devices must share the same iCloud account. HomePod speaks the same `spoken` field. Actual installation and verification on each device = **Requires Authorization** (owner only).

## 4. What you do next (owner)

1. Deploy `/api/siri` (new project or add to existing OrgSuite Vercel project)
2. Set `SIRI_API_TOKEN` in Vercel
3. Create the Shortcut on a primary device and store the matching token securely
4. Sync / enable on remaining devices and HomePod
5. Test with “Hey Siri, OrgSuite status”

## Related

- Sandbox package: `orgsuite-siri-bridge/` (docs + reference `siri.js`)
- Existing Apple platform notes under OrgSuite Apple material
- Bot + X bridge docs (separate track)

No secrets stored. No device installation claimed.
