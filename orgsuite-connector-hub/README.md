# OrgSuite Connector Hub

Internal operations for PSE Management: real provider tests, scoped Google Drive
files, recent activity, service health, audit events, and durable inquiry intake.
Implemented in Node.js 24+ using built-in modules and no package dependencies.
This source change does not deploy the Hub or authorize external accounts.

## Run locally

Use Node.js 24 or later. Run from the repository checkout so that the sibling
`psemanagement-services/server/inquiry.cjs` shared validator remains available.
No dependency installation is required.

```sh
cd orgsuite-connector-hub
cp -n .env.example .env.local
chmod 600 .env.local
```

Generate local secrets directly into the ignored file; this does not print them
or place them in shell history. Run this once for a new local environment:

```sh
node --input-type=module <<'NODE'
import { randomBytes } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
let text = readFileSync('.env.local', 'utf8');
const values = {
  HUB_OWNER_ID: 'workplace-owner',
  HUB_LOGIN_SECRET: randomBytes(32).toString('base64url'),
  HUB_VAULT_KEY: randomBytes(32).toString('base64'),
  ORGSUITE_INQUIRY_INGEST_KEY: randomBytes(32).toString('base64url'),
  HUB_DATA_DIR: join(process.env.XDG_DATA_HOME || join(homedir(), '.local', 'share'), 'orgsuite-connector-hub')
};
for (const [key, value] of Object.entries(values)) {
  text = text.replace(new RegExp('^' + key + '=$', 'm'), key + '=' + value);
}
writeFileSync('.env.local', text, { mode: 0o600 });
NODE
node --env-file=.env.local src/server.mjs
```

Open `http://127.0.0.1:4310` and authenticate with the locally stored
`HUB_LOGIN_SECRET`. Keep the generated values in the approved host secret manager
for reuse; do not send them to chat or commit `.env.local`. Retain the same vault
key and data directory across restarts. The sample starts with provider access
unconfigured and does not create live connections. Local file operations still
use the real provider if you later authorize an account.

Run `npm test` from this directory for isolated tests; no production credentials
are required. The storefront's separate tests run from the repository root:

```sh
node psemanagement-services/tests/inquiry-submission.test.cjs
node psemanagement-services/tests/inquiry-api.test.cjs
bash .github/scripts/test-secret-scan.sh
```

The Workplace Tests workflow runs 65 Hub checks, 19 inquiry API checks, and the
nine original form regressions on Node.js 24. Secret Scan and Docs & Structure
also run for pull requests targeting feature branches, so stacked changes receive
the same checks before review. Tests use isolated temporary storage and simulated
provider responses, never live accounts. HTTP integration checks use loopback
sockets when permitted; a sandbox denying listen access uses real Node request
and response streams in-process with the same assertions and no skipped checks.

## Host configuration

Use [`.env.example`](.env.example) as the exact variable inventory. Store real
values only in the deployment host's secret manager or a protected ignored
local file. The following settings are interpreted by the current code:

| Variables | Meaning |
| --- | --- |
| `NODE_ENV` | `development` permits loopback HTTP; use `production` on the actual host. |
| `HUB_ORIGIN` | Exact externally served origin; HTTPS in production. Defaults to local `http://127.0.0.1:4310`, which requires development mode. |
| `HUB_LISTEN_HOST`, `PORT` | Bind address and port; defaults are loopback and 4310. Keep loopback behind the host reverse proxy where possible. |
| `HUB_OWNER_ID` | Required audit actor label for the single owner. |
| `HUB_LOGIN_SECRET` | Required random login secret, at least 32 characters. |
| `HUB_VAULT_KEY` | Required base64 encoding of exactly 32 random bytes for encrypted stored records. |
| `HUB_DATA_DIR` | Required absolute private directory outside the repository/web root; contains persistent `hub.sqlite`. |
| `HUB_PERSISTENT_STORAGE` | Must equal `1` in production after a persistent volume has actually been provisioned. |
| `ORGSUITE_INQUIRY_INGEST_KEY` | Separate random server-to-server intake key, at least 32 characters without whitespace; configure the identical value on the storefront host. |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Actual official Google OAuth web application credentials. |
| `HUB_GOOGLE_ACCOUNT_EMAIL` | Optional verified-email pin for the intended Google account; set before consent. |
| `HUB_GOOGLE_DRIVE_SCOPE` | Defaults to `https://www.googleapis.com/auth/drive.file`; supported broader choices are `https://www.googleapis.com/auth/drive.readonly` and `https://www.googleapis.com/auth/drive`. Changing scope requires new consent. |
| `HUB_DRIVE_ROOTS` | JSON array of approved folders. Each entry has a real `id`, optional `name`, and `driveId` when in a shared drive. Empty means file operations are unavailable. |
| `GITHUB_TOKEN`, `HUB_GITHUB_REPOSITORIES` | Fine-grained read token and JSON array of explicitly authorized repositories; default selection is this repository. |
| `META_APP_ID`, `META_APP_SECRET`, `META_ACCESS_TOKEN`, `META_AD_ACCOUNT_ID`, `META_API_VERSION` | Existing authorized Meta app/account and supported explicit Graph version. No app, token, version, or account is fabricated by the Hub. |
| `VERCEL_TOKEN`, `VERCEL_TEAM_ID`, `HUB_VERCEL_PROJECT_IDS` | Host token, optional team selection, and JSON array of approved real project IDs. |
| `CLOUDFLARE_API_TOKEN`, `HUB_CLOUDFLARE_ZONE_IDS` | Restricted read token and JSON array of approved real zone IDs. |

## Connect, re-authenticate, and test

For Google, enable the official Drive and Gmail APIs as needed, configure the
OAuth consent screen/client, and register the exact redirect URI
`HUB_ORIGIN` + `/oauth/google/callback`. Use Connect / Re-authenticate for the
selected service. Google identity uses `openid email`; Drive uses the configured
scope and Gmail uses `https://www.googleapis.com/auth/gmail.readonly`.
Google refresh tokens stay in the encrypted server vault. Incremental consent
does not automatically test every service. The callback tests the requested
service and the Test connection button repeats its real API check.

`drive.file` is the least-privilege default. It does not expose arbitrary
existing folders or every descendant of a selected folder. The root allowlist
only restricts existing access. The Hub currently has no Google Picker, so an
existing resource needs an official same-app grant or a deliberately approved
broader scope and new consent. Configure only roots the OAuth app can actually
access. A shared-drive root requires its `driveId` as well as the folder ID.

For GitHub, Meta, Vercel, and Cloudflare, Connect / setup opens the official
provider settings and lists required host variables. The owner must provision
the real authorization, restart after environment changes, and run Test
connection. It does not perform a hidden login or copy credentials from chat.
Disconnect Google removes local credentials for both Drive and Gmail before
attempting remote revocation. A `remote_revocation_unconfirmed` error means
local access remains removed but the owner must confirm/revoke the grant in
official Google account settings. Pending refreshes cannot restore it. Other
provider credentials are revoked/replaced in their official interfaces and the
host secret manager.

**Connected** requires a fresh successful provider check and expires after five
minutes. Prior results remain historical evidence until re-tested. GoDaddy has
a health-only panel and is never presented as verified registrar account access.

## Google Drive operations

The file browser lists approved roots, navigates folders, searches names in the
current folder, paginates results, creates project folders, and uploads/downloads
approved files. Every operation checks actual provider metadata, approved-root
ancestry, and shared-drive boundaries. New folders inherit the parent's sharing;
there is no permission-changing or public-sharing API.

The 5 MiB file limit covers PDF, TXT, CSV, JSON, PNG, JPEG, WebP, DOCX, XLSX, and
PPTX. MIME/extension and basic content checks apply. Native Google Docs export
to PDF/TXT/DOCX; Sheets to PDF/CSV/XLSX; Slides to PDF/PPTX. A read-only Drive
grant cannot create folders or upload. See the complete
[security and scope model](../docs/connector-hub-security.md).

## Runtime routes

| Route | Purpose |
| --- | --- |
| `GET /` and `GET /status` | Authenticated dashboard and Workplace Status page |
| `GET /healthz` | Process health only; does not test provider credentials or inquiry delivery |
| `GET /login`, `POST /api/login` | Owner sign-in; POST requires the matching Origin |
| `GET /api/session`, `POST /api/logout` | Session/CSRF bootstrap and logout |
| `GET /api/connectors` | Registered connectors and latest status evidence |
| `POST /api/connectors/:id/connect` | Official Google OAuth start or external provider setup link |
| `POST /api/connectors/:id/test` | Real provider test and sanitized result |
| `POST /api/connectors/:id/disconnect` | Google shared-grant revocation; other providers require external revocation |
| `GET /oauth/google/callback` | Session-bound, single-use Google OAuth return |
| `GET /api/drive/roots` | Verify and list approved root folders |
| `GET /api/drive/files` | Direct-child listing/search using `folderId`, optional `query` and `pageToken` |
| `GET /api/drive/download` | Bounded download using `fileId`, optional `exportMimeType` |
| `POST /api/drive/folders` | Create an inherited-access folder using `parentId` and `name` |
| `POST /api/drive/upload` | Upload using `parentId`, `name`, `mimeType`, and base64 `data` |
| `GET /api/audit` | Latest 100 safe audit events; UI displays a recent subset |
| `GET /api/services`, `POST /api/services/test` | Stored service results and fresh fixed-target probes |
| `POST /api/internal/inquiries` | Separate bearer-authenticated durable inquiry intake; no dashboard-session access |

Authenticated dashboard mutations require Origin and `X-CSRF-Token` checks.
The service check targets are fixed in `src/app.mjs`: OrgSuite core, the public
inquiry API, the existing Cloudflare dashboard/edge status routes, and the
existing GoDaddy health service. The inquiry probe uses GET and expects JSON
405 rather than submitting an inquiry. Public health results establish
reachability only; they do not prove account ownership or accepted form data.

## Production deployment and inquiry intake

Deploy one supervised persistent Node process behind TLS and internal access
controls. Do not deploy this SQLite service to Vercel Functions, Lambda, an
ephemeral container, or multiple concurrent application instances sharing the
database. The storefront function can remain on Vercel and must reach the
separately hosted Hub intake through an authorized HTTPS network path.

1. Review and merge through the repository's human PR process. Preserve the
   sibling shared inquiry validator when packaging the application.
2. Provision the persistent private data directory, secret manager, backup and
   restoration process, TLS reverse proxy, process supervisor, and access rules.
3. Set the required variables with `NODE_ENV=production`, a real HTTPS
   `HUB_ORIGIN`, and `HUB_PERSISTENT_STORAGE=1`. Start with `npm start` when the
   host injects these values; do not regenerate the vault key on restarts.
4. Protect the dashboard and all operational APIs from public access. If the
   storefront needs external ingress, expose only the fixed inquiry intake path
   through the intended gateway and protect it with the separate ingestion key
   and perimeter abuse controls. Do not expose internal dashboard data with it.
5. On the storefront host set `INQUIRY_HUB_ORIGIN` and the identical
   `ORGSUITE_INQUIRY_INGEST_KEY`. Deploy its Vercel function with `/api/` routing
   intact, then verify the [inquiry contract](../docs/inquiry-contract.md).
6. Authorize only the required providers, run their real tests, and record the
   intended identities. Exercise restart/restore and stale-status behavior.

An inquiry is acknowledged only after the encrypted record is durably committed
to SQLite. Retrying the same ID and canonical payload acknowledges the existing
record; a changed payload with an accepted ID returns a conflict. This does not
claim email delivery. There is no inquiry-content management UI, automatic
retention policy, or background sync scheduler in this version. Define retention
and operator access before collecting production data.

No deployed Hub URL, provider connection, current endpoint health, or live ad
campaign is claimed here. Advertising remains disabled; the historical
US$100 total planning ceiling requires fresh launch authorization. Continue at
the [ecosystem map](../docs/ecosystem.md),
[security guide](../docs/connector-hub-security.md), and
[advertising readiness](../docs/ads-readiness.md).
