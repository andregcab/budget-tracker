/**
 * Parses a comma/semicolon-separated string into trimmed non-empty keywords.
 */
export function parseKeywords(s: string): string[] {
  return s
    .split(/[,;]/)
    .map((k) => k.trim())
    .filter(Boolean);
}
