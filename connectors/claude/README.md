# OrgSuite Claude (Anthropic) Connector Skeleton

**Status:** Ready to Configure / Requires Authorization  
**Linear:** [PSE-31](https://linear.app/pse-management/issue/PSE-31/connect-claude-ai-anthropic-as-orgsuite-multi-ai-connector)

## Purpose
Minimal, secure client for calling the Anthropic Claude Messages API from OrgSuite backends (Vercel, Firebase Cloud Functions, Node services, etc.).

## Security rules (non-negotiable)
- API key lives **only** in environment variables / secrets manager (`ANTHROPIC_API_KEY`).
- Never commit, paste, or log the key.
- Use official SDKs only.
- No browser exposure.
- Pin model ID; handle 429 with backoff.

## Setup
1. Create key at https://platform.claude.com/settings/keys
2. Set in Vercel / host:
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```
3. Install:
   - TypeScript: `npm install @anthropic-ai/sdk`
   - Python: `pip install anthropic`

## Files
- `claudeClient.ts` + `logger.ts` – TypeScript (preferred for OrgSuite Vercel stack)
- `claude_client.py` – Python equivalent

## Usage (TypeScript)
```ts
import { claudeClient } from "./claudeClient";

if (!claudeClient.isConfigured()) {
  throw new Error("ANTHROPIC_API_KEY not set");
}

const result = await claudeClient.messages(
  [{ role: "user", content: "Hello from OrgSuite" }],
  { requestId: "pse-31-smoke", system: "You are a secure OrgSuite assistant." }
);
```

## Next
- Confirm key is in secrets → update Connector Checklist to 🟡 then ✅ after first live call.
- Integrate into multi-AI delivery (see design).
- Prefer Workload Identity Federation for production when ready.

No secrets are present in this folder.
