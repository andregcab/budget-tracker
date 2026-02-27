import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardData } from '@/hooks/useDashboardData';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { MonthYearPicker } from '@/components/MonthYearPicker';
import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { IncomeEditDialog } from '@/components/dashboard/IncomeEditDialog';
import { ExpectedFixedCard } from '@/components/dashboard/ExpectedFixedCard';
import { SpendingChartCard } from '@/components/dashboard/SpendingChartCard';

const INVALIDATE_KEYS = [
  'analytics',
  'revenue',
  'expected-fixed-expenses',
];

export function Dashboard() {
  const { user } = useAuth();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const maxMonthForYear = year === currentYear ? currentMonth : 12;
  const effectiveMonth = Math.min(month, maxMonthForYear);

  const {
    data,
    override,
    isLoading,
    chartData,
    variableCategories,
    fixedCategories,
    fixedTotal,
    variableTotal,
    expectedFixed,
    expectedByCategoryId,
    fixedCategoriesForPicker,
  } = useDashboardData(year, effectiveMonth);

  const hasOverride = override != null;
  const defaultIncome = user?.monthlyIncome ?? 0;
  const monthName = new Date(year, effectiveMonth - 1).toLocaleString(
    'default',
    { month: 'long' },
  );

  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <LoadingSpinner className="mt-4" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-muted-foreground mt-1">
        Spending and savings overview for {monthName} {year}.
      </p>

      <div className="mt-4">
        <MonthYearPicker
          year={year}
          month={effectiveMonth}
          onYearChange={setYear}
          onMonthChange={setMonth}
          currentYear={currentYear}
          currentMonth={currentMonth}
        />
      </div>

      {data && (
        <SummaryCard
          income={data.totalRevenue ?? 0}
          expenses={data.totalSpend ?? 0}
          savings={data.savings ?? 0}
          incomeAmountSlot={
            <IncomeEditDialog
              year={year}
              month={effectiveMonth}
              monthName={monthName}
              defaultIncome={defaultIncome}
              hasOverride={hasOverride}
              overrideAmount={override?.amount ?? null}
              invalidateKeys={INVALIDATE_KEYS}
            />
          }
        />
      )}

      <ExpectedFixedCard
        year={year}
        month={effectiveMonth}
        fixedCategories={fixedCategories}
        expectedFixed={expectedFixed}
        expectedByCategoryId={expectedByCategoryId}
        fixedCategoriesForPicker={fixedCategoriesForPicker}
        fixedTotal={fixedTotal}
        invalidateKeys={INVALIDATE_KEYS}
      />

      <SpendingChartCard
        variableCategories={variableCategories}
        variableTotal={variableTotal}
        userId={user?.id}
      />

      {data && chartData.length === 0 && (
        <Card className="mt-6">
          <CardContent className="py-8">
            <p className="text-muted-foreground text-center">
              No spending data yet. Import a CSV from the{' '}
              <Link to="/import" className="underline">
                Import
              </Link>{' '}
              page to get started.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
