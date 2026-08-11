# GitHub Copilot CLI Integration – OrgSuite Workspace

## Overview

GitHub Copilot CLI can be used alongside Working Copy and ChatGPT Codex for command-line assistance on computers. It does not run inside Working Copy on iPhone.

## Installation (Mac / Linux / Windows)

1. Ensure you have a GitHub account with Copilot access (pointgoddesscc-sketch).
2. Install the GitHub CLI (`gh`) if not already installed.
3. Install Copilot CLI extension:

```bash
gh extension install github/gh-copilot
```

4. Authenticate:

```bash
gh auth login
gh copilot auth
```

## Recommended usage with this workspace

```bash
cd path/to/orgsuite-workspace
gh copilot suggest "explain the remote ChatGPT control workflow"
gh copilot explain docs/remote-chatgpt-control.md
```

## Best practices (OrgSuite standard)

- Always review suggestions before applying.
- Never accept code that hard-codes secrets.
- Prefer small, focused changes that can become clean pull requests.
- Use Copilot CLI on computers; use ChatGPT Codex + Remote for mobile control.
- Keep Working Copy as the mobile file system and GitHub as the source of truth.

## Relation to ChatGPT Codex

| Tool              | Best for                          | Device          |
|-------------------|-----------------------------------|-----------------|
| ChatGPT Codex     | Full repository editing + PRs     | Desktop + Remote |
| GitHub Copilot CLI| Terminal suggestions & explanations | Computer only  |
| Working Copy      | Mobile Git operations             | iPhone          |

All three work best when GitHub remains the single source of truth.
