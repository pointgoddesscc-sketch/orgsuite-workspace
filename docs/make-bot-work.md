# Make Bot Work — workplace wiring

Linear issue: https://linear.app/pse-management/issue/PSE-80/make-bot-work-engine-workplace-wiring-google-connectors

Checklist: https://linear.app/pse-management/document/orgsuite-connector-rollout-checklist-and-status-2f33b168b2b9

GitHub: https://github.com/pointgoddesscc-sketch/orgsuite-workspace

Command Center (existing, not this engine): https://orgsuite-command-center.vercel.app

## Verified 2026-09-09 20:00 WAT

Connected after live probe: Linear, GitHub, Gmail, Google Calendar, Google Drive (PIP), Outlook.

Requires Authorization: Google Contacts, Google Chat, Teams, Make.com team run, GoDaddy keys, Anthropic key.

Available / Ready to Configure: Gemini tools, Grok session, local engine, Meta AI templates.

The local engine does not inherit Grok OAuth tokens. Host env + official OAuth apps are still required for the engine process to call Google APIs itself.
