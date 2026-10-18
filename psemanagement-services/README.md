# PSE Management Services storefront

Indiana Fevers Management Services site files. The production deployment is the Vercel `psemanagement` project proxied by the Cloudflare origin worker. This directory must be the project's deployment root so `api/inquiry.js` is available as `/api/inquiry`.

## Inquiry submissions

Contact forms show a receipt only after `/api/inquiry` returns a successful HTTP response with a JSON acknowledgement containing `{"ok":true}`. If the acknowledgement includes an `id`, it must match the submitted request ID. An HTML app-shell fallback, invalid JSON, or a negative acknowledgement does not count as a receipt. If delivery fails, the form keeps its input for retry and says whether a copy was saved on this device. Retrying updates the existing local request instead of adding a duplicate.

The server handler validates the five expected fields and a 32 KiB JSON body limit, then waits for durable acceptance by the internal Connector Hub before returning HTTP 200 with `{"ok":true,"id":"<submitted id>"}`. Other methods return JSON 405. Missing transport configuration returns 503; failed or unverified Hub acceptance returns 502. It never falls back to an optimistic receipt.

Set `INQUIRY_HUB_ORIGIN` to the trusted HTTPS Hub origin and `ORGSUITE_INQUIRY_INGEST_KEY` to the same random ingestion credential configured on the Hub (at least 32 characters, without whitespace). Store both in host configuration, keep the credential out of browser code and source control, and verify the Hub's persistent encrypted storage before deployment. Forwarding uses only `/api/internal/inquiries`, refuses redirects, and bounds its timeout and acknowledgement body.

The exact request schema, response codes, storage expectations, module interface, and production verification steps are in [the inquiry contract](../docs/inquiry-contract.md). On October 17, 2026, tooling failed before an HTTP response could be observed; actual production behavior remains unverified, and no live test inquiry was submitted.

Run the submission regression checks from the repository root:

```sh
node psemanagement-services/tests/inquiry-submission.test.cjs
node psemanagement-services/tests/inquiry-api.test.cjs
```

The nine browser checks and API tests replace network and storage with local fixtures; they send no live inquiries. Deployment and the production inquiry endpoint must be verified separately. See the [Connector Hub](../orgsuite-connector-hub/README.md) and [ecosystem map](../docs/ecosystem.md) for the internal workplace integration.

