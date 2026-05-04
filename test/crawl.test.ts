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
  it("calls Cloudflare Browser Rendering crawl and returns markdown", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          result: {
            records: [{ markdown: "# Pricing", url: "https://stripe.com/gb/pricing" }],
          },
        }),
        { status: 200 },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await crawl("stripe.com/pricing", config);

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.cloudflare.com/client/v4/accounts/account-id/browser-rendering/crawl",
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
      depth: 1,
      limit: 1,
      formats: ["markdown"],
    });
    expect(result).toEqual({
      url: "https://stripe.com/pricing",
      resolvedUrl: "https://stripe.com/gb/pricing",
      markdown: "# Pricing",
    });
  });

  it("passes modifiedSince when supplied", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ result: { records: [{ markdown: "content" }] } }), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await crawl("https://example.com", { ...config, modifiedSince: 1710000000 });

    expect(JSON.parse(fetchMock.mock.calls[0][1].body).modifiedSince).toBe(1710000000);
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
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ result: { records: [{}] } }), { status: 200 })),
    );

    await expect(crawl("https://example.com", config)).rejects.toThrow(CleanFetchCrawlError);
  });
});
