import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

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
            <span className="text-sm font-medium w-20 shrink-0">Income</span>
            <div className="flex-1 min-w-0 h-6 rounded-md overflow-hidden bg-muted/50">
              <div
                className="h-full rounded-md bg-emerald-500/80 dark:bg-emerald-600/80 transition-[width] duration-300 ease-out"
                style={{ width: `${incomePct}%` }}
              />
            </div>
            <div className="flex items-center justify-start gap-1.5 shrink-0 w-[8rem] pl-8">
              {incomeAmountSlot}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium w-20 shrink-0">Expenses</span>
            <div className="flex-1 min-w-0 h-6 rounded-md overflow-hidden bg-muted/50">
              <div
                className="h-full rounded-md bg-amber-600/70 dark:bg-amber-700/70 transition-[width] duration-300 ease-out"
                style={{ width: `${expensesPct}%` }}
              />
            </div>
            <span className="text-sm font-mono tabular-nums shrink-0 w-[8rem] pl-8">
              ${expenses.toFixed(2)}
            </span>
          </div>
        </div>
        {savings !== 0 && (
          <div className="rounded-lg border border-dashed border-border pt-3 pb-3 px-4 flex items-center gap-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {savings >= 0 ? 'Savings' : 'Overspent'}
              </p>
              <p
                className={`text-2xl font-bold ${
                  savings >= 0
                    ? 'text-[var(--positive)]'
                    : 'text-destructive'
                }`}
              >
                ${Math.abs(savings).toFixed(2)}
              </p>
            </div>
            <p className="text-sm text-muted-foreground flex-1">
              {savings >= 0
                ? 'Your income was greater than your expenses this month.'
                : 'Expenses exceeded income this month.'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
