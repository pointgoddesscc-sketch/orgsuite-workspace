# Advertising and tracking readiness

Updated October 18, 2026. The current instruction is **no live campaigns and no
spend**. The previously recorded audience is the USA and the amount is
**US$100 total**, not US$100 per day. That historical ceiling does not override
the current instruction. Obtain fresh, explicit launch authorization before
creating any live campaign or enabling delivery.

## Current internal capability

The [Connector Hub](../orgsuite-connector-hub/README.md) provides the internal
status, audit, and provider adapter structure. After real authorization, its
Meta adapter reads ad-account status and account-level impressions, clicks, and
spend for the last seven days. It performs no campaign creation, edits, or
billing operations. No live authorization or metrics are implied by the code.

Windsor.ai is optional. The internal Hub can receive supported services directly
through official APIs and does not need Windsor for the implemented Meta read
path. Google Ads is not yet an implemented Hub adapter. Do not treat a Windsor
sign-in, a Google Ads customer ID, or an existing chat connector as working Hub
authorization. There is no automatic transfer of credentials between them.

## Remaining external steps

| Gate | Exact action and evidence needed |
| --- | --- |
| Product and landing page | Confirm that the intended product is the Canva-ready poster-and-flyer media pack at `psemanagement.services/store`; verify current price, inventory/digital fulfillment, ownership or licensed creative rights, clear terms/refunds, and accurate claims. This remains a campaign target to verify, not an approved live offer. |
| Checkout and inquiries | Complete a controlled checkout/fulfillment test without advertising spend. Deploy and verify the [inquiry contract](inquiry-contract.md), including a matching durable receipt and failure behavior. Record the result and date. |
| Google Ads ownership | Sign in through the official Google Ads account interface and verify that customer `636-854-5352` is the intended account and the operator has the required access. IDs are historical references, not proof of current authorization. |
| Earlier disapproval | Review the current policy center for historical campaign `24002829973`. Earlier correspondence dated July 3 referenced **Compromised Site**. The present policy state and the underlying site condition are unverified; investigate the actual notice and remediation, then request review through Google if appropriate. Do not bypass the policy review. |
| Google Ads data | Choose an authorized Windsor.ai Google Ads connection or implement an official Google Ads API adapter. The latter needs the real developer token, authorized OAuth client and scopes, refresh-token storage, customer selection, and any applicable manager-account context. Start with read-only reporting behavior and a live account test. |
| Meta / Facebook | In the official Meta business settings, confirm business, app, ad account, page, ownership, and operator permissions. Provision `ads_read` for the existing authorized app/account and place credentials in the Hub host secret manager. Test the correct account in the Hub. Connecting a Facebook page or Metricool network alone does not authorize the Hub API. |
| GoDaddy / domain | Verify the intended domain and account owner in the official GoDaddy console, confirm registration/billing, DNS records, HTTPS, and the actual storefront hosting target. Provision only the existing health integration's required API access if appropriate. A green public health URL does not prove domain ownership, account authorization, or working mail. |
| Tracking and privacy | Confirm consent behavior and privacy notices before enabling analytics or advertising tags. Configure actual provider tag IDs and verified conversion destinations; validate a designated test conversion and deduplication before optimization. No fabricated IDs, invented conversion events, or unapproved CAPI sends. |
| Budget and launch | Present the verified product, USA targeting, dates, creatives, bidding, conversion definition, and an enforceable US$100 total cap for fresh approval. Some ad platforms use average daily budgets with overspend rules; do not substitute a daily setting for a total limit. Keep delivery disabled until approved. |

Sign in and grant access only in official provider interfaces. Never paste
passwords, login codes, API secrets, or refresh tokens into chat, issues, PRs,
or committed files. No remote browser session or existing account login is
assumed. See [GoDaddy setup history](godaddy-secure-integration.md) and
[Hub security](connector-hub-security.md) for the separation of access paths.
The existing [primary-domain instructions](../PRODUCTION-PSE-SENT.md) keep
`pse-sent.com` with Cloudflare Registrar; do not move its nameservers to GoDaddy
or create a second zone as part of advertising preparation.

## Internal handoff checklist

1. Review and merge the inquiry repair and Hub changes through human review.
2. Deploy the Hub on a persistent internal host and configure the owner session,
   encryption key, ingestion key, and chosen provider grants.
3. Record fresh successful provider tests for the intended accounts; confirm
   status becomes stale when evidence expires.
4. Verify storefront routing, durable inquiry intake, product checkout,
   fulfillment, domain configuration, policy status, and consent/tracking.
5. Attach the resulting evidence to the launch review and obtain fresh
   authorization before creating a live campaign or spending money.

The implementation does not schedule a future launch, enable an existing ad,
or promise automatic follow-up outside the current task. Remaining credentials,
consent, provider reviews, and human merge/deploy steps stay explicit blockers.
