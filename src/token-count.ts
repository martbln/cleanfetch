export function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.round(text.length / 4);
}

export function reductionPercent(rawTokens: number, cleanTokens: number): number {
  if (rawTokens <= 0) return 0;
  return Math.round((1 - cleanTokens / rawTokens) * 100);
}
