Indiana Fevers Management Services production site files. Live deploy is the Vercel psemanagement project proxied by the Cloudflare origin worker.

## Inquiry submissions

Contact forms show a receipt only after `/api/inquiry` returns a successful HTTP response with a JSON acknowledgement containing `{"ok":true}`. If the acknowledgement includes an `id`, it must match the submitted request ID. The server must acknowledge only requests it has accepted; the production endpoint and its response contract still require verification. An HTML app-shell fallback, invalid JSON, or a negative acknowledgement does not count as a receipt. If delivery fails, the form keeps its input for retry and says whether a copy was saved on this device. Retrying updates the existing local request instead of adding a duplicate.

Run the submission regression checks from the repository root:

```sh
node psemanagement-services/tests/inquiry-submission.test.cjs
```

The tests replace network and browser storage with local fixtures; they send no live inquiries. Deployment and the production inquiry endpoint must be verified separately.

