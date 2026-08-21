# OrgSuite Multi-AI Delivery Extension — Claude Addition

**Status:** Proposed / Design Ready  
**Linked issue:** [PSE-31](https://linear.app/pse-management/issue/PSE-31/connect-claude-ai-anthropic-as-orgsuite-multi-ai-connector)  
**Date:** 2026-08-21  
**Author:** Grok / OrgSuite Engineering

## Goal
Extend the existing cross-AI messaging suite (orgsuite skill) so Claude becomes a first-class delivery target alongside Meta AI, ChatGPT, Telegram, Copilot, and Grok. Preserve the same privacy-first, explicit-user-share model: no assumed access to external accounts.

## Current Delivery Targets (from orgsuite skill)
- Meta AI (creative / social)
- ChatGPT (reasoning / structured)
- Telegram (real-time / bots)
- Copilot (productivity / Microsoft)
- Grok (research / xAI)

## New Target: Claude (Anthropic)
- Strength: careful reasoning, long-context, safety-oriented, tool-use capable
- Delivery modes (phased):
  1. **Manual** (immediate, zero-auth): Grok produces a clean, ready-to-paste block tailored for Claude (prompt + context + OrgSuite tag).
  2. **Programmatic** (after key confirmed): Backend calls Claude Messages API via the skeleton client; response is logged back into the unified OrgSuite thread with source tag `[Claude]`.
  3. **Future (optional)**: Claude-side connectors / MCP reverse direction so Claude can call OrgSuite tools (requires separate authorization and scopes).

## Architecture

```
User intent / conversation snippet
        │
        ▼
┌───────────────────────────────┐
│  OrgSuite Core (Grok layer)   │
│  - Tag source                 │
│  - Enrich with OrgSuite ctx   │
│  - Decide delivery set        │
└───────────────┬───────────────┘
                │
    ┌───────────┼───────────┬────────────┬────────────┐
    ▼           ▼           ▼            ▼            ▼
 Meta AI    ChatGPT     Telegram     Copilot       Grok
    │           │           │            │            │
    └───────────┴───────────┴────────────┴────────────┘
                │
                ▼  (new)
           Claude Client
      (env ANTHROPIC_API_KEY only)
                │
                ▼
        Anthropic Messages API
                │
                ▼
        Response → OrgSuite unified thread
        tagged [Claude] + timestamp + requestId
```

## Delivery Formats

### 1. Manual block (always available)
```
[OrgSuite → Claude]
Source: <original platform>
Context: <short OrgSuite summary>
Prompt for Claude:
---
<cleaned user intent + instructions>
---
Please reply in a style that can be logged back into OrgSuite.
```

### 2. Programmatic (post-authorization)
- Use `claudeClient.messages(...)` from the skeleton.
- System prompt includes OrgSuite identity and safety rules.
- Capture `usage`, `stop_reason`, model; store metadata only (never full prompts in public logs if sensitive).
- On success: append to unified thread with confirmation phrase:
  “Message tracked in OrgSuite and delivered to Meta AI, ChatGPT, Telegram, Copilot, Grok, and Claude.”

### 3. Confirmation & tracking
- Extend the existing confirmation phrase and habit-tracker logging.
- Add Claude frequency / theme metrics to habit skill when implemented.
- Update orgsuite skill documentation and the React Command Center dashboard status indicator.

## Implementation Phases
1. **Design + skeleton** (this document + PSE-31 + artifacts) — Done.
2. **Key confirmation** — Owner places `ANTHROPIC_API_KEY` in secrets only.
3. **Checklist promotion** — 🟡 → ✅ after first verified call.
4. **Manual delivery live** — Grok starts producing Claude-ready blocks immediately.
5. **Programmatic path** — Wire client into Cloud Function / Vercel API route; add to delivery set.
6. **Dashboard + skill update** — Show Claude status in Command Center; update orgsuite skill description.
7. **Optional MCP reverse** — Separate issue, least-privilege scopes only.

## Security & Privacy
- Same rules as PSE-31 Security Checklist.
- Manual mode never requires a key.
- Programmatic mode fails closed if key missing.
- No automatic scraping of Claude conversations; only explicit user shares or API responses we initiate.
- Rate-limit and cost awareness: Claude calls are billable; surface usage in Command Center when live.

## Success Metrics
- Claude appears in Connector Checklist as ✅.
- Unified confirmation phrase includes Claude.
- At least one end-to-end programmatic round-trip logged with requestId.
- No secrets ever appear in GitHub, Linear, or chat.

## Open Decisions for Owner
- Preferred model ID for production.
- Whether Claude should be in the default delivery set or opt-in per message.
- Budget / rate-limit policy for automated calls.
- Whether to pursue Claude connectors (MCP) in a follow-up issue.

This design is ready for implementation the moment the Anthropic key is confirmed present in environment variables only.
