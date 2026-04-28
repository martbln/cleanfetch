import { CleanFetchConfigError } from "./errors.js";
import type { CleanFetchOptions, ResolvedAnthropicConfig, ResolvedCleanFetchConfig } from "./types.js";

const DEFAULT_MODEL = "claude-haiku-4-5-20251001";

type Env = Record<string, string | undefined>;

declare const process: { env: Env };

export function normalizeUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    return new URL(candidate).href;
  } catch {
    throw new CleanFetchConfigError(`Invalid URL: ${rawUrl}`);
  }
}

export function resolveConfig(
  options: CleanFetchOptions = {},
  env: Env = process.env,
): ResolvedCleanFetchConfig {
  const anthropicApiKey = options.anthropicApiKey ?? env.ANTHROPIC_API_KEY;
  const cloudflareAccountId = options.cloudflareAccountId ?? env.CLOUDFLARE_ACCOUNT_ID;
  const cloudflareApiToken = options.cloudflareApiToken ?? env.CLOUDFLARE_API_TOKEN;
  const model = options.model ?? DEFAULT_MODEL;

  const missing = [
    ["ANTHROPIC_API_KEY", anthropicApiKey],
    ["CLOUDFLARE_ACCOUNT_ID", cloudflareAccountId],
    ["CLOUDFLARE_API_TOKEN", cloudflareApiToken],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name);

  if (missing.length > 0) {
    throw new CleanFetchConfigError(`Missing required config: ${missing.join(", ")}`);
  }

  return {
    anthropicApiKey: anthropicApiKey!,
    cloudflareAccountId: cloudflareAccountId!,
    cloudflareApiToken: cloudflareApiToken!,
    model,
  };
}

export function resolveAnthropicConfig(
  options: CleanFetchOptions = {},
  env: Env = process.env,
): ResolvedAnthropicConfig {
  const anthropicApiKey = options.anthropicApiKey ?? env.ANTHROPIC_API_KEY;
  const model = options.model ?? DEFAULT_MODEL;

  if (!anthropicApiKey) {
    throw new CleanFetchConfigError("Missing required config: ANTHROPIC_API_KEY");
  }

  return {
    anthropicApiKey,
    model,
  };
}
