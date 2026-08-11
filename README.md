# OrgSuite Workspace

**Primary professional hub for Point Goddess CC / PSE Management**

This is the recommended repository to clone into **Working Copy** on iPhone and to remotely control **ChatGPT Codex** via GitHub.

---

## Quick Start – Working Copy (iPhone)

1. Open **Working Copy**
2. Tap **+** → **Clone repository**
3. URL:
   ```
   https://github.com/pointgoddesscc-sketch/orgsuite-workspace.git
   ```
4. Authenticate with the GitHub account that owns `pointgoddesscc-sketch`
5. Open the repository — you now have the complete professional workspace

**After any update on GitHub:** open this repository in Working Copy and tap **Pull**.

---

## Quick Start – Remote ChatGPT Control

1. **Desktop:** ChatGPT signed in as **pointgoddesscc@gmail.com** → Codex → Connect GitHub plugin → authorize this repository
2. **iPhone:** ChatGPT → Codex → **Remote** → pair with the desktop session
3. Now you can control Codex from your phone. Changes flow through GitHub → Working Copy via Pull.

Full guide: `docs/remote-chatgpt-control.md`

---

## What is included

| Path | Purpose |
|------|---------|
| `docs/remote-chatgpt-control.md` | Full Remote + Working Copy + GitHub control guide |
| `docs/connectors-status.md` | Live status of all connectors |
| `docs/git-hooks.md` | How to enable Git hooks for automations |
| `docs/working-copy-clone.md` | Clone instructions |
| `.githooks/` | pre-commit (secret protection) + post-merge |
| `.env.example` | Safe environment template (no secrets) |
| `AGENTS.md` | Instructions for Codex and AI agents |
| `.gitignore` | Professional ignore rules |

---

## Git Hooks for Automations

On any computer clone:

```bash
git config core.hooksPath .githooks
chmod +x .githooks/*
```

- **pre-commit** – blocks common secret patterns
- **post-merge** – confirmation + reminder to Pull on other devices

Details: `docs/git-hooks.md`

---

## Connectors (all active)

Google Calendar · Calendly · Linear · Outlook · Microsoft Teams · Figma · Notion · Vercel · Gmail · GitHub · Stripe

All wired to `pointgoddesscc@gmail.com`. See `docs/connectors-status.md`.

---

## Daily professional workflow

```text
1. Working Copy → Pull
2. ChatGPT Remote (or desktop Codex) → work on the repository
3. Codex opens a Pull Request
4. You review & merge on GitHub
5. Working Copy → Pull again
```

---

## Security

- Never commit real API keys or tokens
- Use `.env.example` as the only template
- Keep keys on-device or in host secret managers

---

**Account:** pointgoddesscc@gmail.com  
**GitHub:** pointgoddesscc-sketch  
**Linear team:** PSE Management

This workspace is fully configured for professional remote control of ChatGPT via GitHub and Working Copy.
