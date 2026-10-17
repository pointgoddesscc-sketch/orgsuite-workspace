# Workplace recovery — 2026-10-17

Status: investigation completed; restoration and runtime validation remain blocked.

## Verified in this session

- GitHub authenticated as `pointgoddesscc-sketch`; the primary workplace hub and Super Grok repository READMEs are readable.
- The owner-requested Gmail connection was verified and searched for Grok/xAI correspondence and license, subscription, invoice, receipt, payment, and invitation evidence.
- Grok correspondence was found. The searches returned no matching license receipt or invitation. This does not prove that no subscription exists.
- The supplied screenshots show Orgsuite selected with a message that the user has no team license. The menu also offers a personal workspace.
- Reading `package.json` at the root of `super-grok-app` on its default branch returned 404. Its README describes a Next.js application. A runnable web application has not been established by this check.
- Web-tool checks of the advertised Super Grok app and primary workplace URLs were inconclusive: the tool could not access them. This is not evidence of an outage.
- No Grok account administration connection was found in plugin discovery during the preceding investigation.

## Project recovery map

| Repository | Evidence available | Remaining verification |
|---|---|---|
| [orgsuite-workspace](https://github.com/pointgoddesscc-sketch/orgsuite-workspace) | README, workplace index, status and connector records readable | Revalidate each service; September status labels are historical |
| [super-grok-app](https://github.com/pointgoddesscc-sketch/super-grok-app) | README readable | Locate source/deployment history; resolve missing root package manifest before attempting the documented npm workflow |
| [super-grok](https://github.com/pointgoddesscc-sketch/super-grok) | iOS app-kit README readable | Inspect source, build in Xcode, test with owner-configured credentials |
| [super-grok-office](https://github.com/pointgoddesscc-sketch/super-grok-office) | macOS app README readable | Inspect implementation and key handling; build and test on macOS |
| [orgsuite-grok-connector](https://github.com/pointgoddesscc-sketch/orgsuite-grok-connector) | Prototype README readable | Locate runnable prototype and establish authenticated integration |

Existing consolidated project directory: [workplace index](docs/workplace-index.md).

## Restore access in order

1. On the official Grok account page, verify the signed-in account and its linked sign-in methods. The requested Gmail identity has not been proven to own the workspace or subscription by this email search.
2. Select the personal workspace and check whether the expected chats and projects are present. A workspace switch is a diagnostic step, not proof of data recovery.
3. For Orgsuite, an administrator must inspect the existing team membership and license allocation in the official Grok admin interface and assign an available license to the correct member. Check existing billing before purchasing anything.
4. Consult the official [license management guide](https://docs.x.ai/grok/management) and [workspace guide](https://docs.x.ai/grok/user-guide) for the applicable account plan.
5. Inventory personal and team projects separately, then export or back up available content through supported vendor features before any migration. GitHub source recovery does not recover grok.com chat history.
6. For the custom apps, locate source, storage, and hosting configuration before deploying replacements. Preserve existing repositories, branches, and data stores.
7. Reconnect each service through its official account authorization flow and verify the actual required operation. Email access here does not automatically connect Gmail inside Grok.

## Completion criteria

- Correct account and Orgsuite membership confirmed.
- Team license warning gone and a test conversation succeeds.
- Expected project names, files, and history reconciled against an owner inventory.
- Custom app source builds and its deployment passes a functional test.
- Each required connector is tested in the destination workspace.
- Existing content is backed up before any migration.

No license was purchased or assigned, account merged, project history restored, deployment changed, or runtime marked healthy in this investigation. No secrets or private message bodies are included here.
