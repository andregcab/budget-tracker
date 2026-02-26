/**
 * Category matching for CSV imports.
 *
 * Uses normalization + keyword matching only. No manual bank mapping.
 * Keywords come from category definitions (default-categories + user custom).
 *
 * Two data sources:
 * - CSV category column: Bank's pre-categorization (e.g. "Food & Drink")
 * - Description: Merchant/memo (e.g. "STARBUCKS #12345")
 *
 * Both use the same logic: normalize text, then match against category keywords
 * (longest match wins).
 */

/** Normalize text for matching: strip CSV quotes/BOM, lowercase, &→and, collapse whitespace */
export function normalizeForMatch(text: string): string {
  if (!text?.trim()) return '';
  return text
    .replace(/\uFEFF/g, '') // BOM
    .replace(/^["'\s]+|["'\s]+$/g, '') // strip surrounding CSV-style quotes and whitespace
    .toLowerCase()
    .replace(/\s*&\s*/g, ' and ')
    .replace(/\s+/g, ' ')
    .trim();
}

export interface CategoryMatchInput {
  categoryByName: Map<string, string>;
  categoriesWithKeywords: { id: string; keywords: string[] }[];
}

/**
 * Match bank category or description to our category.
 * Uses: exact name match first, then keyword match (longest wins).
 */
export function matchCategory(
  text: string,
  input: CategoryMatchInput,
): string | null {
  const normalized = normalizeForMatch(text);
  if (!normalized) return null;

  // 1. Exact name match (our category names)
  const exactId = input.categoryByName.get(normalized);
  if (exactId) return exactId;

  // 2. Keyword match (normalized, longest wins)
  return matchByKeywords(normalized, input.categoriesWithKeywords);
}

function matchByKeywords(
  normalizedText: string,
  categoriesWithKeywords: { id: string; keywords: string[] }[],
): string | null {
  let best: { categoryId: string; matchLen: number } | null = null;

  for (const cat of categoriesWithKeywords) {
    for (const kw of cat.keywords) {
      const kwNorm = normalizeForMatch(kw);
      if (!kwNorm || kwNorm.length < 2) continue;

      const matches =
        normalizedText.includes(kwNorm) || kwNorm.includes(normalizedText);
      if (matches && (!best || kwNorm.length > best.matchLen)) {
        best = { categoryId: cat.id, matchLen: kwNorm.length };
      }
    }
  }
  return best?.categoryId ?? null;
}
