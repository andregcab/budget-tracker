import type { ChartConfig } from '@/components/ui/chart';

export const chartConfig = {
  total: { label: 'Spend', color: 'var(--chart-1)' },
} satisfies ChartConfig;

export const PIE_COLORS = [
  'oklch(0.68 0.16 165)',
  'oklch(0.65 0.15 185)',
  'oklch(0.62 0.14 205)',
  'oklch(0.6 0.13 225)',
  'oklch(0.62 0.12 250)',
  'oklch(0.65 0.11 275)',
  'oklch(0.7 0.14 170)',
  'oklch(0.6 0.14 195)',
];
