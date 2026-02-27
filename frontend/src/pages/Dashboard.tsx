import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useDashboardData } from '@/hooks/useDashboardData';
import { Card, CardContent } from '@/components/ui/card';
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

function getInitialMonth(
  prefs: {
    dashboardMonth: { year: number; month: number } | null;
    dashboardSelectionIsFromPreviousMonth: () => boolean;
  },
  currentYear: number,
  currentMonth: number,
): { year: number; month: number } {
  const stored = prefs.dashboardMonth;
  if (!stored) return { year: currentYear, month: currentMonth };
  if (prefs.dashboardSelectionIsFromPreviousMonth()) {
    return { year: currentYear, month: currentMonth };
  }
  return { year: stored.year, month: stored.month };
}

export function Dashboard() {
  const { user } = useAuth();
  const {
    dashboardMonth,
    setDashboardMonth,
    dashboardSelectionIsFromPreviousMonth,
  } = useUserPreferences();
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const initial = getInitialMonth(
    { dashboardMonth, dashboardSelectionIsFromPreviousMonth },
    currentYear,
    currentMonth,
  );
  const [year, setYear] = useState(initial.year);
  const [month, setMonth] = useState(initial.month);

  useEffect(() => {
    if (!dashboardMonth) return;
    const enteredNewMonth = dashboardSelectionIsFromPreviousMonth();
    const target = enteredNewMonth
      ? { year: currentYear, month: currentMonth }
      : { year: dashboardMonth.year, month: dashboardMonth.month };
    if (enteredNewMonth) setDashboardMonth(currentYear, currentMonth);
    if (year !== target.year || month !== target.month) {
      queueMicrotask(() => {
        setYear(target.year);
        setMonth(target.month);
      });
    }
  }, [
    dashboardMonth,
    dashboardSelectionIsFromPreviousMonth,
    currentYear,
    currentMonth,
    year,
    month,
    setDashboardMonth,
  ]);
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
  const isViewingCurrentMonth =
    year === currentYear && effectiveMonth === currentMonth;
  const hasNoTransactions = (data?.totalSpend ?? 0) === 0;
  const needsTransactionNudge =
    hasNoTransactions &&
    (chartData.length > 0 || fixedCategories.length > 0);
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
          onYearChange={(y) => {
            setYear(y);
            setDashboardMonth(y, month);
          }}
          onMonthChange={(m) => {
            setMonth(m);
            setDashboardMonth(year, m);
          }}
          onJumpToCurrent={() => {
            setYear(currentYear);
            setMonth(currentMonth);
            setDashboardMonth(currentYear, currentMonth);
          }}
          currentYear={currentYear}
          currentMonth={currentMonth}
        />
      </div>

      {data && (
        <SummaryCard
          key={`${year}-${effectiveMonth}`}
          income={data.totalRevenue ?? 0}
          expenses={fixedTotal + variableTotal}
          savings={
            (data.totalRevenue ?? 0) - (fixedTotal + variableTotal)
          }
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
      />

      {data && chartData.length === 0 && (
        <Card className="mt-6 nudge-attention">
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
      {data &&
        isViewingCurrentMonth &&
        needsTransactionNudge &&
        chartData.length > 0 && (
          <Card className="mt-6 nudge-attention">
            <CardContent className="py-4">
              <p className="text-muted-foreground text-center text-sm">
                Add transactions for {monthName} to see your spending.{' '}
                <Link to="/import" className="underline">
                  Import
                </Link>{' '}
                from CSV or add manually in{' '}
                <Link to="/transactions" className="underline">
                  Transactions
                </Link>
                .
              </p>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
