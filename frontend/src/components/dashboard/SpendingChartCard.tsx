import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Bar, BarChart, Cell, Pie, PieChart, Sector, XAxis, YAxis } from 'recharts';
import { Info } from 'lucide-react';
import { barColorByRatio, chartConfig, PIE_COLORS } from '@/lib/chart-config';
import {
  collapseForPie,
  renderPieLabel,
  renderPieLabelLine,
} from '@/lib/chart-utils';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import type { ChartCategory } from '@/hooks/useDashboardData';

type SpendingChartCardProps = {
  variableCategories: ChartCategory[];
  variableTotal: number;
};

export function SpendingChartCard({
  variableCategories,
  variableTotal,
}: SpendingChartCardProps) {
  const { spendingChartType: chartType, setSpendingChartType } =
    useUserPreferences();
  const [pieActiveIndex, setPieActiveIndex] = useState<
    number | undefined
  >(undefined);

  const handleChartTypeChange = (type: 'bar' | 'pie') => {
    setSpendingChartType(type);
    setPieActiveIndex(undefined);
  };

  const pieData = collapseForPie(variableCategories);
  const pieChartConfig: ChartConfig = (() => {
    const config: ChartConfig = { ...chartConfig };
    pieData.forEach((c, i) => {
      config[c.name] = {
        label: c.name,
        color: PIE_COLORS[i % PIE_COLORS.length],
      };
    });
    return config;
  })();

  if (variableCategories.length === 0) {
    return null;
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center gap-1.5">
          <CardTitle>Spending</CardTitle>
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="inline-flex text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                aria-label="More information"
              >
                <Info className="h-4 w-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-72 text-sm" align="start">
              Groceries, dining, shopping — set budgets in{' '}
              <Link to="/categories" className="underline">
                Categories
              </Link>
              . Over-budget items are highlighted.
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="w-full max-w-[50%] min-w-0 space-y-2">
          <div className="space-y-3">
            {variableCategories.map((c) => {
              const pct =
                c.budget > 0 ? Math.min((c.total / c.budget) * 100, 100) : 0;
              return (
                <div key={c.name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span
                      className={
                        c.over
                          ? 'font-medium text-destructive'
                          : 'font-medium'
                      }
                    >
                      {c.name}
                    </span>
                    <span className="text-muted-foreground">
                      ${c.total.toFixed(2)}
                      {c.budget > 0 && (
                        <>
                          {' '}
                          / ${c.budget.toFixed(2)}
                          <span
                            className={
                              c.over
                                ? 'ml-1 font-medium text-destructive'
                                : 'ml-1 text-[var(--positive)]'
                            }
                          >
                            {c.over ? 'Over' : 'Under'}
                          </span>
                        </>
                      )}
                    </span>
                  </div>
                  {c.budget > 0 && (
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full transition-all ${
                          c.over ? 'bg-destructive' : 'bg-primary'
                        }`}
                        style={{
                          width: `${Math.min(pct, 100)}%`,
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between border-t border-border pt-2 text-sm font-medium">
            <span>Total</span>
            <span>${variableTotal.toFixed(2)}</span>
          </div>
        </div>

        <div className="mt-16 space-y-3 min-w-0 overflow-visible">
          <div className="flex gap-1">
            {(['bar', 'pie'] as const).map((type) => (
              <Button
                key={type}
                variant={chartType === type ? 'secondary' : 'ghost'}
                size="sm"
                className="capitalize"
                onClick={() => handleChartTypeChange(type)}
              >
                {type}
              </Button>
            ))}
          </div>
          <ChartContainer
            config={chartType === 'bar' ? chartConfig : pieChartConfig}
            className="h-[340px] w-full"
          >
            {chartType === 'bar' ? (
              <BarChart
                data={variableCategories as { name: string; total: number }[]}
                margin={{ left: 12, right: 12 }}
              >
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                  {variableCategories.map((entry, index) => {
                    const maxTotal = Math.max(
                      ...variableCategories.map((c) => c.total),
                      1,
                    );
                    const ratio = entry.total / maxTotal;
                    return (
                      <Cell
                        key={index}
                        fill={barColorByRatio(ratio)}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            ) : (
              <PieChart
                margin={{
                  top: 40,
                  right: 80,
                  bottom: 40,
                  left: 80,
                }}
              >
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelKey="name"
                      nameKey="name"
                      formatter={(value) => `$${Number(value).toFixed(2)}`}
                    />
                  }
                />
                <Pie
                  data={pieData}
                  dataKey="total"
                  nameKey="name"
                  innerRadius={0}
                  strokeWidth={0}
                  animationDuration={300}
                  animationEasing="ease-in-out"
                  activeIndex={pieActiveIndex}
                  label={renderPieLabel}
                  labelLine={renderPieLabelLine}
                  activeShape={(props: unknown) => {
                    const p = props as {
                      outerRadius?: number;
                      cx?: number;
                      cy?: number;
                      startAngle?: number;
                      endAngle?: number;
                      [key: string]: unknown;
                    };
                    const { cx = 0, cy = 0 } = p;
                    const midAngle =
                      ((p.startAngle ?? 0) + (p.endAngle ?? 0)) / 2;
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
                            filter:
                              'drop-shadow(0 4px 8px rgba(0,0,0,0.35))',
                          }}
                        />
                      </g>
                    );
                  }}
                  onClick={(_, index) =>
                    setPieActiveIndex(
                      pieActiveIndex === index ? undefined : index,
                    )
                  }
                >
                  {pieData.map((_, index) => (
                    <Cell
                      key={index}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            )}
          </ChartContainer>
          {chartType === 'pie' &&
            pieActiveIndex !== undefined &&
            pieData[pieActiveIndex] && (
              <div
                className="rounded-md border border-border/50 bg-background px-3 py-2 text-sm shadow-sm"
                role="status"
                aria-live="polite"
              >
                <span className="font-medium">
                  {pieData[pieActiveIndex].name}
                </span>
                <span className="ml-2 text-muted-foreground">
                  $
                  {pieData[pieActiveIndex].total.toFixed(2)}
                </span>
                {'_otherCategories' in pieData[pieActiveIndex] &&
                  (pieData[pieActiveIndex] as { _otherCategories?: { name: string }[] })
                    ._otherCategories && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      {(
                        (pieData[pieActiveIndex] as { _otherCategories: { name: string }[] })
                          ._otherCategories
                      )
                        .map((c) => c.name)
                        .join(', ')}
                    </div>
                  )}
                <span className="ml-1 text-xs text-muted-foreground">
                  (tap again to dismiss)
                </span>
              </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
