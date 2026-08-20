# OrgSuite Siri Bridge (iOS 27)

Secure bridge between Siri AI / Shortcuts on iPhone 17 Pro Max and the OrgSuite workplace (Linear + Command Center).

## Current Status

| Component | Status |
|-----------|--------|
| Starter code | Available in this folder |
| Live authenticated endpoint | Requires Authorization (you must set secret + deploy) |
| Shortcut on device | Requires you to build it |
| Linear tracking issue | Blocked until Linear connector is re-authenticated |

## Security Rules (Non-negotiable)

- `ORGSUITE_SIRI_API_KEY` is the only secret the iPhone ever sees.
- Linear API key stays server-side only (`LINEAR_API_KEY`).
- Never put Linear tokens, Vercel tokens, or other secrets in Shortcuts or this chat.
- Write actions always return `requires_confirmation: true` so Siri AI asks the user before proceeding.
- Rate limiting and input length limits should be added before production traffic.

## Required Environment Variables (Vercel Dashboard)

```
ORGSUITE_SIRI_API_KEY=   # generate with: openssl rand -hex 32
LINEAR_API_KEY=          # existing server-side key used by Command Center
```

## Endpoints

Base: `https://orgsuite-codex-command-center.vercel.app/api/siri` (or your final domain after deploy)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/status` | Read-only workplace summary |
| POST | `/query` | Natural-language query against checklist + projects |
| POST | `/issues` | Create Linear issue (confirmation required) |

All requests require header:
```
Authorization: Bearer <ORGSUITE_SIRI_API_KEY>
```

## Remaining Owner Steps

1. Generate a strong key: `openssl rand -hex 32`
2. Vercel project → Settings → Environment Variables → add `ORGSUITE_SIRI_API_KEY`
3. Redeploy the project (or the siri-bridge routes)
4. Build the Shortcut on your iPhone 17 Pro Max using the exact steps provided in the conversation
5. Re-authenticate the Linear connector so the tracking issue can be created under OrgSuite Codex App

## Shortcut Outline (build on device)

1. Ask for Input / Dictate Text
2. Get Contents of URL (POST + Bearer header + JSON body)
3. Parse `summary` and `requires_confirmation`
4. If confirmation required → Show Alert
5. Use Model (Apple Intelligence) for natural voice summary
6. Speak / Show Result

See the main conversation for the full action-by-action list.
