export type PreFilterOptions = {
  trimByPosition?: boolean;
};

export function preFilter(markdown: string, options: PreFilterOptions = {}): string {
  const trimByPosition = options.trimByPosition ?? true;
  let result = markdown;

  if (trimByPosition) {
    const lines = result.split("\n");
    const total = lines.length;
    const start = Math.floor(total * 0.12);
    const end = Math.floor(total * 0.85);
    result = lines.slice(start, end).join("\n");
  }

  result = result.replace(/!\[[^\]]*]\([^)]*\)\n?/g, "");
  result = result.replace(/^\[.+?]\(.+?\)\s*$/gm, "");
  result = result.replace(/^\*\s+\[.+?]\(.+?\)\s*$/gm, "");
  result = result.replace(/\n{3,}/g, "\n\n");

  return result.trim();
}
