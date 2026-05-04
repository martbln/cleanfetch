import { describe, expect, it } from "vitest";
import { formatStats, parseArgs } from "../src/cli.js";

describe("parseArgs", () => {
  it("parses the default URL argument", () => {
    expect(parseArgs(["https://stripe.com/pricing"])).toEqual({
      url: "https://stripe.com/pricing",
      json: false,
      noStats: false,
    });
  });

  it("parses json, output, model, and no-stats flags", () => {
    expect(
      parseArgs([
        "https://stripe.com/pricing",
        "--json",
        "--output",
        "pricing.md",
        "--model",
        "custom-model",
        "--no-stats",
      ]),
    ).toEqual({
      url: "https://stripe.com/pricing",
      json: true,
      output: "pricing.md",
      model: "custom-model",
      noStats: true,
    });
  });

  it("throws for missing URL", () => {
    expect(() => parseArgs([])).toThrow("Usage:");
  });
});

describe("formatStats", () => {
  it("formats token stats for stderr", () => {
    expect(
      formatStats({
        rawTokens: 16273,
        cleanTokens: 1762,
        reduction: 89,
      }),
    ).toContain("16,273 raw -> 1,762 clean (89% reduction)");
  });
});
