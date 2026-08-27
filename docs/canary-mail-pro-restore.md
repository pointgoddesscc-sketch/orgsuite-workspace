# Canary Mail Pro restore + SimpleLogin send-as (PSE-62)

Status date: 2026-08-27

## License owner (owner-stated)

- **Pro holder:** `Chrisemerson360agency@gmail.com`
- Workplace / GitHub / Linear identity: `pointgoddesscc@gmail.com`
- Placeholder mailbox: `alonejamesowns@gmail.com`

Canary Pro is a **single-user in-app purchase**. Grok cannot restore it remotely. Restore only works on a device where the purchase mailbox is added and Connected.

### Device restore (owner action)

1. Open Canary Mail.
2. Settings → Accounts → Add Account → Google OAuth for `Chrisemerson360agency@gmail.com`.
3. Confirm that account status is **Connected**.
4. Open Get Pro / Restore Purchases and select **Chrisemerson360agency@gmail.com**.
5. Copilot toggles stay under Settings → Copilot (in-app only).
6. Optionally add `pointgoddesscc@gmail.com` and `alonejamesowns@gmail.com` to the same unified inbox. They do not hold this Pro seat unless a separate purchase is restored on them.

## What is not a Canary API

There is no public Canary Copilot API, certificate, or GitHub App that logs Grok into Canary. Mail reaches Canary only because Canary is a client of Gmail / Outlook / IMAP.

## Verified workplace surfaces (2026-08-27)

| Surface | Status | Evidence |
|---|---|---|
| GitHub `pointgoddesscc-sketch` | Connected | `github___get_me` |
| Grok Gmail connector | Connected | labels include Vantage/* and OrgSuite/* |
| Vercel team `pse-sent` | Connected | hobby plan, GitHub-linked projects |
| `orgsuite-ai-gateway` OpenAI | Connected (env present) | `GET /api/ai/status` → `openai: true`, model `gpt-4o` |
| Gateway Gemini / Claude / Grok env | Connected | same status payload |
| Gateway Telegram env | Connected (key present) | `telegram: true`, `primary: true` — bot username still owner-confirmed on PSE-47 |
| SimpleLogin list/create code | Available | `orgsuite-safari` + Vercel project `safari` READY |
| Canary in-app Copilot | Ready to Configure / device | owner screenshot, Pro on Chrisemerson |
| Gmail Send-as for SimpleLogin aliases | Ready to Configure | must be verified in Google Account |

Do not paste `OPENAI_API_KEY`, `SAFARI_API_KEY`, or `SIMPLELOGIN_API_KEY` into GitHub or Linear. Keys stay in Vercel Environment Variables.

## SimpleLogin aliases that can send

Inbound: alias → mailbox already added in Canary.

Outbound (required for “send as the alias”):

1. In [Google Account → Send mail as](https://mail.google.com/mail/u/0/#settings/accounts) on the mailbox that receives the alias (usually Chrisemerson or pointgoddesscc).
2. Add each SimpleLogin alias → verify the confirmation mail.
3. In Canary, that alias appears as a From identity on the same account after sync.
4. From Grok, `gmail_create_draft` / `gmail_send_message` `from` field may be set **only** after Google has verified that alias on the connected connector mailbox.

Until Send-as is verified, Grok sends from the connector default address only.

Related code (no secrets):

- https://github.com/pointgoddesscc-sketch/orgsuite-safari
- https://github.com/pointgoddesscc-sketch/orgsuite-proton-mail-integration
- Workspace notes: `docs/secure-mail-proton-simplelogin.md`, `docs/simplelogin-selfhost-control.md`, `docs/orgsuite-agent-simmple-login.md`

## OpenAI on Vercel (already wired)

Production status URL:

`https://orgsuite-ai-gateway-pse-sent.vercel.app/api/ai/status`

Use that gateway for workplace drafting that is **not** Canary Copilot. Canary Copilot still uses Canary’s `ai.canarymail.io` path and Copilot credits on the Pro seat.

If a new env key is required, owner adds it in Vercel → Project → Settings → Environment Variables → Production. Never commit the value.

## Grok send path (best practice)

1. Draft first (`gmail_create_draft`).
2. Label `OrgSuite/From-Grok`.
3. Owner reviews in Gmail or Canary.
4. Send only after explicit approval.
5. Use `from` only when the alias is a verified Google Send-as on the connected mailbox.
