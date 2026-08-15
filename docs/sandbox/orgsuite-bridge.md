# OrgSuite Bridge – Sandbox Relationship

This document maps the relationship between the temporary Grok sandbox and the permanent OrgSuite systems.

## Principle

The sandbox is an **engineering workbench**.  
The permanent sources of truth live outside it.

## OrgSuite Sources of Truth

| System                              | Role                                | Sandbox Relationship          |
|-------------------------------------|-------------------------------------|-------------------------------|
| Linear (PSE Management)             | Workplace, issues, decisions        | Documented; live actions require authorization |
| This repository (`orgsuite-workspace`) | Code and permanent documentation | Target for promoted docs and code |
| Vercel Command Center               | Live dashboard                      | Documented only               |
| Custom skills (`.grok/skills`)      | Local knowledge and behavior        | Present in the sandbox        |
| Habit / Firebase backend            | Personal & home automation          | Requires Authorization        |
| GoDaddy automation                  | Domain & DNS                        | Skill available; secrets external |
| Cross-AI messaging (Orgsuite skill) | Conversation tracking               | Skill available; delivery is manual or user-deployed |

## What “Bridge” Means

**Completed / Available**
- Documentation of the sandbox itself
- Clear mapping of responsibilities
- Ability to prepare files that can be pushed into this repository via the authorized GitHub connector

**Requires Authorization or External Setup**
- Live authenticated API calls that are not already covered by the connected tools
- Automatic status updates into the Linear Connector Checklist
- Real-time control of home devices or bots

## Recommended Workflow

1. Draft and test in the sandbox.
2. Review the output.
3. Promote validated content into this repository (preferred for docs and code) or Linear (for decisions and status).
4. Keep the Connector Checklist and relevant Linear issues (PSE-16 family) up to date.

## Status Labels

Use these exact labels when reporting on any integration:

- **Completed**
- **Connected**
- **Available**
- **Ready to Configure**
- **Proposed**
- **Requires Authorization**

This keeps the entire OrgSuite ecosystem honest and auditable.
