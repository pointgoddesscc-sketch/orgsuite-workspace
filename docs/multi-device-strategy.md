# OrgSuite Multi-Device Strategy

**Official guidance – effective 2026-08-12**  
Account: pointgoddesscc@gmail.com / pointgoddesscc-sketch  
Linked to Linear PSE-25 and Skills Inventory.

## Core Principle (locked in)

**Apple devices** → best for quick reviews, on-device Apple Intelligence summaries of diffs or skill docs, and light Siri-triggered status. Use them for review passes.

**Samsung Android phones** → stronger for longer-running clone, push, and background operations (Working Copy + Termux + Tasker). Higher background reliability for continuous monitoring. Keep the heavier automation and persistent sync here.

This is the permanent rule for the entire OrgSuite Ecosystem.

---

## Apple devices – Review Surface

Use Apple for:
- Quick reviews
- On-device Apple Intelligence summaries of diffs, skill docs, PRs, and Linear issues
- Light Siri-triggered status
- Short interactive work and review passes

### Ready-to-build Shortcut: OrgSuite Diff Review

1. Open **Shortcuts** → **+**
2. **Get Clipboard**
3. **If** Clipboard has text (else alert “No text on clipboard”)
4. **Summarize Text** / Apple Intelligence action → Concise or Bullet Points
5. **Show Result** (or **Speak Text**)
6. Optional: **Copy to Clipboard** + **Open App** → Working Copy
7. Rename to **OrgSuite Diff Review**
8. Add to Siri → “Review this diff” or “OrgSuite Diff”

**Daily use:** Copy any diff → run Shortcut or say the Siri phrase → instant on-device summary.

---

## Samsung Android phones – Automation Surface

Use Samsung for:
- Longer-running clone, push, and sync jobs
- Continuous repo monitoring
- Background reliability while the device is locked
- All persistent automation

### Concrete starter setup

1. Install **Working Copy**, **Termux**, and **Tasker** (or Automate).
2. In Termux, create a simple status script:

```bash
#!/data/data/com.termux/files/usr/bin/bash
cd ~/storage/shared/git/orgsuite-workspace 2>/dev/null || cd ~/orgsuite-workspace
echo "=== OrgSuite status $(date) ==="
git fetch --quiet
git status -sb
```

Save it as `~/orgsuite-status.sh` and make executable (`chmod +x`).

3. Tasker examples:
   - **Profile**: Wi-Fi Connected → Task: Run Termux script + notify only if status changed
   - **Profile**: Time every 4 hours → silent status check
   - **Profile**: Notification from GitHub → Open Working Copy to the repo

Keep the Samsung phone as the always-on automation surface. Apple stays for clean, fast review passes.

---

## Security (non-negotiable)
- No credentials stored in Tasker, Shortcuts, Termux scripts, or this repository
- Authentication lives only inside Working Copy / system keychain
- Secrets stay in Vercel environment variables or device Keychain only

## Linked Workplace Items
- Linear: PSE-25
- Skills & Modes Inventory document
- This file is the single source of truth for device choice

Update whenever real-world behavior changes.
