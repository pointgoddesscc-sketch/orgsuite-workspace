# Make Bot Work — workplace wiring

Linear issue: https://linear.app/pse-management/issue/PSE-80/make-bot-work-engine-workplace-wiring-google-connectors

Checklist: https://linear.app/pse-management/document/orgsuite-connector-rollout-checklist-and-status-2f33b168b2b9

GitHub: https://github.com/pointgoddesscc-sketch/orgsuite-workspace

## Live surfaces (ours)

- Primary domain: https://pse-sent.com
- Vercel console (PSE SENT): https://orgsuite-make-bot-work.vercel.app
- Workplace bots: https://orgsuite-workplace-bots.vercel.app
- Command Center: https://orgsuite-command-center.vercel.app
- Codex Command Center: https://orgsuite-codex-command-center.vercel.app

`*.grok.me` pages are not OrgSuite hosts. Do not list them as workplace URLs.
Grok chat login stays on the vendor site https://grok.com — that is not a pse-sent property.

## Verified 2026-09-23 04:16 WAT

Connected this session: Linear, GitHub, Gmail, Outlook.

Owner asked to remove grok.me from workplace paper and keep pse-sent.com / PSE SENT Vercel as the public surfaces.

The local engine does not inherit Grok OAuth tokens. Host env + official OAuth apps are still required for the engine process to call Google APIs itself.
