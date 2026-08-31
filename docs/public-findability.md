# OrgSuite public findability

**Issue:** [PSE-69](https://linear.app/pse-management/issue/PSE-69/public-findability-google-outlook-and-official-orgsuite-surfaces)  
**Updated:** 2026-08-31  
**Status:** Plan published. Google ranking, Search Console, custom domain, and social posts still require owner authorization.

## What OrgSuite is

OrgSuite is the unified workplace ecosystem for Point Goddess CC / PSE Management. It connects multi-AI work (Grok, ChatGPT/Codex, Copilot, and authorized companions), official connectors (GitHub, Linear, Vercel, Outlook, Gmail, Calendar, Teams, Notion, Figma, Stripe, Canva), secure domain operations, and family-safe home and device workflows into one command center.

Use that paragraph as the first text on every public page, README, email signature, and profile bio.

## Official public URLs (verified live)

| Surface | URL | Role |
|---------|-----|------|
| Codex Command Center | https://orgsuite-codex-command-center.vercel.app/ | Live engineering surface |
| OrgSuite Command Center | https://orgsuite-command-center.vercel.app/ | Unified AI org hub |
| GitHub workspace | https://github.com/pointgoddesscc-sketch/orgsuite-workspace | Public source of truth |
| OrgSuite Connect | https://github.com/pointgoddesscc-sketch/orgsuite-connect | Public landing-page repo |
| Linear project | https://linear.app/pse-management/project/orgsuite-codex-app-9146b449b7a1 | Workplace board |

## Why generic Google search does not yet show OrgSuite first

1. The brand name collides with OrtSuite, OSuite, office-suite pages, and LaSuite.
2. Current live sites are command centers, not SEO landing pages with unique titles, meta descriptions, and Organization schema.
3. There is no verified custom domain + Google Search Console property documented as complete.
4. GitHub READMEs describe operator workflow more than public product positioning.

Search engines index what is public, unique, and repeatedly linked. They do not rank a product because connectors exist.

## Recommended public title and description

- **Title (50–60 chars):** OrgSuite — Unified AI workplace for PSE Management
- **Meta description (150–160 chars):** OrgSuite connects Grok, ChatGPT/Codex, Copilot, GitHub, Linear, Vercel, Outlook, and secure domains into one command center for Point Goddess CC.
- **Short social line:** OrgSuite is the official workplace OS for Point Goddess CC / PSE Management — one hub for AI, connectors, and operations.

## SEO work that actually moves ranking

### Ready to configure on existing Vercel sites

- Unique `<title>` and `<meta name="description">` on each public page
- Open Graph + Twitter cards pointing at the official logo
- `robots.txt` allowing crawl of public pages only
- `sitemap.xml` listing only public URLs
- JSON-LD `Organization` + `WebSite` with official name **OrgSuite**
- One H1: "OrgSuite" and one first paragraph matching the positioning above
- Canonical URL once a custom domain is attached

### Requires Authorization (owner only)

- Attach a custom domain (for example `orgsuite.*` if owned in GoDaddy) to the public marketing site
- Verify the domain in [Google Search Console](https://search.google.com/search-console)
- Request indexing of the canonical About page
- Update GitHub profile bio and X @PointGoddessCc with the same one-line description
- Publish social posts only through existing approval gates (PSE-45, PSE-47, PSE-66)

## Outlook and Gmail

Do not send unsolicited announcements to strangers. Use:

1. An official signature on outbound mail.
2. Owner-reviewed drafts in Outlook and Gmail Drafts.
3. Internal workplace distribution only after the owner sends or approves send.

### Signature block

```
OrgSuite | Point Goddess CC / PSE Management
Unified AI workplace · GitHub · Linear · Vercel · Outlook
https://orgsuite-codex-command-center.vercel.app/
https://github.com/pointgoddesscc-sketch/orgsuite-workspace
```

## What was completed on 2026-08-31

- Connector inventory confirmed available in Grok: GitHub, Linear, Vercel, Outlook, Gmail, Notion, Figma, Canva, Calendar, Calendly, Teams, Stripe, Automations.
- Linear issue PSE-69 created and assigned.
- This public findability document added to the workspace hub.
- README updated to lead with public positioning.
- Outlook and Gmail drafts prepared for owner review (not sent unless the owner sends them).

## What is not claimed

- No new OAuth connections were created in this pass.
- Google Search Console was not verified.
- No social network was auto-posted.
- No unsolicited email was sent.
- Ranking on Google is not instant and cannot be guaranteed.
