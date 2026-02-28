export const RADIAN = Math.PI / 180;

/** Max segments to show in pie before collapsing rest into "Other" */
export const PIE_MAX_VISIBLE = 6;

export type ChartCategoryForPie = {
  name: string;
  total: number;
  [key: string]: unknown;
};

/** Collapse small categories into "Other" when there are too many for readable labels */
export function collapseForPie<T extends ChartCategoryForPie>(
  categories: T[],
  maxVisible = PIE_MAX_VISIBLE,
): (T & { _otherCategories?: T[] })[] {
  if (categories.length <= maxVisible) return [...categories];
  const sorted = [...categories].sort((a, b) => b.total - a.total);
  const top = sorted.slice(0, maxVisible);
  const rest = sorted.slice(maxVisible);
  const otherTotal = rest.reduce((sum, c) => sum + c.total, 0);
  if (otherTotal <= 0)
    return top as (T & { _otherCategories?: T[] })[];
  const other = {
    ...rest[0],
    name: 'Other',
    total: otherTotal,
    _otherCategories: rest,
  } as T & { _otherCategories?: T[] };
  return [...top, other];
}

const LABEL_OFFSET_MAX = 88;
const LABEL_OFFSET_MIN = 35; // ~13px connector length (offset - buffer - gap)
const LABEL_OFFSET_MED = 42; // threshold between short and long
/** Curved: 40%+ stays short; 10–40% gentle ramp; under 10% ramps to max length. */
export function getLabelOffset(percent: number): number {
  const p = Math.max(0, Math.min(1, percent));
  if (p >= 0.4) return LABEL_OFFSET_MIN;
  if (p >= 0.1) {
    const t = (p - 0.1) / 0.3; // 0 at 10%, 1 at 40%
    return LABEL_OFFSET_MED + (LABEL_OFFSET_MIN - LABEL_OFFSET_MED) * t;
  }
  const t = p / 0.1; // 0 at 0%, 1 at 10%
  const steep = 1 - t * t; // steeper: reaches max faster as p → 0
  return LABEL_OFFSET_MED + (LABEL_OFFSET_MAX - LABEL_OFFSET_MED) * steep;
}
export const LABEL_OFFSET = LABEL_OFFSET_MAX;
export const LINE_BUFFER = 8;
export const LINE_GAP_FROM_LABEL = 14;
/** Spread small-slice labels around a center so they don't overlap each other or neighbors */
export const SMALL_SLICE_CENTER_PERCENT = 0.0135;
export const SMALL_SLICE_NUDGE_PX_PER_PERCENT = 1500;

export function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angle: number,
): { x: number; y: number } {
  return {
    x: cx + radius * Math.cos(-angle * RADIAN),
    y: cy + radius * Math.sin(-angle * RADIAN),
  };
}

export interface RenderPieLabelProps {
  cx: number;
  cy: number;
  x?: number;
  y?: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
  name?: string;
  payload?: { name?: string };
}

export interface RenderPieLabelLineProps {
  points?: [{ x: number; y: number }, { x: number; y: number }];
  cx?: number;
  cy?: number;
  midAngle?: number;
  outerRadius?: number;
  percent?: number;
}
