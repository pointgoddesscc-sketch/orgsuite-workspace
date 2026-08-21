# OpenAI Codex CLI – OrgSuite Fork

**Status:** Forked into OrgSuite workplace · 2026-08-21

## Repositories

| Role | URL |
|------|-----|
| Upstream (official) | https://github.com/openai/codex |
| OrgSuite fork | https://github.com/pointgoddesscc-sketch/codex-1 |

The fork was created as `codex-1` because the name `codex` was already used by an existing private repository (`pointgoddesscc-sketch/codex`).

## What it is

OpenAI’s open-source **Codex CLI** – a lightweight coding agent that runs in the terminal (primarily Rust).  
This is the same open-source component referenced by OpenAI for local / terminal use, distinct from the cloud Codex agent inside ChatGPT.

## Why it lives in the OrgSuite workplace

- Aligns local terminal agent work with the existing ChatGPT Codex + AGENTS.md workflow.
- Provides a permanent, owned copy of the open-source CLI for study, extension, and multi-device use (Working Copy, Termux, Samsung automation).
- Complements the already-connected cloud Codex (ChatGPT).

## Usage notes

- Prefer the official install methods from the upstream README when running the agent (`curl` installer, npm, Homebrew, or GitHub Releases).
- The fork is for workplace ownership and reference. Keep it in sync with upstream when needed.
- OpenAI currently does **not** accept external code contributions / PRs on `openai/codex`. Use their issue tracker for bugs and feature requests only.

## Related Linear

- PSE-39 (this tracking issue)
- PSE-14, PSE-15 (existing Codex ↔ Working Copy ↔ Remote workflows)

## Security

Public fork. No secrets. Follow AGENTS.md and `.env.example` rules at all times.
