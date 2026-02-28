import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { formatCurrency } from '@/lib/transaction-utils';

type SummaryCardProps = {
  income: number;
  expenses: number;
  savings: number;
  incomeAmountSlot: React.ReactNode;
};

export function SummaryCard({
  income,
  expenses,
  savings,
  incomeAmountSlot,
}: SummaryCardProps) {
  const maxVal = Math.max(income, expenses, 1);
  const incomePct = (income / maxVal) * 100;
  const expensesPct = (expenses / maxVal) * 100;

  return (
    <Card className="mt-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium w-20 shrink-0">
              Income
            </span>
            <div className="flex-1 min-w-0 h-6 rounded-md overflow-hidden bg-muted/50">
              <div
                className="h-full rounded-md bg-[oklch(0.76_0.19_145)]/90 dark:bg-[oklch(0.78_0.19_145)]/90 transition-[width] duration-300 ease-out"
                style={{ width: `${incomePct}%` }}
              />
            </div>
            <div className="flex items-center justify-start gap-1.5 shrink-0 w-[8rem] pl-8">
              {incomeAmountSlot}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium w-20 shrink-0">
              Expenses
            </span>
            <div className="flex-1 min-w-0 h-6 rounded-md overflow-hidden bg-muted/50">
              <div
                className="h-full rounded-md bg-[oklch(0.78_0.17_55)]/90 dark:bg-[oklch(0.80_0.16_55)]/90 transition-[width] duration-300 ease-out"
                style={{ width: `${expensesPct}%` }}
              />
            </div>
            <span className="text-sm font-mono tabular-nums shrink-0 w-[8rem] pl-8">
              {formatCurrency(expenses)}
            </span>
          </div>
        </div>
        {savings !== 0 && (
          <div className="rounded-lg border border-dashed border-border pt-3 pb-2 px-4 flex items-end gap-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {savings >= 0 ? 'Savings' : 'Overspent'}
              </p>
              <p
                className={`text-2xl font-bold ${
                  savings >= 0
                    ? 'text-[oklch(0.52_0.2_145)] dark:text-[oklch(0.62_0.2_145)]'
                    : 'text-destructive'
                }`}
              >
                {formatCurrency(Math.abs(savings))}
              </p>
            </div>
            <p className="text-sm text-muted-foreground mb-1 flex-1">
              {savings >= 0
                ? 'You saved money this month! 🎉'
                : 'Oops, your expenses exceeded your income this month.'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
