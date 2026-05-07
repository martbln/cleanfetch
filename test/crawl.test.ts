import { afterEach, describe, expect, it, vi } from "vitest";
import { CleanFetchCrawlError } from "../src/errors.js";
import { crawl } from "../src/crawl.js";

const config = {
  anthropicApiKey: "anthropic",
  cloudflareAccountId: "account-id",
  cloudflareApiToken: "cf-token",
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("crawl", () => {
  it("calls Cloudflare Browser Rendering markdown and returns markdown", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          result: "# Pricing",
        }),
        { status: 200 },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await crawl("stripe.com/pricing", config);

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.cloudflare.com/client/v4/accounts/account-id/browser-rendering/markdown",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer cf-token",
          "Content-Type": "application/json",
        }),
      }),
    );
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      url: "https://stripe.com/pricing",
    });
    expect(result).toEqual({
      url: "https://stripe.com/pricing",
      resolvedUrl: "https://stripe.com/pricing",
      markdown: "# Pricing",
    });
  });

  it("throws when Cloudflare returns empty markdown", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ result: "" }), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(crawl("https://example.com", config)).rejects.toThrow(CleanFetchCrawlError);
  });

  it("throws CleanFetchCrawlError for non-2xx responses", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("bad token", { status: 403 })));

    await expect(crawl("https://example.com", config)).rejects.toMatchObject({
      name: "CleanFetchCrawlError",
      status: 403,
      responseBody: "bad token",
    });
  });

  it("throws when Cloudflare returns no markdown", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ result: undefined }), { status: 200 })),
    );

    await expect(crawl("https://example.com", config)).rejects.toThrow(CleanFetchCrawlError);
  });
});
