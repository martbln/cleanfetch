import { describe, expect, it } from "vitest";
import { CleanFetchConfigError } from "../src/errors.js";
import { normalizeUrl, resolveAnthropicConfig, resolveConfig } from "../src/config.js";

describe("normalizeUrl", () => {
  it("adds https when a scheme is missing", () => {
    expect(normalizeUrl("stripe.com/pricing")).toBe("https://stripe.com/pricing");
  });

  it("trims surrounding whitespace before normalizing", () => {
    expect(normalizeUrl("  stripe.com/pricing  ")).toBe("https://stripe.com/pricing");
  });

  it("preserves explicit http URLs", () => {
    expect(normalizeUrl("http://example.com")).toBe("http://example.com/");
  });

  it("throws for invalid URLs", () => {
    expect(() => normalizeUrl("not a url with spaces")).toThrow(CleanFetchConfigError);
  });
});

describe("resolveConfig", () => {
  it("uses explicit options before env vars", () => {
    const config = resolveConfig(
      {
        anthropicApiKey: "explicit-anthropic",
        cloudflareAccountId: "explicit-account",
        cloudflareApiToken: "explicit-token",
        model: "custom-model",
      },
      {
        ANTHROPIC_API_KEY: "env-anthropic",
        CLOUDFLARE_ACCOUNT_ID: "env-account",
        CLOUDFLARE_API_TOKEN: "env-token",
      },
    );

    expect(config).toMatchObject({
      anthropicApiKey: "explicit-anthropic",
      cloudflareAccountId: "explicit-account",
      cloudflareApiToken: "explicit-token",
      model: "custom-model",
    });
  });

  it("uses env vars when explicit options are absent", () => {
    const config = resolveConfig(
      {},
      {
        ANTHROPIC_API_KEY: "env-anthropic",
        CLOUDFLARE_ACCOUNT_ID: "env-account",
        CLOUDFLARE_API_TOKEN: "env-token",
      },
    );

    expect(config.anthropicApiKey).toBe("env-anthropic");
    expect(config.cloudflareAccountId).toBe("env-account");
    expect(config.cloudflareApiToken).toBe("env-token");
    expect(config.model).toBe("claude-haiku-4-5-20251001");
  });

  it("throws when a required credential is missing", () => {
    expect(() => resolveConfig({}, {})).toThrow(CleanFetchConfigError);
  });
});

describe("resolveAnthropicConfig", () => {
  it("only requires Anthropic credentials for markdown-only cleaning", () => {
    const config = resolveAnthropicConfig({}, { ANTHROPIC_API_KEY: "env-anthropic" });

    expect(config).toEqual({
      anthropicApiKey: "env-anthropic",
      model: "claude-haiku-4-5-20251001",
    });
  });

  it("throws when Anthropic credentials are missing", () => {
    expect(() => resolveAnthropicConfig({}, {})).toThrow(CleanFetchConfigError);
  });
});
