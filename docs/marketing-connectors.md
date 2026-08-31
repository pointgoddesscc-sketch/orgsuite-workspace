# Marketing connectors – Meta Ads + Spotify Ads

Official source: private repo `pointgoddesscc-sketch/orgsuite-marketing-connectors`.

This session has **no Meta Marketing API connector** and **no Spotify Ads connector**. Docs and placeholders only.

## Named platforms

| Platform | Official path | Status |
|----------|---------------|--------|
| Meta Ads / Insights / CAPI | Meta Business Manager + Marketing API | Ready to Configure |
| Spotify Ads / Analytics | Spotify Developer Dashboard | Ready to Configure |
| Canva creative | Workplace Canva connector | Available |

Related Vercel projects already exist: `orgsuite-meta-ai-agent`, `orgsuite-meta-developers`.

## Owner-only token step

Create tokens in the official portals. Store them only in Vercel / host env:

- `META_APP_ID`
- `META_APP_SECRET`
- `META_ACCESS_TOKEN`
- `META_AD_ACCOUNT_ID`
- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`

Never paste those values into chat.

Start Meta with `ads_read` only.
