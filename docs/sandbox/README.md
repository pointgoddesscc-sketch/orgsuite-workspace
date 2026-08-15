# Grok Sandbox Workspace

This directory documents the remote Grok sandbox environment used for OrgSuite engineering work.

The sandbox is a temporary, isolated Ubuntu Linux environment that Grok can use to run commands, create files, test code, and prepare documentation. It is **not** a production system and does **not** hold live credentials.

## Purpose

- Safe place to draft and test documentation and scripts
- Engineering workbench for OrgSuite tasks
- Staging area before content is promoted to this repository, Linear, or the Vercel Command Center

## Documents in this folder

| File | Description |
|------|-------------|
| [environment.md](environment.md) | Technical snapshot of the sandbox environment |
| [capabilities-and-limits.md](capabilities-and-limits.md) | What the sandbox can and cannot do |
| [orgsuite-bridge.md](orgsuite-bridge.md) | How the sandbox relates to the rest of the OrgSuite ecosystem |
| [workspace-guide.md](workspace-guide.md) | Recommended usage patterns for the working directory |

## Important Rules

1. Never store secrets, API keys, or tokens in the sandbox.
2. Treat the sandbox as ephemeral. Important work must be moved into permanent locations (this repo, Linear, Vercel).
3. Always label integration status accurately: Completed, Connected, Available, Ready to Configure, Proposed, or Requires Authorization.

## Related OrgSuite Anchors

- Linear project: [OrgSuite Codex App](https://linear.app/pse-management/project/orgsuite-codex-app-9146b449b7a1)
- Live Command Center: https://orgsuite-codex-command-center.vercel.app
- This repository: source of truth for code and permanent docs
