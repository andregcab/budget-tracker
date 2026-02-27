const RADIAN = Math.PI / 180;
export const LABEL_OFFSET = 44;
const LINE_BUFFER = 8;
const LINE_GAP_FROM_LABEL = 14;

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

export function renderPieLabel(props: RenderPieLabelProps) {
  const { cx, cy, midAngle, outerRadius, percent } = props;
  const name = props.name ?? props.payload?.name ?? '';
  const labelX =
    props.x ??
    cx + (outerRadius + LABEL_OFFSET) * Math.cos(-midAngle * RADIAN);
  const labelY =
    props.y ??
    cy + (outerRadius + LABEL_OFFSET) * Math.sin(-midAngle * RADIAN);
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

export interface RenderPieLabelLineProps {
  points?: [{ x: number; y: number }, { x: number; y: number }];
  cx?: number;
  cy?: number;
  midAngle?: number;
  outerRadius?: number;
}

export function renderPieLabelLine(props: RenderPieLabelLineProps) {
  const {
    points = [],
    cx = 0,
    cy = 0,
    midAngle = 0,
    outerRadius = 0,
  } = props;
  const [, end] = points;
  const bufferedStart = polarToCartesian(
    cx,
    cy,
    outerRadius + LINE_BUFFER,
    midAngle,
  );
  let lineEndX = end?.x ?? bufferedStart.x;
  let lineEndY = end?.y ?? bufferedStart.y;
  if (end) {
    const dx = end.x - cx;
    const dy = end.y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const newDist = Math.max(0, dist - LINE_GAP_FROM_LABEL);
    lineEndX = cx + (dx / dist) * newDist;
    lineEndY = cy + (dy / dist) * newDist;
  }
  return (
    <line
      x1={bufferedStart.x}
      y1={bufferedStart.y}
      x2={lineEndX}
      y2={lineEndY}
      stroke="#475569"
      strokeWidth={1}
      strokeLinecap="round"
    />
  );
}
