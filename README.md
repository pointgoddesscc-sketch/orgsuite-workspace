# OrgSuite Workspace

## Current Status (2026-08-11)

- Working Copy clone: complete
- GitHub plugin: authorized with admin access
- ChatGPT Codex + Remote: connected
- GitHub Actions: active
- Brand avatar: synced across GitHub, GitLab, X, Gravatar, Meta
- All connectors: live under [pointgoddesscc@gmail.com](mailto:pointgoddesscc@gmail.com)

**Primary professional hub for Point Goddess CC / PSE Management**

This is the recommended repository to clone into **Working Copy** on iPhone and to remotely control **ChatGPT Codex** via GitHub.

---

## Quick Start – Working Copy (iPhone)

1. Open **Working Copy**
2. Open (or clone) this repository:
   ```
   https://github.com/pointgoddesscc-sketch/orgsuite-workspace.git
   ```
   Prefer the clean local name **orgsuite-workspace-2** if you already use it.
3. Tap **Pull** to receive the latest files

### Configure Git identity (required once per repo if missing)

1. Open the repository → **Configuration**
2. Set:
   - **Name:** `Point Goddess CC`
   - **Email:** `pointgoddesscc@gmail.com`
3. Save

Without identity, commits may fail or show “Identity not configured”.

---

## Daily professional workflow (with Push)

```text
1. Working Copy → Pull
2. Configure identity if needed (name + email above)
3. Make changes (or receive them via Codex PR merge)
4. Commit
5. Push  ← required to publish commits to GitHub
6. Open / merge Pull Request on GitHub when using a feature branch
7. Working Copy → Pull again
```

### Push step (Working Copy)

1. After **Commit**, open the repository status
2. Tap **Push** (or Pull/Push control)
3. Confirm push to `origin` (usually `main` or your feature branch)

**Do not force-push to `main`.** Force push can overwrite history and break the hub. Use a normal Push only. If a push is rejected, Pull first, resolve conflicts, then Push again.

---

## Quick Start – Remote ChatGPT Control

1. Desktop ChatGPT (pointgoddesscc@gmail.com) → Codex → Connect GitHub plugin → authorize this repo
2. iPhone ChatGPT → Codex → **Remote** → pair with desktop
3. Work via Remote; changes flow through GitHub → Working Copy (Pull)

Full guide: `docs/remote-chatgpt-control.md`

---

## Primary daily repos

| Repo | Role |
|------|------|
| **orgsuite-workspace** | Documentation hub + workflow |
| **simmple-login** | OrgSuite Agent (Cloudflare Workers AI) |
| **slack-bot** | Slack automation |
| **stripe-dashboard** | Stripe dashboard |
| **marketing-page** | Vercel marketing site |

Secondary clones (e.g. `llm-chat-app-mail` on GitLab) are optional after you commit any pending work there.

---

## What is included

| Path | Purpose |
|------|---------|
| `docs/remote-chatgpt-control.md` | Remote + Working Copy + GitHub |
| `docs/connectors-status.md` | Connectors status |
| `docs/avatar-sync.md` | Avatar tracking matrix |
| `docs/brand-identity.md` | Brand identity |
| `docs/x-api-tracking.md` | X API tracking |
| `docs/workplace-index.md` | Repository index |
| `.githooks/` | pre-commit + post-merge |
| `.github/workflows/` | docs-check + secret-scan |
| `.env.example` | Safe environment template |
| `AGENTS.md` | Instructions for AI agents |

---

## GitHub Actions

- **docs-check.yml** – documentation structure on push/PR
- **secret-scan.yml** – basic secret pattern scanning

---

## Connectors (all active)

Google Calendar · Calendly · Linear · Outlook · Microsoft Teams · Figma · Notion · Vercel · Gmail · GitHub · Stripe  
All wired to `pointgoddesscc@gmail.com`.

---

**Account:** pointgoddesscc@gmail.com  
**GitHub:** pointgoddesscc-sketch  
**X:** @PointGoddessCc  
**Linear team:** PSE Management

This workspace is fully configured, professional, and production-ready.
