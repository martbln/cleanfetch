import { describe, expect, it } from "vitest";
import { estimateTokens, reductionPercent } from "../src/token-count.js";

describe("estimateTokens", () => {
  it("estimates tokens from character count", () => {
    expect(estimateTokens("12345678")).toBe(2);
  });

  it("returns 0 for empty content", () => {
    expect(estimateTokens("")).toBe(0);
  });
});

describe("reductionPercent", () => {
  it("rounds percentage reduction", () => {
    expect(reductionPercent(1000, 123)).toBe(88);
  });

  it("returns 0 when raw token count is zero", () => {
    expect(reductionPercent(0, 10)).toBe(0);
  });
});
