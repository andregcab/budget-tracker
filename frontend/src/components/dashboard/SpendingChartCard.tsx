import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { CardTitleWithInfo } from '@/components/ui/card-title-with-info';
import { Button } from '@/components/ui/button';
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from 'recharts';
import {
  barColorByRatio,
  chartConfig,
  PIE_COLORS,
} from '@/lib/chart-config';
import { collapseForPie } from '@/lib/chart-utils';
import { PieSelectedSliceSummary } from '@/lib/chart-pie-labels';
import {
  renderPieActiveShape,
  renderPieLabel,
  renderPieLabelLine,
} from '@/lib/chart-pie-renderers';
import { formatCurrency } from '@/lib/transaction-utils';
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
        <CardTitleWithInfo
          title="Spending"
          infoContent={
            <>
              Groceries, dining, shopping — set budgets in{' '}
              <Link to="/categories" className="underline">
                Categories
              </Link>
              . Over-budget items are highlighted.
            </>
          }
        />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="w-full max-w-[50%] min-w-0 space-y-2">
          <div className="space-y-3">
            {variableCategories.map((c) => {
              const pct =
                c.budget > 0
                  ? Math.min((c.total / c.budget) * 100, 100)
                  : 0;
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
                      {formatCurrency(c.total)}
                      {c.budget > 0 && (
                        <>
                          {' '}
                          / {formatCurrency(c.budget)}
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
            <span>{formatCurrency(variableTotal)}</span>
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
            config={
              chartType === 'bar' ? chartConfig : pieChartConfig
            }
            className="h-[340px] w-full"
          >
            {chartType === 'bar' ? (
              <BarChart
                data={
                  variableCategories as {
                    name: string;
                    total: number;
                  }[]
                }
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
                  right: 100,
                  bottom: 40,
                  left: 100,
                }}
              >
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelKey="name"
                      nameKey="name"
                      formatter={(value) =>
                        formatCurrency(Number(value))
                      }
                    />
                  }
                />
                <Pie
                  data={pieData}
                  dataKey="total"
                  nameKey="name"
                  innerRadius={0}
                  stroke="var(--border)"
                  strokeWidth={1.5}
                  animationDuration={300}
                  animationEasing="ease-in-out"
                  activeIndex={pieActiveIndex}
                  label={renderPieLabel}
                  labelLine={renderPieLabelLine}
                  activeShape={renderPieActiveShape}
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
              <PieSelectedSliceSummary
                slice={
                  pieData[pieActiveIndex] as {
                    name: string;
                    total: number;
                    _otherCategories?: { name: string }[];
                  }
                }
              />
            )}
        </div>
      </CardContent>
    </Card>
  );
}
