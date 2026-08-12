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

## Device-specific guidance (official)

See **[docs/multi-device-strategy.md](multi-device-strategy.md)** for the full strategy.

- **Apple devices**: Best for quick reviews, on-device Apple Intelligence summaries of diffs or skill docs, and light Siri-triggered status. Use Apple for review passes. The “OrgSuite Diff Review” Shortcut works perfectly once this repo is connected.
- **Samsung Android phones**: Stronger for longer-running clone, push, and background operations (Working Copy + Termux + Tasker). Higher background reliability for continuous monitoring. Keep the heavier automation and persistent sync on the Samsung Android side.

## Tips for reliable connection

- Keep Working Copy updated.
- If authentication fails, remove the old credential in Working Copy settings and sign in again.
- After cloning, open `docs/multi-device-strategy.md` and `docs/working-copy-clone.md` so you always have the latest guidance offline.

## Related main projects

Once this workspace is cloned, you can also clone any other production repositories listed in the main README when you need them.
