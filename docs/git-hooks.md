# Git Hooks for Automations – OrgSuite Workspace

This repository includes a ready-to-use Git hooks setup for professional automation and safety.

## Included Hooks

### pre-commit
- Blocks commits that contain common secret patterns (API keys, tokens, private keys)
- Encourages clean commit messages

### post-merge
- Reminds you to pull related repositories if needed
- Simple success confirmation

## How to install the hooks (one-time per device)

### On Mac / PC (Terminal)

```bash
cd path/to/orgsuite-workspace
git config core.hooksPath .githooks
chmod +x .githooks/*
```

### On Working Copy (iPhone)

Working Copy uses its own internal Git implementation.  
The hooks in `.githooks/` are primarily for desktop/laptop use.  
On iPhone, rely on the documented workflow (Pull → work → Commit → Push → PR → Pull).

## Enabling hooks on a new clone

After cloning this repository on a computer:

```bash
git config core.hooksPath .githooks
chmod +x .githooks/pre-commit .githooks/post-merge
```

The hooks will then run automatically.

## Security note

The pre-commit hook is a basic safeguard. It does **not** replace careful review.  
Never commit real secrets regardless of hooks.
