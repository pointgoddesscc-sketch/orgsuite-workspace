# Make Bot Work — workplace wiring

Linear issue: https://linear.app/pse-management/issue/PSE-80/make-bot-work-engine-workplace-wiring-google-connectors

Checklist: https://linear.app/pse-management/document/orgsuite-connector-rollout-checklist-and-status-2f33b168b2b9

GitHub: https://github.com/pointgoddesscc-sketch/orgsuite-workspace

## Live surfaces

- Grok Forge (xAI product): https://workwithbot.grok.me/
- Vercel console (PSE SENT): https://orgsuite-make-bot-work.vercel.app
- Existing workplace bots: https://orgsuite-workplace-bots.vercel.app
- Command Center: https://orgsuite-command-center.vercel.app

`workwithbot.grok.me` is an xAI-hosted Forge login. It cannot be attached as a Vercel custom domain. The workplace console is the Vercel project; Forge remains the bot builder.

## Verified 2026-09-09 20:10 WAT

Connected: Linear, GitHub, Vercel (PSE SENT), Gmail, Google Calendar, Google Drive (PIP), Outlook.

Requires owner OAuth tap in Grok: Google Contacts, Google Chat.

PR #10 is merged. Follow-up branch `pse-80-public-console` records the public console.

The local engine does not inherit Grok OAuth tokens. Host env + official OAuth apps are still required for the engine process to call Google APIs itself.
