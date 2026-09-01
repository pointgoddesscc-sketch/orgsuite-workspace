# Canary Mail Copilot — OrgSuite connection boundary

Status date: 2026-09-01

## Verdict

**GitHub Copilot cannot connect to Canary Mail Copilot.**
There is no official Canary Copilot API, OAuth app, GitHub App, MCP server, or webhook that OrgSuite, Grok, or GitHub Copilot can call.

Canary Mail Copilot is an **in-app feature** of the Canary Mail client. Generative compose/summary traffic goes to Canary’s own `ai.canarymail.io` path when Copilot is enabled on a licensed device. That path is not published for third-party apps.

## Verified this session (Grok)

| Surface | Status | Evidence |
|---|---|---|
| GitHub account | **Connected** | `github___get_me` → `pointgoddesscc-sketch` |
| Grok Gmail connector | **Connected** | mailbox `alonejamesowns@gmail.com` |
| Canary Mail ↔ Google on that mailbox | **Already authorized** | Google security alert 22 Aug 2026 |
| OrgSuite Gmail label | **Completed** | `OrgSuite` / `Label_3` |
| Live test send into that mailbox | **Completed** | subject `OrgSuite × Canary Mail — setup completed` |
| GitHub Copilot Chat as a live Grok tool | **Not available** | Copilot skill is guidance only; no Copilot connector in this session |
| Canary Mail Copilot API | **Not available** | Official Canary pages list no developer API |

## Correct architecture

```
GitHub Copilot / Grok / Codex
        ↓  (code + docs only)
orgsuite-workspace on GitHub
        ↓
Gmail API  →  alonejamesowns@gmail.com
        ↓  (IMAP / Google OAuth client sync)
Canary Mail app
        ↓  (in-app only)
Canary Mail Copilot  (ai.canarymail.io)
```

Use each Copilot in its own product:

- **GitHub Copilot** — code in VS Code / `gh copilot` / Copilot Chat on GitHub. See `docs/copilot-cli-integration.md`.
- **Canary Mail Copilot** — drafts, summaries, and search **inside** Canary Mail after the Gmail account is added. Device-side. Pro restore notes: `docs/canary-mail-pro-restore.md`.
- **OrgSuite mail automation** — Gmail draft/send/label on `alonejamesowns@gmail.com`, then Canary displays the message.

## Official Canary links (not APIs)

- Product: https://canarymail.io
- Copilot / AI page: https://canarymail.io/features/ai
- Integrations (Asana + Todoist only): https://canarymail.io/integrations
- FAQ: https://canarymail.io/help/frequently-asked-questions
- Feature requests: https://canarymail.frill.co/b/90p891vj/feature-ideas
- Help: https://canarymail.io/help

## Do not use

- https://docs.canary.tools/ — Thinkst Canarytokens, different product
- http://canarymsg.dev/ — unrelated messaging API
- Unofficial Copilot-API proxies — not OrgSuite policy and not Canary Mail

## Owner device steps for Canary Copilot

These cannot be completed from GitHub or Grok:

1. Open Canary Mail on iPhone / Mac / Windows.
2. Confirm `alonejamesowns@gmail.com` is Connected.
3. Settings → Copilot → enable the features you want.
4. Restore Pro on the purchase mailbox if Copilot is locked (`docs/canary-mail-pro-restore.md`).
5. Optional: request a public API on the Canary Frill board.

## Related repos

- https://github.com/pointgoddesscc-sketch/orgsuite-workspace (this file)
- https://github.com/pointgoddesscc-sketch/orgsuite-canary-ios-acknowledgements
- https://github.com/pointgoddesscc-sketch/orgsuite-copilot-edge-integration (GitHub / Edge Copilot notes only)
