import { describe, expect, it } from "vitest";
import { preFilter } from "../src/prefilter.js";

function numberedLines(count: number): string {
  return Array.from({ length: count }, (_, index) => `line ${index + 1}`).join("\n");
}

describe("preFilter", () => {
  it("cuts the first 12 percent and final 15 percent of lines", () => {
    const result = preFilter(numberedLines(100));

    expect(result.startsWith("line 13")).toBe(true);
    expect(result.endsWith("line 85")).toBe(true);
  });

  it("removes images, bare links, and bullet links", () => {
    const markdown = [
      "keep before",
      "![hero](https://example.com/hero.png)",
      "[Home](https://example.com)",
      "* [Docs](https://example.com/docs)",
      "keep after",
    ].join("\n");

    const result = preFilter(markdown, { trimByPosition: false });

    expect(result).toContain("keep before");
    expect(result).toContain("keep after");
    expect(result).not.toContain("hero.png");
    expect(result).not.toContain("[Home]");
    expect(result).not.toContain("[Docs]");
  });

  it("collapses three or more blank lines to two", () => {
    const result = preFilter("first\n\n\n\nsecond", { trimByPosition: false });
    expect(result).toBe("first\n\nsecond");
  });
});
