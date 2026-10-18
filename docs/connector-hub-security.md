# Connector Hub security and authorization

Updated October 18, 2026. Applies to
[`orgsuite-connector-hub/`](../orgsuite-connector-hub/README.md), an internal
single-owner application. This document describes implemented boundaries and
the host configuration required before production use.

## Identity and request boundaries

The owner authenticates with the host-provided `HUB_LOGIN_SECRET` of at least
32 characters. `HUB_OWNER_ID` labels audit events; it is not proof of an identity
provider login and does not provide separate staff accounts. Protect the
deployment behind an internal network or an authenticated access gateway. A
future multi-user deployment needs individual identities and role enforcement.

Successful login creates a random eight-hour session. The database stores its
hash, not the raw session token. Cookies are HttpOnly, use the application's
same-site policy, and require Secure on HTTPS. Mutations require the session,
the expected Origin, and the session's CSRF token. Loopback HTTP is permitted
only with `NODE_ENV=development`; production `HUB_ORIGIN` must be an HTTPS origin
without credentials, path, query, or fragment. Do not expose development mode.

Google OAuth uses the official authorization/token/userinfo endpoints, PKCE
S256, a random state bound to the authenticated session, a ten-minute expiry,
and single-use state. The exact callback is
`HUB_ORIGIN` + `/oauth/google/callback`. Configure that URI in the real OAuth
client. The browser never receives Google access or refresh tokens. The
optional `HUB_GOOGLE_ACCOUNT_EMAIL` pins the verified Google account email;
after initial consent, a different Google account is rejected until the current
grant is deliberately disconnected. Use the intended account rather than
assuming all historical workspace email addresses refer to one identity.

Drive and Gmail use one stored Google grant. Their scopes are requested
incrementally and still require separate provider tests. Disconnecting Google
removes local credentials for both services first and then attempts remote
revocation. If Google cannot confirm revocation, the API returns
`remote_revocation_unconfirmed`; local credentials remain removed and both
services require authorization. Confirm/revoke the grant in the official Google
account settings before reauthorizing if remote revocation was unconfirmed.
In-flight token refreshes cannot restore the disconnected grant. Completion of
an OAuth redirect does not set Connected status without a provider test.

## Provider scopes and permissions

| Provider | Required permission and limitation |
| --- | --- |
| Google identity | `openid email`; verified email is checked. No Google account password is collected. |
| Drive default | `https://www.googleapis.com/auth/drive.file`; access only to resources created by or explicitly granted to this OAuth application, further restricted by configured Hub roots. |
| Drive optional read-only | `https://www.googleapis.com/auth/drive.readonly`; broader readable Drive resources, subject to actual file permissions and Hub roots. Upload/folder creation cannot succeed with this scope alone. Requires deliberate configuration and new consent. |
| Drive optional full | `https://www.googleapis.com/auth/drive`; broader read/write access subject to actual file permissions and Hub roots. Use only when explicitly approved and required; new consent and applicable Google verification are required. |
| Gmail | `https://www.googleapis.com/auth/gmail.readonly`; current code reads profile/counts and recent inbox message/thread IDs. It does not read bodies or send mail, although this restricted scope permits broader reads than the current UI uses. Complete Google's applicable consent, verification, and restricted-scope requirements. |
| GitHub | Prefer a fine-grained token restricted to the selected repositories with **Metadata: Read** and **Contents: Read** for repository details and commits; complete any required organization approval/SSO. No repository write capability is required by the Hub. |
| Meta | Existing authorized app, account assignment, and `ads_read`; current adapter reads account status and seven-day account metrics only. No `ads_management`, campaign writes, or spend controls. |
| Vercel | Host-side token and the narrowest permitted team/project role for project and deployment reads; project IDs are explicitly configured. The Hub sends only GET requests, but the underlying token's capabilities depend on Vercel roles and must be reviewed separately. |
| Cloudflare | API token with **Zone: Zone: Read**, restricted to selected zones; token validity and selected zone metadata only. No DNS writes. |
| GoDaddy | Hub checks the existing public health route only; it receives no registrar credential and does not verify ownership, billing, DNS authority, or mailbox operation. The separate existing GoDaddy service has its own configuration. |

Scopes are not interchangeable with workspace chat app authorization. A
connected Google Drive, Gmail, or GitHub tool in a chat does not grant credentials
to this server. Owner-provisioned environment values and official Google consent
are required on the deployed Hub host. Provider URLs are fixed to official
origins; validated IDs select resources without accepting arbitrary URLs.

## Drive resource and file controls

`HUB_DRIVE_ROOTS` is a JSON array of approved root folders, with `id`, optional
display `name`, and `driveId` for a shared-drive root. Every operation verifies
actual provider metadata and ancestry. A configured root is an application-side
restriction, never an OAuth grant. In particular, selecting or granting a folder
under `drive.file` does **not** grant all existing descendants.

The Hub does not implement Google Picker. An existing root/file must already be
accessible to the same OAuth app through app creation or an official resource
selection/Drive integration, or the owner must deliberately choose a broader
supported scope and complete new consent. Do not mark an arbitrary folder ID
as connected simply because it appears in the allowlist.

Listing/search returns direct children only and uses a bounded, escaped name
search rather than caller-supplied Drive query syntax. The adapter rejects
shortcuts, trashed resources, ancestry cycles, excessive traversal, and
unapproved shared drives. Folder creation inherits the approved parent's
existing permissions; it does not create a shared drive, add members, or grant
public access.

Files are limited to 5 MiB. Approved upload/download types are PDF, UTF-8 plain
text, CSV, JSON, PNG, JPEG, WebP, DOCX, XLSX, and PPTX. Filename extensions, basic
content signatures, UTF-8, and JSON syntax are checked as applicable. These
checks are not antivirus scanning or comprehensive Office-document validation;
apply host/organizational malware controls before wider file distribution.
Native Docs export to PDF/TXT/DOCX, Sheets to PDF/CSV/XLSX, and Slides to
PDF/PPTX. Downloads remain subject to the same resource and size constraints.

## Storage, retention, and audit

Run one Node.js 24+ process with a provisioned persistent directory outside
the repository and web root. `HUB_DATA_DIR` must be absolute. Production requires
`HUB_PERSISTENT_STORAGE=1`; that flag is an operator assertion, not automatic
volume provisioning. The application refuses known Vercel/Lambda serverless
runtimes. Store and database permissions are restricted to 0700/0600, and
direct symlink storage targets are rejected. Protect the whole host and its
parent directories as part of deployment.

SQLite uses full synchronous durable commits. Google tokens, pending OAuth
state, and inquiry contents are encrypted with AES-256-GCM, a fresh nonce, and
record-associated authentication data. `HUB_VAULT_KEY` is a 32-byte base64 key
stored separately in the host secret manager. Other provider credentials stay
in host environment variables. Connection summaries, audit metadata, session
records, and inquiry fingerprints remain in the private database; database
access is still sensitive even when token payloads are encrypted.

Back up the private database and the encryption key through separately
controlled channels, and test restoration before production intake. Retain the
same encryption key across restarts. Simply replacing it makes existing encrypted
records unreadable; automatic key migration/rotation is not implemented. Rotate
provider credentials at the provider and host together, then re-test access.

Audit rows record the configured actor, connector, action, outcome, safe error
code, and timestamp. The UI/API exposes the latest 100 events. Logs exclude
provider token values and inquiry contents. This is an operational audit trail,
not an immutable external audit ledger. Define retention, approved backup
access, inquiry deletion handling, and log export before production use;
automatic retention/purge is not implemented.

## Inquiry intake and operational checks

The storefront's `/api/inquiry` forwards to the fixed Hub
`/api/internal/inquiries` route with the separate
`ORGSUITE_INQUIRY_INGEST_KEY`. Dashboard cookies do not authorize that route.
The key must be at least 32 characters and must match on both hosts. Public
request validation, durable encrypted acceptance, idempotency/conflict behavior,
and the exact acknowledgement are defined in the
[inquiry contract](inquiry-contract.md). Acceptance means the record was saved;
it does not assert an email was sent or staff responded.

Connected evidence expires after five minutes and must come from a real
successful provider test. Public service probes prove only the observed
HTTP/health result; provider account access remains separately tested. Configure
internal access controls, TLS, backup/restore, process supervision, perimeter
rate limits, monitoring, and inquiry retention before going live. No provider
credentials or current production health are claimed by this implementation.
