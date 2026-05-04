import { describe, expect, it, vi } from "vitest";
import { CleanFetchCleanError } from "../src/errors.js";
import { cleanMarkdown } from "../src/clean-markdown.js";

describe("cleanMarkdown", () => {
  it("sends extraction prompt to Anthropic and returns text", async () => {
    const create = vi.fn().mockResolvedValue({
      content: [{ type: "text", text: "# Stripe Pricing\n\n- Pro: $10" }],
    });

    const result = await cleanMarkdown("# Noisy page", {
      url: "https://stripe.com/pricing",
      anthropicApiKey: "sk-test",
      anthropicClient: { messages: { create } },
    });

    expect(result).toBe("# Stripe Pricing\n\n- Pro: $10");
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 4000,
        system: expect.stringContaining("Extract only factual"),
        messages: [
          {
            role: "user",
            content: expect.stringContaining("https://stripe.com/pricing"),
          },
        ],
      }),
    );
  });

  it("throws CleanFetchCleanError when Anthropic returns no text", async () => {
    const create = vi.fn().mockResolvedValue({ content: [] });

    await expect(
      cleanMarkdown("content", {
        url: "https://example.com",
        anthropicApiKey: "sk-test",
        anthropicClient: { messages: { create } },
      }),
    ).rejects.toThrow(CleanFetchCleanError);
  });

  it("wraps Anthropic failures", async () => {
    const originalError = new Error("rate limited");
    const create = vi.fn().mockRejectedValue(originalError);

    await expect(
      cleanMarkdown("content", {
        url: "https://example.com",
        anthropicApiKey: "sk-test",
        anthropicClient: { messages: { create } },
      }),
    ).rejects.toSatisfy((err: unknown) => {
      if (!(err instanceof CleanFetchCleanError)) return false;
      if (
        !err.message.startsWith("Anthropic cleaning failed:") ||
        !err.message.includes("Anthropic cleaning failed: rate limited")
      ) {
        return false;
      }
      return err.cause === originalError;
    });
  });
});
