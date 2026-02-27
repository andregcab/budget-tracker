import type { ChartConfig } from '@/components/ui/chart';

export const chartConfig = {
  total: { label: 'Spend', color: 'var(--chart-1)' },
} satisfies ChartConfig;

/** Expanded palette for pie chart — spans full hue range for contrast with many categories */
export const PIE_COLORS = [
  'oklch(0.65 0.18 25)',   // warm red-orange
  'oklch(0.7 0.15 85)',    // amber
  'oklch(0.72 0.16 130)',  // lime-green
  'oklch(0.68 0.16 165)',  // teal
  'oklch(0.62 0.15 200)',  // cyan
  'oklch(0.6 0.14 230)',   // blue
  'oklch(0.58 0.16 265)',  // violet
  'oklch(0.62 0.18 310)',  // magenta
  'oklch(0.65 0.14 350)',  // rose
  'oklch(0.55 0.2 145)',   // deeper green
  'oklch(0.5 0.18 250)',   // deep blue
  'oklch(0.68 0.12 45)',   // gold
  'oklch(0.6 0.14 180)',   // turquoise
  'oklch(0.58 0.15 290)',  // purple
  'oklch(0.7 0.1 200)',    // soft cyan
  'oklch(0.6 0.12 330)',   // pink
];

/** Bar chart: cool (blue) for low values, hot (red) for high. Ratio 0–1. Goes via purple, no yellow/green. */
export function barColorByRatio(ratio: number): string {
  const t = Math.max(0, Math.min(1, ratio));
  const hue = (240 + 145 * t) % 360; // 240 (blue) → 25 (red) via purple/magenta
  const chroma = 0.14 + 0.04 * t;
  const lightness = 0.58 + 0.06 * (1 - t);
  return `oklch(${lightness} ${chroma} ${hue})`;
}
