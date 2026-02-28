/** Format amount for display (handles negative as parentheses) */
export function formatAmount(amountStr: string): string {
  const n = parseFloat(amountStr);
  return n >= 0 ? amountStr : `(${Math.abs(n).toFixed(2)})`;
}

/** Get absolute value of amount for calculations */
export function absAmount(amountStr: string): number {
  return Math.abs(parseFloat(amountStr));
}

/** Format transaction date for display (2-digit year). Treats value as calendar date to avoid timezone shifting the day. */
export function formatTransactionDateDisplay(isoOrDateStr: string): string {
  const s = typeof isoOrDateStr === 'string' ? isoOrDateStr.slice(0, 10) : '';
  if (!s || s.length < 10) return '';
  const [y, m, d] = s.split('-').map(Number);
  if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) return s;
  const local = new Date(y, m - 1, d);
  return local.toLocaleDateString(undefined, {
    year: '2-digit',
    month: 'numeric',
    day: 'numeric',
  });
}

/** Format ISO date (YYYY-MM-DD) to MM/DD/YY for input display */
export function formatDateToMMDDYY(iso: string): string {
  if (!iso || iso.length < 10) return '';
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) return iso;
  const yy = y % 100;
  return `${m}/${d}/${yy}`;
}

/** Parse MM/DD/YY (or M/D/YY etc.) to ISO YYYY-MM-DD; returns null if invalid. 2-digit year: 00–29 → 2000–2029, 30–99 → 1930–1999 */
export function parseMMDDYYToISO(s: string): string | null {
  const trimmed = s.trim();
  if (!trimmed) return null;
  const parts = trimmed.split(/[/\-.]/).map((p) => p.trim());
  if (parts.length !== 3) return null;
  let m = parseInt(parts[0], 10);
  let d = parseInt(parts[1], 10);
  let yy = parseInt(parts[2], 10);
  if (Number.isNaN(m) || Number.isNaN(d) || Number.isNaN(yy)) return null;
  if (yy >= 0 && yy <= 99) yy = yy <= 29 ? 2000 + yy : 1900 + yy;
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  const date = new Date(yy, m - 1, d);
  if (date.getFullYear() !== yy || date.getMonth() !== m - 1 || date.getDate() !== d)
    return null;
  const y = date.getFullYear();
  const mm = String(m).padStart(2, '0');
  const dd = String(d).padStart(2, '0');
  return `${y}-${mm}-${dd}`;
}
