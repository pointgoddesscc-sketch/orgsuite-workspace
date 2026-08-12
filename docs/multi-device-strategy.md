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

### Apple side
1. Working Copy already documented in `docs/working-copy-clone.md`
2. Create a Shortcut named "OrgSuite Review":
   - Get contents of latest PR or Linear issue
   - Summarize with Apple Intelligence
   - Speak or show the summary
3. Optional Siri phrase: "Review OrgSuite"

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
