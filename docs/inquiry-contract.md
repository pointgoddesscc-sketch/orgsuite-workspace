# Inquiry delivery contract

The PSE Management Services storefront submits its public inquiry forms to the same-origin `POST /api/inquiry`. A receipt confirms durable acceptance by the internal Connector Hub. It does not mean that an email was delivered, a booking was confirmed, or a member of staff acted on the inquiry.

## Public request

Send `Content-Type: application/json` with an optional charset parameter. The request must be at most **32 KiB**, including JSON encoding. The body must be an object containing exactly these five string fields:

| Field | Validation after trimming surrounding whitespace |
| --- | --- |
| `name` | 1–160 characters; no control characters |
| `email` | At most 254 characters; a nonempty local part and dotted domain; no whitespace, control characters, or angle brackets |
| `message` | 1–8,000 characters; tabs and line breaks are allowed; other control characters are rejected |
| `service` | `contact`, `game`, `player`, `event`, `meet`, `vip`, or `management` |
| `id` | `IFMS-` followed by 1–48 uppercase ASCII letters or digits, matching the existing browser request identifiers |

This email check validates syntax; it does not verify mailbox ownership or delivery. There are no client-controlled routing addresses, callback URLs, or extra fields.

## Public response

The only successful response is **HTTP 200** with a JSON body of `{"ok":true,"id":"<submitted id>"}`. The ID always matches the validated request. The handler sends this response only after the injected `acceptInquiry(record)` function resolves with the matching acknowledgement. The production acceptor requires the Hub's HTTP success and JSON `{"ok":true,"id":"<submitted id>"}` after durable acceptance. A pending write, in-memory queue, log entry, or unverified forwarding attempt is insufficient.

Every error returns JSON `{"ok":false,"error":"<code>"}` and a non-success status:

| Status | Error code | Meaning |
| --- | --- | --- |
| 400 | `invalid_json` | Missing, malformed, or invalid UTF-8 JSON |
| 400 | `invalid_inquiry` | Unexpected fields, field types, or validation failure |
| 405 | `method_not_allowed` | Any method other than POST; response includes `Allow: POST` |
| 413 | `body_too_large` | Request exceeds the bounded body limit |
| 415 | `json_required` | JSON content type is absent or unsupported |
| 502 | `inquiry_not_accepted` | Hub HTTP failure, timeout, network failure, or failed acceptance callback |
| 502 | `invalid_acknowledgement` | Hub JSON is missing, malformed, oversized, negative, or has no matching ID |
| 503 | `inquiry_unavailable` | Missing or unsafe server configuration |

All responses use `Cache-Control: no-store` and `X-Content-Type-Options: nosniff`. Error bodies contain stable codes rather than inquiry contents, credentials, or upstream error details. A GET health probe cannot create a receipt and returns 405. HTML fallback pages and redirects are never acknowledgements.

The browser waits for a successful HTTP response and JSON `ok: true`; an ID, when present, must match. Failed delivery preserves the form and offers a retry using the same ID. Browser local storage is a device copy, not server acceptance. It may contain the inquiry's contact details; use the internal Hub for controlled staff access rather than sharing browser storage.

## Production transport and durable receiver

The Vercel function is `psemanagement-services/api/inquiry.js`; shared validation and transport live in `psemanagement-services/server/inquiry.cjs`. Deploy this directory as the storefront project's root. Its existing Vercel rewrites exclude `/api/`, so the function is not replaced with the storefront app shell. Domain and Cloudflare routing must also preserve `/api/inquiry` to this function.

Configure these values in the hosting secret manager, never in browser code or committed configuration:

| Variable | Purpose |
| --- | --- |
| `INQUIRY_HUB_ORIGIN` | Trusted HTTPS origin of the deployed internal Hub ingress, with no credentials, path, query, or fragment. A trailing slash is allowed. |
| `ORGSUITE_INQUIRY_INGEST_KEY` | Shared ingestion credential, at least 32 characters with no whitespace, configured on both the storefront and Hub servers. Use a newly generated random value. |

The server forwards only to the fixed `/api/internal/inquiries` path using POST and `Authorization: Bearer <ingestion credential>`. It does not forward visitor cookies or browser authorization. Redirects are refused, the complete upstream operation has an eight-second abort deadline, and acknowledgement JSON is bounded to 16 KiB. HTTP is allowed only for `localhost`, `127.0.0.1`, or `::1` when `NODE_ENV=development`; production requires HTTPS.

The Hub must authenticate the ingestion credential independently of dashboard authentication, run the shared `validateInquiry` function, and commit the encrypted inquiry to its configured persistent database before returning an acknowledgement. The receiving storage must use a durable volume and the Hub's configured encryption key; an ephemeral/serverless filesystem is not a production database. Duplicate IDs with identical canonical data acknowledge the existing durable record. Reusing an accepted ID with different data must fail rather than overwrite it. Limit access to stored inquiry contents, define a retention policy, rotate the ingestion credential on both hosts together, and configure perimeter abuse controls before exposing the public form at scale.

The public handler deliberately fails closed without a usable receiver. Repository tests can verify this contract without live credentials, but cannot establish that production credentials, ingress routing, persistent storage, or deployment settings are correct.

## Current production verification

**October 17, 2026:** the session's shell proxy refused the connection before an HTTP response was available, and the web tool could not access the endpoint. The live `/api/inquiry` status and its deployed response body are therefore **unverified**. These tool failures do not establish that the endpoint returns 404, accepts inquiries, or is compromised. No live POST or synthetic inquiry was submitted.

After a human reviews and merges the relevant pull requests, deploy the storefront function and Hub with the configuration above. First verify that a credential-free GET produces JSON 405 and `Allow: POST`. Then use a designated test inquiry with explicit test contact information, confirm the matching HTTP/JSON acknowledgement and durable Hub record, and exercise a controlled receiver failure to ensure no receipt appears. Production delivery remains an external verification step until those observations are recorded. Do not use the marketing budget to verify this endpoint.

## Local checks and module interface

Run these checks from the repository root:

```sh
node psemanagement-services/tests/inquiry-submission.test.cjs
node psemanagement-services/tests/inquiry-api.test.cjs
```

The nine browser regressions cover honest receipts, retained input, retries, and local-storage failures. The API suite covers request validation and bounds, pending/failed/durable acceptance, unsafe and missing configuration, redirect refusal, bounded Hub acknowledgements, and transport timeout. It sends no real inquiries.

`server/inquiry.cjs` exports:

- `validateInquiry(input)`: returns a new canonical five-field record, or throws `InquiryError` with `status` and `code`.
- `readJsonBody(req)`: reads at most 32 KiB from a Node request or platform-parsed `req.body`, returning parsed JSON or throwing `InquiryError`.
- `createInquiryHandler({ acceptInquiry, env, fetchImpl })`: returns a Node/Vercel request handler. An injected `acceptInquiry` must durably accept the record and resolve `{ ok: true, id: record.id }`.
- `createHubAcceptor({ env, fetchImpl, timeoutMs })`: returns the fixed-path production forwarding acceptor. `fetchImpl` and `timeoutMs` allow isolated local tests; the default deadline is 8,000 ms.
- `ALLOWED_SERVICES`, `MAX_BODY_BYTES`, and `InquiryError` for the internal receiver and tests.

See [the storefront README](../psemanagement-services/README.md), [the Connector Hub](../orgsuite-connector-hub/README.md), and [the ecosystem map](ecosystem.md) for deployment and workplace context.
