export type CleanFetchOptions = {
  anthropicApiKey?: string;
  cloudflareAccountId?: string;
  cloudflareApiToken?: string;
  model?: string;
};

export type ResolvedCleanFetchConfig = {
  anthropicApiKey: string;
  cloudflareAccountId: string;
  cloudflareApiToken: string;
  model: string;
};

export type ResolvedAnthropicConfig = {
  anthropicApiKey: string;
  model: string;
};

export type CrawlResult = {
  url: string;
  resolvedUrl: string;
  markdown: string;
};

export type CleanMarkdownOptions = CleanFetchOptions & {
  url: string;
};

export type CleanResult = {
  url: string;
  resolvedUrl: string;
  markdown: string;
  rawMarkdown: string;
  preFilteredMarkdown: string;
  rawTokens: number;
  cleanTokens: number;
  reduction: number;
};
