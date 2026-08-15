# Workspace Guide

Guidance for using the Grok sandbox working directory (`/home/workdir/artifacts`).

## Recommended Structure

```
artifacts/
├── README.md                 # Session or local entry point
├── docs/                     # Lasting documentation
├── status/                   # Point-in-time reports
└── templates/                # Starter files
```

When preparing material for this repository, stage clean versions under a structure that matches the permanent layout (for example `docs/sandbox/`).

## Practices

1. Keep the root of the working directory clean.
2. Put lasting documents under a `docs/` hierarchy.
3. Never store secrets, tokens, or credentials.
4. Treat the sandbox as a staging area. Promote important work to this repository or Linear.
5. Use clear, descriptive Markdown filenames.

## Promoting Work to This Repository

Preferred flow:

1. Create clean, permanent versions of the files.
2. Use the authorized GitHub connector (`github___push_files` or `github___create_or_update_file`) to commit them.
3. Optionally open a pull request if review is desired.
4. Update the relevant Linear issue or the Connector Checklist so the workplace stays in sync.

## Health Checks (inside the sandbox)

```bash
cd /home/workdir/artifacts
find . -type f | sort
cat status/CURRENT-STATUS.md   # if present
```

Keep this guide accurate whenever the recommended workflow changes.
