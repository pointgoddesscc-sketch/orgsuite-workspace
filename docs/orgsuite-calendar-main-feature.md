# OrgSuite Calendar — Main Feature

**Status as of 2026-08-22 14:00 WAT**

OrgSuite Calendar is the designated **main feature** of the OrgSuite Ecosystem.

## Completed Today

Google Calendar events created on primary calendar (`pointgoddesscc@gmail.com`):

| Event | Time (WAT) | Purpose |
|-------|------------|---------|
| OrgSuite Calendar — Main Feature Activation & Family Sync | 14:00–14:30 | Activation checkpoint |
| Reminder: OrgSuite Calendar Main Feature + Device & Siri Bridge Review | 14:00–14:15 | Quick confirmation |
| OrgSuite Workplace Podcast: Calendar as Main Feature + Siri/Device Bridge | 14:30–15:00 | Workplace discussion / recording |

Linear tracking issue: **PSE-43**  
https://linear.app/pse-management/issue/PSE-43/orgsuite-calendar-main-feature-siridevice-bridge-workplace-podcast

## Family Details

- Designated Family Manager identity (android-family-manager skill): **elonfarroq@gmail.com**
- Multiple Google “Family” group calendars already exist under the connected account and are **Available**.
- Live Family Link supervision / parental controls: **Requires Authorization / User Action** on physical devices via official Google Family Link app and families.google.com.
- No remote control or unofficial APIs are used or claimed.

## Device Connections (Proposed Architecture)

Aligned with `docs/multi-device-strategy.md`:

- **Apple / Siri / HomePod** → Shortcuts / App Intents → authenticated OrgSuite Siri Bridge (`siri-bridge/`) or direct Google Calendar read via authorized token → spoken response.
- **Android (Samsung preferred for automation)** → Tasker / Automate / Google Assistant routines → Firebase callable (habit skill pattern) → OrgSuite backend.
- Sync surface: existing Firebase + OrgSuite Command Center (Vercel).

## Siri Connection (Existing Code + Extension)

The `siri-bridge/` folder already contains:
- Secure API routes (`/status`, `/query`, `/issues`)
- Bearer token auth (`ORGSUITE_SIRI_API_KEY`)
- Linear integration (server-side only)

**Next engineering step (Requires Authorization)**: extend `/query` or add `/calendar` endpoint so Siri can ask “What’s on my OrgSuite calendar?” and receive a spoken summary of today’s events (including the Family calendars when authorized).

Architecture remains strictly:
```
Siri / HomePod → Shortcuts → authenticated HTTPS (ORGSUITE_SIRI_API_KEY) → OrgSuite backend / Google Calendar → response
```
Never bypass Apple security or claim direct HomePod control.

## Workplace Podcast

The 14:30 WAT calendar event is the official workplace podcast / discussion slot.  
PSE-43 is the permanent script outline and status record.

## Status Legend Used Everywhere

- **Completed** — Calendar events & reminders created; Linear issue PSE-43 opened; this documentation committed.
- **Available** — Google Calendar connector, existing Family group calendars, Siri bridge starter code.
- **Proposed / Requires Authorization** — Live Family Link supervision, production Siri calendar query endpoint, device-side Shortcut installation, any write actions that affect real devices.

## Owner Next Actions

1. Open Google Calendar and confirm the three events for 14:00 WAT.
2. (Optional) Complete official Family Link setup under elonfarroq@gmail.com if supervised devices are desired.
3. Generate / rotate `ORGSUITE_SIRI_API_KEY` and deploy the Siri bridge routes if not already live.
4. Build the iOS Shortcut that calls the bridge (see `siri-bridge/README.md`).
5. Update the Connector Checklist document in Linear after any live change.

This document is the single source of truth for Calendar-as-main-feature until superseded.
