# Remote ChatGPT Control via GitHub + Working Copy

**Goal:** Control ChatGPT / Codex from your iPhone using Working Copy as the file system and GitHub as the source of truth.

## Architecture

```
Working Copy (iPhone)
        ↕  (Pull / Push)
GitHub (orgsuite-workspace + other repos)
        ↕  (GitHub plugin)
ChatGPT Desktop (Codex)
        ↕  (Remote)
ChatGPT iOS app
```

## One-time setup (must be completed)

### 1. Working Copy
- Clone: `https://github.com/pointgoddesscc-sketch/orgsuite-workspace.git`
- Authenticate with the `pointgoddesscc-sketch` GitHub account

### 2. ChatGPT Desktop
- Sign in as **pointgoddesscc@gmail.com**
- Open **Codex**
- Connect the **GitHub** plugin
- Authorize `pointgoddesscc-sketch/orgsuite-workspace` (and any other repos you want Codex to see)
- Keep the desktop app running

### 3. ChatGPT iOS (Remote)
- Open ChatGPT app → **Codex** → **Remote**
- Pair with the desktop session (same account)

Once paired, any request you make on the phone runs against the desktop Codex session that has access to your GitHub repositories.

## Daily remote control loop

1. On phone (Working Copy): **Pull** the latest from GitHub
2. On phone (ChatGPT Remote): Ask Codex to work on files in the repository
3. Codex creates a branch + Pull Request on GitHub
4. You review and merge the PR on GitHub (browser or GitHub app)
5. On phone (Working Copy): **Pull** again to receive the changes

## Important rules

- GitHub is the single source of truth
- Never commit real API keys or secrets
- Prefer small, focused pull requests
- Always Pull before starting new work in Working Copy

## Related files in this repo

- `docs/working-copy-clone.md`
- `docs/connectors-status.md`
- `docs/git-hooks.md`
- `AGENTS.md`
