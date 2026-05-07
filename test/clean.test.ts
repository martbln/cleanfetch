import { afterEach, describe, expect, it, vi } from "vitest";
import { clean } from "../src/clean.js";

const options = {
  anthropicApiKey: "anthropic",
  cloudflareAccountId: "account-id",
  cloudflareApiToken: "cf-token",
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("clean", () => {
  it("runs crawl, prefilter, cleaner, and token metadata", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            result: Array.from({ length: 100 }, (_, index) => `line ${index + 1}`).join("\n"),
          }),
          { status: 200 },
        ),
      ),
    );

    const create = vi.fn().mockResolvedValue({
      content: [{ type: "text", text: "# Clean pricing" }],
    });

    const result = await clean("stripe.com/pricing", {
      ...options,
      anthropicClient: { messages: { create } },
    });

    expect(result.url).toBe("https://stripe.com/pricing");
    expect(result.resolvedUrl).toBe("https://stripe.com/pricing");
    expect(result.rawMarkdown).toContain("line 1");
    expect(result.preFilteredMarkdown).toContain("line 13");
    expect(result.markdown).toBe("# Clean pricing");
    expect(result.rawTokens).toBeGreaterThan(result.cleanTokens);
    expect(result.reduction).toBeGreaterThan(0);
  });
});
