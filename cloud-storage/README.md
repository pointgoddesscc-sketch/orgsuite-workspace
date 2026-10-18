# OrgSuite Cloud Storage

Historical static workplace page for the Google Drive + OneDrive mount.

- Snapshot source: [`docs/cloud-connectors.md`](../docs/cloud-connectors.md), last verified September 14, 2026
- Issue: PSE-100
- This UI does **not** call Google or Microsoft APIs and does **not** store tokens.

Open `index.html` locally or attach the folder to a Vercel project after review. Do not claim a production deploy until the Vercel project shows READY.

For operational Google Drive access use the
[OrgSuite Connector Hub](../orgsuite-connector-hub/README.md). It provides
authenticated provider tests, approved-root listing/search, project folders,
approved upload/download, and an audit trail. It requires its own official
Google authorization and host configuration. The static page's historical
counts and Connected labels do not establish current access or transfer tokens.

The new Hub does not implement OneDrive. Existing Microsoft architecture remains
a reference in the dated cloud-connectors document. Start at the
[ecosystem map](../docs/ecosystem.md) for current component boundaries and
[Hub security](../docs/connector-hub-security.md) for exact scopes and file limits.
