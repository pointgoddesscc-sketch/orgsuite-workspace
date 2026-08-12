# AGENTS.md – OrgSuite Workspace

This file guides OpenAI Codex, Grok, and any compatible coding agent when working in this repository.

## Core Rules

- Keep documentation clean, professional, and enterprise-ready.
- Never commit secrets, tokens, or real API keys. Use `.env.example` only.
- Prefer clear, focused pull requests with short summaries.
- After any change, ensure the README and docs remain accurate.
- Treat this repository as the primary hub for Working Copy and ChatGPT Remote workflows.

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
