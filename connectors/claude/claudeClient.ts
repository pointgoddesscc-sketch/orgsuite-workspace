/**
 * OrgSuite Claude (Anthropic) client skeleton
 * Status: Ready to Configure / Requires Authorization
 *
 * - Reads ONLY from process.env.ANTHROPIC_API_KEY
 * - Never hard-codes secrets
 * - Official @anthropic-ai/sdk only
 * - Error handling + structured logging
 * - Model pinned; update when Anthropic deprecates
 *
 * Install: npm install @anthropic-ai/sdk
 * Env: ANTHROPIC_API_KEY=sk-ant-... (Vercel / Firebase / host only)
 *
 * Linked to Linear: PSE-31
 */

import Anthropic from "@anthropic-ai/sdk";
import { createLogger } from "./logger"; // replace with your OrgSuite logger

const log = createLogger("claude-client");

// Pin model. Update only after checking Anthropic docs.
const DEFAULT_MODEL = "claude-opus-4-6"; // example current Opus-class; replace with exact ID from console
const DEFAULT_MAX_TOKENS = 1024;

export interface ClaudeMessageInput {
  role: "user" | "assistant";
  content: string;
}

export interface ClaudeCallOptions {
  model?: string;
  maxTokens?: number;
  system?: string;
  temperature?: number;
  /** Optional OrgSuite correlation id for audit */
  requestId?: string;
}

export class ClaudeClient {
  private client: Anthropic | null = null;
  private readonly apiKeyPresent: boolean;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    this.apiKeyPresent = Boolean(apiKey && apiKey.startsWith("sk-ant-"));

    if (!this.apiKeyPresent) {
      log.warn("ANTHROPIC_API_KEY missing or invalid format. Client will fail on first call.");
      return;
    }

    // SDK automatically reads ANTHROPIC_API_KEY from env when not passed.
    // We pass it explicitly only to make the dependency obvious and avoid accidental browser use.
    this.client = new Anthropic({
      apiKey, // still from env only
      // dangerouslyAllowBrowser: false  // default; never enable
    });
  }

  /**
   * Send a messages request to Claude.
   * Throws on missing key, network, rate-limit, or API errors.
   */
  async messages(
    messages: ClaudeMessageInput[],
    options: ClaudeCallOptions = {}
  ): Promise<Anthropic.Messages.Message> {
    if (!this.client || !this.apiKeyPresent) {
      const err = new Error(
        "ClaudeClient: ANTHROPIC_API_KEY is not set or invalid. Configure in environment only."
      );
      log.error({ err, requestId: options.requestId }, "Missing API key");
      throw err;
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      throw new Error("ClaudeClient: messages array is required and must not be empty");
    }

    // Basic input sanitization (extend with your OrgSuite validator)
    for (const m of messages) {
      if (!m.role || !m.content || typeof m.content !== "string") {
        throw new Error("ClaudeClient: each message must have role and string content");
      }
      if (m.content.length > 200_000) {
        // rough guard; Anthropic has its own limits
        throw new Error("ClaudeClient: message content exceeds safe length");
      }
    }

    const model = options.model ?? DEFAULT_MODEL;
    const maxTokens = options.maxTokens ?? DEFAULT_MAX_TOKENS;
    const requestId = options.requestId ?? `claude-${Date.now()}`;

    log.info(
      { requestId, model, maxTokens, messageCount: messages.length },
      "Claude Messages API call starting"
    );

    try {
      const response = await this.client.messages.create({
        model,
        max_tokens: maxTokens,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        system: options.system,
        temperature: options.temperature,
      });

      log.info(
        {
          requestId,
          model: response.model,
          stopReason: response.stop_reason,
          inputTokens: response.usage?.input_tokens,
          outputTokens: response.usage?.output_tokens,
        },
        "Claude Messages API call succeeded"
      );

      return response;
    } catch (error: unknown) {
      // Structured error handling
      const err = error as any;
      const status = err?.status ?? err?.statusCode;
      const type = err?.error?.type ?? err?.type;

      if (status === 429) {
        log.warn({ requestId, status, type }, "Claude rate limited – apply backoff");
        // Caller should implement exponential backoff / queue
      } else if (status === 401 || status === 403) {
        log.error({ requestId, status, type }, "Claude auth failure – check key / scopes");
      } else {
        log.error({ requestId, status, type, message: err?.message }, "Claude API error");
      }

      throw error; // re-throw for upstream handling
    }
  }

  /** Health check: returns true only if key is present (does not call network). */
  isConfigured(): boolean {
    return this.apiKeyPresent;
  }
}

// Singleton for simple use (or inject in your DI)
export const claudeClient = new ClaudeClient();

/**
 * Example usage (never run in production without key):
 *
 * const result = await claudeClient.messages(
 *   [{ role: "user", content: "Summarize OrgSuite connector status." }],
 *   { requestId: "pse-31-test", system: "You are a secure OrgSuite assistant." }
 * );
 * console.log(result.content);
 */
