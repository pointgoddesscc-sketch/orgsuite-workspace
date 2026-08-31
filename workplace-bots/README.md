# OrgSuite Workplace Bots

Static, mobile-first teammate layer for the PSE Management workplace.

Linear: [PSE-68](https://linear.app/pse-management/issue/PSE-68/orgsuite-workplace-bots-official-connector-agent-layer-not-grok-bot)

This is **not** the App Store app “Grok Bot” (`id 6794501026`, bundle `co.anysphere.sand`). That product is a cloud-computer agent that signs into websites. OrgSuite does not copy that model.

## Status labels

| Label | Meaning |
| --- | --- |
| Connected | Live connector call succeeded this session (GitHub identity, Linear team, Vercel team list). |
| Available | Official connector tools exist in this Grok account. Not every tool was executed. |
| Ready to Configure | Workplace docs mention it; live probe not completed here. |
| Proposed | Architecture only (Apple Home / HomePod via Shortcuts → OrgSuite API). |
| Requires Authorization | Owner must approve before any use. App Store Grok Bot is rejected as architecture. |

## Security

- Official OAuth/OIDC connectors only.
- No passwords, PATs, or Client Secrets in this folder.
- Draft-first for send email, post Teams, create calendar events, Stripe writes, merge/deploy.
- This UI stores the approval queue in `localStorage` only. It does not call APIs.

## Local preview

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 4173 --directory workplace-bots
```

## Deploy (Requires Authorization)

Vercel team **PSE SENT** (`team_IfFgefLTTgP15yi83r8Y7ncx`) is Connected for listing. Creating a production deployment for this folder was **not** performed.

Suggested project name if the owner deploys: `orgsuite-workplace-bots`.
Link GitHub repo `pointgoddesscc-sketch/orgsuite-workspace`, root `workplace-bots`.

## Verified this slice (2026-08-31)

- GitHub user `pointgoddesscc-sketch`
- Linear team PSE Management / project OrgSuite Codex App / issue PSE-68
- Vercel team PSE SENT
