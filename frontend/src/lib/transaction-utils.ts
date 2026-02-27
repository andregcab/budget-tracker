/** Format amount for display (handles negative as parentheses) */
export function formatAmount(amountStr: string): string {
  const n = parseFloat(amountStr);
  return n >= 0 ? amountStr : `(${Math.abs(n).toFixed(2)})`;
}

/** Get absolute value of amount for calculations */
export function absAmount(amountStr: string): number {
  return Math.abs(parseFloat(amountStr));
}
