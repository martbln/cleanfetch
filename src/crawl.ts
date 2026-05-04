import { normalizeUrl, resolveConfig } from "./config.js";
import { CleanFetchCrawlError } from "./errors.js";
import type { CrawlOptions, CrawlResult } from "./types.js";

type CloudflareCrawlResponse = {
  result?: {
    records?: Array<{
      markdown?: string;
      url?: string;
    }>;
  };
};

export async function crawl(url: string, options: CrawlOptions = {}): Promise<CrawlResult> {
  const normalizedUrl = normalizeUrl(url);
  const config = resolveConfig(options);
  const body: Record<string, unknown> = {
    url: normalizedUrl,
    depth: 1,
    limit: 1,
    formats: ["markdown"],
  };

  if (options.modifiedSince != null) {
    body.modifiedSince = options.modifiedSince;
  }

  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${config.cloudflareAccountId}/browser-rendering/crawl`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.cloudflareApiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const responseBody = await response.text();
    throw new CleanFetchCrawlError(`Cloudflare crawl failed with status ${response.status}`, {
      status: response.status,
      responseBody,
    });
  }

  const json = (await response.json()) as CloudflareCrawlResponse;
  const record = json.result?.records?.[0];

  if (!record?.markdown) {
    throw new CleanFetchCrawlError("Cloudflare crawl returned no markdown");
  }

  return {
    url: normalizedUrl,
    resolvedUrl: record.url ?? normalizedUrl,
    markdown: record.markdown,
  };
}
