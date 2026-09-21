# Meta AI share pages — not a live connection

Pasted snapshots of `https://www.meta.ai/share/a/...` are Meta’s public Next.js shell.

Observed in the dumps:

- HTTP fallback: `NEXT_HTTP_ERROR_FALLBACK;404`
- `isAuthenticated: false`
- `accessToken: null`
- `viewerId: null`
- `consentAsserted: false`
- `robots: noindex`
- In-app banner query: `x_meta_iab=Meta AI`, app version `289.0.0.21.157`

Share IDs seen in the paste:

- `8006087b-c50f-4a5c-bec4-13b7a5bee412`
- `6796bb04-5ecd-435b-825d-6422d2f01ed0`
- `fce8a455-8bda-4918-ae60-3b2e23186dbf`

Those IDs are public path segments, not API keys. Do not treat a 404 share page as authorization for Graph, Pixel, Login, or Llama APIs.

OrgSuite Meta work stays on GitHub + Linear PSE-135 until a Meta App exists and env vars are set on the host.
