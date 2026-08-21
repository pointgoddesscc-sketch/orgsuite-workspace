# AGENTS.md – OrgSuite Workspace

This file guides OpenAI Codex, Grok, and any compatible coding agent when working in this repository.

## Core Rules

- Keep documentation clean, professional, and enterprise-ready.
- Never commit secrets, tokens, or real API keys. Use `.env.example` only.
- Prefer clear, focused pull requests with short summaries.
- After any change, ensure the README and docs remain accurate.
- Treat this repository as the primary hub for Working Copy and ChatGPT Remote workflows.

## Codex Connection (OpenAI Codex / ChatGPT Codex)

This repository is the designated primary workspace for OpenAI Codex.

**How Codex should treat this repo:**
- Source of truth for OrgSuite workplace documentation and workflows.
- Follow all rules in this AGENTS.md and the `docs/` folder.
- Never invent live connectors, credentials, or remote browser control.
- Prefer creating feature branches and opening pull requests.
- After any significant change, update README.md or relevant docs so they stay accurate.

**Official connection path (user side):**
1. In ChatGPT (pointgoddesscc@gmail.com) → Codex → Connect GitHub plugin.
2. Authorize this repository (`pointgoddesscc-sketch/orgsuite-workspace`).
3. On iPhone, use Codex Remote paired with the desktop session.
4. All changes flow through GitHub → Working Copy (Pull).

Codex must never claim it has remote control of Edge, local tabs, cookies, or sessions. All Microsoft and GitHub work stays on official authenticated paths only.

## Preferred Workflow

1. Create a feature branch.
2. Make focused, well-documented changes.
3. Open a pull request.
4. Wait for human review and merge.
5. After merge, the user will Pull in Working Copy.

## Multi-Device Strategy (official – locked)

**Apple devices** → best for quick reviews, on-device Apple Intelligence summaries of diffs or skill docs, and light Siri-triggered status. Use them for review passes.

**Samsung Android phones** → stronger for longer-running clone, push, and background operations (Working Copy + Termux + Tasker). Higher background reliability for continuous monitoring. Keep the heavier automation and persistent sync here.

Full details and setup steps: `docs/multi-device-strategy.md`

## Project Context

- Source of truth for the workspace hub: this repository
- Primary devices: Working Copy on both Apple (review) and Samsung Android (automation)
- Account: pointgoddesscc@gmail.com / pointgoddesscc-sketch
- Linear team: PSE Management

Keep everything professional and ready for production use.
