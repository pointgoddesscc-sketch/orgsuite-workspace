"""
OrgSuite Claude (Anthropic) client skeleton
Status: Ready to Configure / Requires Authorization

- Reads ONLY from os.environ["ANTHROPIC_API_KEY"]
- Never hard-codes secrets
- Official anthropic SDK only
- Error handling + structured logging
- Model pinned

Install: pip install anthropic
Env: ANTHROPIC_API_KEY=sk-ant-... (Vercel / Firebase / host only)

Linked to Linear: PSE-31
"""

from __future__ import annotations

import logging
import os
from typing import Any, List, Optional

from anthropic import Anthropic, APIError, APIStatusError, RateLimitError

# Pin model. Update only after checking Anthropic docs.
DEFAULT_MODEL = "claude-opus-4-6"  # example; replace with exact current ID
DEFAULT_MAX_TOKENS = 1024

logger = logging.getLogger("orgsuite.claude_client")
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")


class ClaudeClient:
    def __init__(self) -> None:
        api_key = os.environ.get("ANTHROPIC_API_KEY", "")
        self._api_key_present = bool(api_key and api_key.startswith("sk-ant-"))
        self._client: Optional[Anthropic] = None

        if not self._api_key_present:
            logger.warning("ANTHROPIC_API_KEY missing or invalid format. Client will fail on first call.")
            return

        # SDK reads ANTHROPIC_API_KEY from env by default when api_key is omitted.
        # We pass it only to make the source explicit.
        self._client = Anthropic(api_key=api_key)

    def is_configured(self) -> bool:
        """Health check: returns True only if key is present (no network call)."""
        return self._api_key_present

    def messages(
        self,
        messages: List[dict[str, str]],
        *,
        model: str = DEFAULT_MODEL,
        max_tokens: int = DEFAULT_MAX_TOKENS,
        system: Optional[str] = None,
        temperature: Optional[float] = None,
        request_id: Optional[str] = None,
    ) -> Any:
        """
        Send a messages request to Claude.
        Raises on missing key, validation, network, rate-limit, or API errors.
        """
        if not self._client or not self._api_key_present:
            msg = "ClaudeClient: ANTHROPIC_API_KEY is not set or invalid. Configure in environment only."
            logger.error("%s request_id=%s", msg, request_id)
            raise RuntimeError(msg)

        if not messages:
            raise ValueError("ClaudeClient: messages list is required and must not be empty")

        for m in messages:
            if not isinstance(m, dict) or "role" not in m or "content" not in m:
                raise ValueError("ClaudeClient: each message must be a dict with role and content")
            if not isinstance(m["content"], str) or len(m["content"]) > 200_000:
                raise ValueError("ClaudeClient: content must be a string under safe length")

        rid = request_id or f"claude-{id(self)}"
        logger.info(
            "Claude Messages API call starting request_id=%s model=%s max_tokens=%s count=%d",
            rid,
            model,
            max_tokens,
            len(messages),
        )

        try:
            response = self._client.messages.create(
                model=model,
                max_tokens=max_tokens,
                messages=messages,  # type: ignore[arg-type]
                system=system,
                temperature=temperature,
            )
            logger.info(
                "Claude Messages API call succeeded request_id=%s model=%s stop=%s in=%s out=%s",
                rid,
                getattr(response, "model", None),
                getattr(response, "stop_reason", None),
                getattr(getattr(response, "usage", None), "input_tokens", None),
                getattr(getattr(response, "usage", None), "output_tokens", None),
            )
            return response
        except RateLimitError as e:
            logger.warning("Claude rate limited request_id=%s – apply backoff: %s", rid, e)
            raise
        except APIStatusError as e:
            status = getattr(e, "status_code", None)
            if status in (401, 403):
                logger.error("Claude auth failure request_id=%s status=%s", rid, status)
            else:
                logger.error("Claude API status error request_id=%s status=%s: %s", rid, status, e)
            raise
        except APIError as e:
            logger.error("Claude API error request_id=%s: %s", rid, e)
            raise


# Module-level instance for simple import
claude_client = ClaudeClient()


if __name__ == "__main__":
    # Local smoke test only – never commit real key
    if claude_client.is_configured():
        print("Configured: yes (key present)")
    else:
        print("Configured: no – set ANTHROPIC_API_KEY in environment")
