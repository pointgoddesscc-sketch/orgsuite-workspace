# Capabilities and Limits

## What the Sandbox Can Do

| Capability                        | Status     | Notes |
|-----------------------------------|------------|-------|
| Shell / bash commands             | Available  | Full access inside the container |
| Create, edit, read files          | Available  | Preferred path: `/home/workdir/artifacts` |
| Install packages (apt, pip, npm)  | Available  | Outbound internet enabled |
| Write and run code                | Available  | Python, Node, shell, etc. |
| Generate documentation            | Available  | Markdown and other text formats |
| Fetch public web data             | Available  | |
| Prototype small tools and scripts | Available  | |

## What the Sandbox Cannot Do

| Limitation                                      | Reason |
|-------------------------------------------------|--------|
| Access the user’s local computer or phone       | Completely remote |
| Bluetooth or nearby device scanning             | No radio hardware |
| Direct HomePod / HomeKit / Apple device control | Requires Apple’s authenticated paths |
| Authenticated calls to Linear, GitHub, Vercel, Stripe, etc. without the connected tools | Credentials are not stored in the sandbox |
| Persistent long-running services across sessions | Ephemeral by design |
| Reading files from the user’s local devices     | No local filesystem mount |

## Security Posture

- The sandbox runs as root **inside** an isolated container.
- No OrgSuite production secrets are stored in the sandbox by design.
- Secrets for external services must live in proper secret managers (Vercel environment variables, host Keychain, Firebase Secret Manager, etc.).
- Outbound network access exists so packages and documentation can be retrieved.

## Recommended Use

Use the sandbox for drafting, testing, and preparing material.  
Promote validated work into this repository, Linear, or the Vercel Command Center.
