# OrgSuite Multi-Device Strategy

**Official guidance – effective 2026-08-12**  
Account: pointgoddesscc@gmail.com / pointgoddesscc-sketch  
Linked to Linear PSE-25 and Skills Inventory.

## Core Principle

Use the right device for the job so the Ecosystem stays fast, reliable, and low-friction.

### Apple devices (iPhone / iPad / Mac)
**Best for quick reviews, on-device intelligence, and light status.**

- On-device Apple Intelligence summaries of diffs, skill docs, PRs, and Linear issues
- Light Siri-triggered status checks ("Hey Siri, pull OrgSuite status")
- Quick review passes and short commits via Working Copy
- Share Sheet → log conversation or create Linear note
- Prefer Apple when you are reviewing, summarizing, or doing short interactive work

### Samsung Android phones
**Stronger choice for longer-running operations and background reliability.**

- Longer-running clone, push, and sync jobs
- Working Copy + Termux for continuous repo monitoring
- Tasker profiles that trigger on network change, schedule, or notification
- Higher background reliability than pure Apple Shortcuts for persistent sync
- Prefer Samsung Android for automation that must keep running while the device is locked or in the background

## Practical Setup (real-life)

### Apple side – OrgSuite Diff Review Shortcut

Create this Shortcut once on your iPhone or iPad (requires Apple Intelligence capable device for best results).

**Name:** OrgSuite Diff Review

**Steps to build in the Shortcuts app:**

1. Open **Shortcuts** → tap **+** to create a new Shortcut.
2. Add action: **Get Clipboard** (or **Receive** if you want Share Sheet support).
3. Add action: **If** → If Clipboard has text → Continue, else Show Alert "No text on clipboard".
4. Add action: **Summarize Text** (Apple Intelligence) or **Create Summary** / **Rewrite Text** depending on iOS version.
   - Input: Clipboard contents
   - Style: Concise or Bullet points (choose what works best for code diffs)
5. Add action: **Show Result** (or **Speak Text** if you want audio review).
6. Optional: Add **Copy to Clipboard** so the summary is ready to paste into Linear or a PR comment.
7. Optional: Add **Open App** → Working Copy if you want to jump straight back to the repo.
8. Tap the Shortcut name at the top → Rename to **OrgSuite Diff Review**.
9. Tap the share icon → Add to Siri → record the phrase **"Review this diff"** or **"OrgSuite Diff"**.

**How to use every day:**
- Copy any git diff, PR description, or Linear comment on your Apple device.
- Run the Shortcut (or say "Hey Siri, Review this diff").
- Get an on-device Apple Intelligence summary instantly.

This keeps heavy automation on Samsung and fast review passes on Apple, exactly as designed.

### Samsung Android side
1. Install Working Copy + Termux + Tasker (or Automate)
2. Termux: keep a lightweight `git status` / `git pull --dry-run` script that can be called from Tasker
3. Tasker profile examples:
   - On Wi-Fi connected → run background status check
   - Every 4 hours → silent pull status and notify only on change
   - On notification from GitHub → open Working Copy to that repo
4. Keep the Samsung device as the "always-on" automation surface for the workspace

## Security
- No credentials stored in Tasker, Shortcuts, or this repo
- Authentication stays inside Working Copy / system keychain
- All secrets remain in Vercel env or device Keychain only

## Linked Workplace Items
- Linear: PSE-25 (beta + multi-device)
- Document: OrgSuite Skills & Modes Inventory
- This file is the source-of-truth guidance for device choice

Update this document whenever real-world device behavior changes.
