import { cleanMarkdown } from "./clean-markdown.js";
import { crawl } from "./crawl.js";
import { preFilter } from "./prefilter.js";
import { estimateTokens, reductionPercent } from "./token-count.js";
import type { CleanOptions, CleanResult } from "./types.js";

export async function clean(url: string, options: CleanOptions = {}): Promise<CleanResult> {
  const crawled = await crawl(url, options);
  const preFilteredMarkdown = preFilter(crawled.markdown);
  const markdown = await cleanMarkdown(preFilteredMarkdown, {
    ...options,
    url: crawled.resolvedUrl,
  });

  const rawTokens = estimateTokens(crawled.markdown);
  const cleanTokens = estimateTokens(markdown);

  return {
    url: crawled.url,
    resolvedUrl: crawled.resolvedUrl,
    markdown,
    rawMarkdown: crawled.markdown,
    preFilteredMarkdown,
    rawTokens,
    cleanTokens,
    reduction: reductionPercent(rawTokens, cleanTokens),
  };
}
