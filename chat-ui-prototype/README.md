# OrgSuite Chat UI Prototype

Static, approval-gated chat surface for the OrgSuite workplace.

**Status:** Prototype completed in Git. Live API send from this page: **not connected**.

## What this UI is

A mobile-first conversation hub that lists official OrgSuite chat and mail surfaces in one pane:

- Grok / xAI
- ChatGPT
- Meta AI
- Telegram
- Copilot
- Microsoft Teams
- **Canary Mail** (device email client — not a vendor API)

## Canary Mail — honest integration

Canary Mail is an **email client**, not a provider and not a public OrgSuite login API.

| Layer | Status | What happens |
|---|---|---|
| Chat UI channel tile | **Completed** | Canary appears as a first-class thread |
| Gmail / Outlook connectors | **Available** | Drafts/sends go through those official connectors |
| Device Canary accounts | **Ready to Configure** | Owner adds Gmail/Outlook/IMAP inside the Canary app |
| Canary Copilot / Pro restore | **Requires Authorization** | In-app purchase on the Pro mailbox only |
| Direct Canary API | **Not available** | Do not claim Grok signed into Canary |

Delivery path:

`OrgSuite Chat UI → Gmail or Outlook draft (approval) → mailbox sync → Canary unified inbox`

Tracked on [PSE-62](https://linear.app/pse-management/issue/PSE-62/canary-mail-multi-gmail-inbox-telegram-bot-delivery-plane).

## Open locally

Open `index.html` in a browser. No secrets. Queue stays in `localStorage`.

## Related

- `docs/canary-mail-pro-restore.md`
- `docs/connectors-status.md`
- `workplace-bots/`
- https://github.com/pointgoddesscc-sketch/orgsuite-canary-ios-acknowledgements
