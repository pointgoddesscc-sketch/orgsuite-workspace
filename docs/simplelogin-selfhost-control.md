# SimpleLogin Full-App Self-Host – OrgSuite Control Layer

**Status:** Source complete · Local/self-host ready · Linear issue pending re-auth  
**Date:** 2026-08-18  
**Owner:** Point Goddess CC (`pointgoddesscc@gmail.com`)  
**GitHub account:** `pointgoddesscc-sketch`

This document is the permanent workplace source of truth for full control of SimpleLogin under OrgSuite.

---

## 1. Source of Truth

| Item | Location | Status |
|------|----------|--------|
| Full SimpleLogin application (fork) | https://github.com/pointgoddesscc-sketch/app | **Completed** |
| Upstream | https://github.com/simple-login/app (AGPL-3.0) | Official |
| Dashboard route | `app/dashboard/views/index.py` | Present |
| Subdomain feature | `app/dashboard/views/subdomain.py` + template | Present |
| Official API docs | `docs/api.md` inside the fork | Present |
| Existing OrgSuite API clients | `chrome`, `orgsuite-safari`, `orgsuite-proton-mail-integration` | Working |

The live authenticated pages at `https://app.simplelogin.io/dashboard/` and `/dashboard/subdomain` cannot be cloned as static sites. The correct permanent artifact is the full open-source application, which is now under our control.

---

## 2. Ecosystem Goals Mapping

| Goal | How this advances it | Current state |
|------|----------------------|---------------|
| **Connectivity** | Full backend + API under our GitHub; can point existing clients to a self-hosted instance | Source complete |
| **Communication** | Linear issue + this permanent doc keep the workplace aligned | Linear requires re-auth |
| **Control** | Complete ownership of dashboard, subdomain, alias creation, quotas, custom domains | Ready once instance is running |

---

## 3. Local Development Checklist (Exact Commands)

Run on a machine with Docker and ≥ 2 GB RAM:

```bash
# Clone
git clone https://github.com/pointgoddesscc-sketch/app.git
cd app

# Environment
uv venv && source .venv/bin/activate   # or python -m venv
uv sync                                # or pip install from lock files

# Postgres
docker run -d --name sl-db \
  -e POSTGRES_USER=myuser \
  -e POSTGRES_PASSWORD=mypassword \
  -e POSTGRES_DB=simplelogin \
  -p 15432:5432 \
  postgres:13

# Config
cp example.env .env
# Minimum required in .env:
# DB_URI=postgresql://myuser:mypassword@localhost:15432/simplelogin
# FLASK_SECRET=<long-random-string>
# URL=http://localhost:7777
# EMAIL_DOMAIN=sl.local
# DISABLE_ALIAS_SUFFIX=1
# NOT_SEND_EMAIL=true

# Database + seed
alembic upgrade head
flask dummy-data

# Start
python3 server.py
```

Open the configured URL. Create an account. Full dashboard + subdomain + API are now under local control.

For production self-host see the full README in the fork (DNS, Postfix, DKIM, Docker network, Nginx, SSL).

---

## 4. Workplace Avatar Connection

Orgsuite branding assets are available in the skill assets and documented in `docs/avatar-sync.md` and `docs/brand-identity.md`.

Recommended permanent uses for the SimpleLogin control layer:
- Linear team / profile avatar
- GitHub profile or org avatar for related repos
- Any self-hosted SimpleLogin instance branding
- Command Center and documentation headers

Primary assets: `orgsuite-logo.jpg`, square, dark, circular, and favicon variants.

---

## 5. Linear Tracking (Pending)

Linear connector currently requires re-authentication.

**Ready issue title:**  
Self-host SimpleLogin under OrgSuite – full control of dashboard, subdomain & API

**Body:** Link this document + the fork + success criteria (local instance running, API clients pointed at it, subdomain working, secrets only in env).

Once Linear is re-authenticated, create the issue under **OrgSuite Codex App**, link this file, and update `docs/connectors-status.md`.

---

## 6. Related Permanent Docs

- `docs/secure-mail-proton-simplelogin.md` – current alias / Proton context
- `docs/connectors-status.md` – connector matrix
- `docs/avatar-sync.md` – brand identity across platforms
- `docs/workplace-index.md` – overall workplace map

---

## 7. Security Rules (Non-Negotiable)

- No API keys, passwords, or Client Secrets in this repository or in Linear
- Secrets live only in environment variables / host Keychain / Vercel / Firebase Secret Manager
- AGPL-3.0 compliance required for any distribution or modification of the forked app
- Prefer least privilege for any future production deployment

---

**This document is the permanent record.**  
All future work on SimpleLogin full control under OrgSuite should reference and update this file.

Last updated: 2026-08-18 by Grok (OrgSuite Engineering Partner)
