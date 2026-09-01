# OrgSuite Chat UI Prototype

Path: `chat-ui-prototype/` in `orgsuite-workspace`.

## Status

| Item | Label |
|---|---|
| Static Chat UI | **Completed** |
| Canary Mail channel tile | **Completed** |
| Live send from the prototype page | **Not connected** |
| Gmail / Outlook delivery into Canary | **Available** (connector) / **Ready to Configure** (device accounts) |
| Canary vendor API | **Not available** |

## Canary Mail in the prototype

Canary is listed as a conversation channel so workplace mail is visible next to Grok, ChatGPT, Meta AI, Telegram, Copilot, and Teams.

It is **not** a login integration. The only supported path is:

1. Draft in this UI (local queue)
2. Owner approves a Gmail or Outlook send
3. The message lands in the mailbox
4. Canary Mail, already signed into that mailbox on device, shows it

Linear: [PSE-62](https://linear.app/pse-management/issue/PSE-62/canary-mail-multi-gmail-inbox-telegram-bot-delivery-plane)
