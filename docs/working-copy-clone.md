# Working Copy – Connect OrgSuite Repository

**Official way to connect the OrgSuite workspace on both Apple and Samsung devices.**  
Account: pointgoddesscc@gmail.com / pointgoddesscc-sketch

## One-time clone (do this on every device you want connected)

1. Open the **Working Copy** app.
2. Tap the **+** button → choose **Clone repository**.
3. Paste this exact URL:

```
https://github.com/pointgoddesscc-sketch/orgsuite-workspace.git
```

4. When asked to authenticate:
   - Prefer **GitHub** sign-in (or Personal Access Token if you already use one).
   - Use the account that owns `pointgoddesscc-sketch`.
5. Wait for the clone to finish, then open the repository.

You now have the full OrgSuite Workspace connected and ready.

## Daily use after connection

- Before any work: **Pull**
- After local edits: Commit → Push (best practice: create a branch + open a Pull Request)
- After merges happen on GitHub: **Pull** again so your device stays in sync

## HTTP Customization & Cookies (Official)

Working Copy Settings → **HTTP Customization** (the screen with the Cookies section) is now documented as an official OrgSuite configuration surface.

**Full guide (source of truth):**  
https://github.com/pointgoddesscc-sketch/orgsuite-working-copy-shortcuts/blob/main/docs/http-customization-cookies.md

**Default rule for all OrgSuite repos**:
- Leave the Cookies list empty
- Prefer SSH keys (Secure Enclave) or Personal Access Tokens
- Only add headers or cookies when a specific host documentation requires them, and never store secrets in the repository

After you clone this workspace, open the guide above (or the local copy once you also clone `orgsuite-working-copy-shortcuts`) and apply any needed non-secret headers on the device.

## Device-specific guidance (official)

See **[docs/multi-device-strategy.md](multi-device-strategy.md)** for the full strategy.

- **Apple devices**: Best for quick reviews, on-device Apple Intelligence summaries of diffs or skill docs, and light Siri-triggered status. Use Apple for review passes. The “OrgSuite Diff Review” Shortcut works perfectly once this repo is connected.
- **Samsung Android phones**: Stronger for longer-running clone, push, and background operations (Working Copy + Termux + Tasker). Higher background reliability for continuous monitoring. Keep the heavier automation and persistent sync on the Samsung Android side.

## Tips for reliable connection

- Keep Working Copy updated.
- If authentication fails, remove the old credential in Working Copy settings and sign in again.
- After cloning, open `docs/multi-device-strategy.md` and `docs/working-copy-clone.md` so you always have the latest guidance offline.
- Review Settings → HTTP Customization using the official guide above.

## Related main projects

Once this workspace is cloned, you can also clone any other production repositories listed in the main README when you need them.
