import * as React from 'react';
import { Sector } from 'recharts';
import {
  getLabelOffset,
  LABEL_OFFSET,
  LINE_BUFFER,
  LINE_GAP_FROM_LABEL,
  polarToCartesian,
  RADIAN,
  SMALL_SLICE_CENTER_PERCENT,
  SMALL_SLICE_NUDGE_PX_PER_PERCENT,
  type RenderPieLabelLineProps,
  type RenderPieLabelProps,
} from '@/lib/chart-utils';

/** Renders the active (hovered/selected) pie slice with a slight offset and shadow */
export function renderPieActiveShape(props: unknown) {
  const p = props as {
    outerRadius?: number;
    cx?: number;
    cy?: number;
    startAngle?: number;
    endAngle?: number;
    [key: string]: unknown;
  };
  const { cx = 0, cy = 0 } = p;
  const midAngle = ((p.startAngle ?? 0) + (p.endAngle ?? 0)) / 2;
  const rad = (midAngle * Math.PI) / 180;
  const slideOutPx = 4;
  const dx = Math.cos(rad) * slideOutPx;
  const dy = -Math.sin(rad) * slideOutPx;
  return (
    <g
      className="pie-active-slice"
      style={
        {
          transformOrigin: `${cx}px ${cy}px`,
          '--slide-dx': `${dx}px`,
          '--slide-dy': `${dy}px`,
        } as React.CSSProperties
      }
    >
      <Sector
        {...p}
        stroke="rgba(0,0,0,0.35)"
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
        style={{
          filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.35))',
        }}
      />
    </g>
  );
}

export function renderPieLabel(props: RenderPieLabelProps) {
  const { cx, cy, midAngle, outerRadius, percent } = props;
  const name = props.name ?? props.payload?.name ?? '';
  const offset = getLabelOffset(percent);
  const labelX =
    cx + (outerRadius + offset) * Math.cos(-midAngle * RADIAN);
  let labelY =
    cy + (outerRadius + offset) * Math.sin(-midAngle * RADIAN);
  if (percent < 0.04) {
    labelY +=
      (percent - SMALL_SLICE_CENTER_PERCENT) *
      SMALL_SLICE_NUDGE_PX_PER_PERCENT;
  }
  const isRight = labelX > cx;
  const pct = (percent * 100).toFixed(1);
  const shortName = name.length > 20 ? `${name.slice(0, 18)}…` : name;

  return (
    <g>
      <text
        x={labelX}
        y={labelY}
        fill="currentColor"
        textAnchor={isRight ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-sm fill-foreground"
      >
        <tspan x={labelX} dy="-0.4em" className="font-medium">
          {shortName}
        </tspan>
        <tspan
          x={labelX}
          dy="1.2em"
          className="fill-muted-foreground"
        >
          {pct}%
        </tspan>
      </text>
    </g>
  );
}
(renderPieLabel as { offsetRadius?: number }).offsetRadius =
  LABEL_OFFSET;

export function renderPieLabelLine(props: RenderPieLabelLineProps) {
  const {
    cx = 0,
    cy = 0,
    midAngle = 0,
    outerRadius = 0,
    percent = 0,
  } = props;
  const bufferedStart = polarToCartesian(
    cx,
    cy,
    outerRadius + LINE_BUFFER,
    midAngle,
  );
  const offset = getLabelOffset(percent);
  const lineEnd = polarToCartesian(
    cx,
    cy,
    outerRadius + offset - LINE_GAP_FROM_LABEL,
    midAngle,
  );
  return (
    <line
      x1={bufferedStart.x}
      y1={bufferedStart.y}
      x2={lineEnd.x}
      y2={lineEnd.y}
      stroke="currentColor"
      strokeWidth={1}
      strokeLinecap="round"
      className="stroke-foreground/70"
    />
  );
}
