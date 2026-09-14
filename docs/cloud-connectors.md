# Google & Microsoft Cloud Connectors — OrgSuite Workplace

Linear: [PSE-100](https://linear.app/pse-management/issue/PSE-100/google-microsoft-cloud-connectors-drive-and-onedrive-workplace-mount)  
UI: `cloud-storage/`  
Last verified: 2026-09-14 06:10 WAT (Grok session)

## Mission

One provider sign-in should unlock that provider’s mail **and** files. Outlook mail does not automatically grant OneDrive. Gmail does not automatically grant native Drive MCP.

## Live status (verified this session)

| Surface | Status | Evidence |
|---|---|---|
| Gmail | **Connected** | `pointgoddesscc@gmail.com` (ORG SUITE). 527 messages / 421 threads. Recent inbox includes Proton, xAI, Cloudflare, GoDaddy. |
| Google Calendar | **Connected** | Existing workplace connector |
| Google Drive (PIP) | **Connected** | Display name ORG SUITE / `pointgoddesscc@gmail.com`. Quota **0.41 GB / 15 GB**. |
| Google Drive (native MCP) | **Requires Authorization** | `google_drive_mcp___search_files` → Auth required / transport lost |
| Docs / Sheets APIs via PIP | **Available** | PIP Google Drive create/search tools present |
| Outlook | **Connected** | `chrisemerson360agency@outlook.com`. Inbox **113 / 82 unread**. Drafts 6. |
| Microsoft Teams | **Connected** (mail-adjacent Graph) | Workplace connector listed; file APIs not exposed |
| OneDrive / Graph Files | **Requires Authorization** | No OneDrive tools in this Grok session. Connector directory offers **OneDrive**. |
| Word / Excel / PowerPoint create on OneDrive | **Requires Authorization** | Blocked until Files.ReadWrite.All |
| Command Center cards | **Proposed** | Live Command Center has no Drive/OneDrive mount yet |

Auth cards for native **Google Drive** and **OneDrive** were requested this session. Completion was not verified (client timeout). Do not mark those rows Connected until a live file list succeeds.

## SSO contract (production workplace app)

### Continue with Google — OAuth 2.1 + PKCE S256

Single consent should request:

- Gmail API (`gmail.modify` or least-privilege `gmail.readonly` + `gmail.send` as product requires)
- Drive API (`drive.file` preferred; `drive` only if product requires full corpus)
- Docs API
- Sheets API
- Calendar API
- `openid` `email` `profile` `offline_access` equivalent (`access_type=offline`)

Redirect URI lives on the OrgSuite HTTPS origin only. Code verifier never leaves the client until the token exchange on the workplace backend.

### Continue with Microsoft — Microsoft identity platform + PKCE S256

Single Graph consent should request:

- `Mail.ReadWrite`
- `Mail.Send`
- `Files.ReadWrite.All` (or `Files.ReadWrite` if personal OneDrive only is enough)
- `Calendars.ReadWrite`
- `User.Read`
- `offline_access`

Outlook-only consent is **not** a OneDrive mount. A second incremental consent is required when Files scopes are missing.

## Token vault

- Store refresh tokens encrypted in the Workplace Vault (Vercel/host env or KMS). Never in Linear, GitHub, browser JS, or this markdown file.
- Encrypt at rest. Rotate on disconnect.
- Users disconnect Google or Microsoft independently.
- Never store passwords.

## Unified Cloud Files page

Static workplace UI: `cloud-storage/index.html`.

Features (product target vs current capability):

| Feature | Status |
|---|---|
| Dual provider panel (Drive + OneDrive) | **Completed** in UI |
| Live Drive quota from PIP | **Connected** (snapshot in UI; refresh requires agent) |
| Live Outlook inbox counts | **Connected** (snapshot in UI; refresh requires agent) |
| Native Drive file browser | **Requires Authorization** |
| OneDrive file browser | **Requires Authorization** |
| Drag-and-drop upload | **Proposed** (needs Files scope + backend) |
| PDF / Office / media preview | **Proposed** (uses vendor preview URLs once mounted) |
| Copy/move Drive ↔ OneDrive | **Proposed** (needs both mounts) |
| Shared folders + version history | **Proposed** (Drive revisions + Graph versions) |

## AI command map

| User command | Route | Status |
|---|---|---|
| Open my Google Drive | PIP Drive search / native Drive MCP | PIP **Connected**; native **Requires Authorization** |
| Search my Gmail attachments | `gmail_search` `has:attachment` | **Connected** |
| Find contracts in OneDrive | Graph `/me/drive/root/search` | **Requires Authorization** |
| Create a Word document in OneDrive | Graph item create + `.docx` | **Requires Authorization** |
| Save this PDF to Google Drive | PIP Drive create / upload | **Available** via PIP |
| Move this spreadsheet from Drive to OneDrive | Download Drive + upload Graph | **Requires Authorization** (OneDrive) |

## Dashboard cards

### Google Workspace

- Gmail inbox (connected mailbox)
- Google Drive usage: 0.41 GB of 15 GB (PIP, 2026-09-14)
- Recent Docs & Sheets: available after a Drive list with MIME filters

### Microsoft Workspace

- Outlook inbox: 113 messages, 82 unread
- OneDrive storage: unknown until Files scope
- Recent Word / Excel / PowerPoint: unknown until Files scope

## Security rules

1. OAuth 2.1 + PKCE S256 only for any new OrgSuite-owned app.
2. Least privilege. Prefer `drive.file` over full Drive when the product allows it.
3. Rate-limit Graph and Google APIs. Log actor, scope, and resource id — not tokens.
4. Background sync is a server job with stored refresh tokens. This Grok chat is not that job.
5. Disconnect must revoke the refresh token at Google/Microsoft and delete the vault row.

## Remaining owner steps

1. Approve the Grok connector cards for **Google Drive** and **OneDrive**.
2. Confirm native `search_files` and a Graph `/me/drive/root/children` list.
3. Review and merge PR on `feat/cloud-connectors`.
4. Optional: attach `cloud-storage/` to a Vercel project (not claimed live).
