import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/api/client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  Sector,
  XAxis,
  YAxis,
} from 'recharts';
import { Info, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  getSpendingChartType,
  setSpendingChartType,
} from '@/lib/user-preferences';

type MonthlySummary = {
  year: number;
  month: number;
  totalSpend: number;
  totalRevenue: number;
  savings: number;
  byCategory: {
    id: string;
    name: string;
    total: number;
    budget: number;
    isFixed: boolean;
  }[];
};

async function getMonthlySummary(
  year?: number,
  month?: number,
): Promise<MonthlySummary> {
  const now = new Date();
  const y = year ?? now.getFullYear();
  const m = month ?? now.getMonth() + 1;
  return api(`/analytics/monthly?year=${y}&month=${m}`);
}

async function getRevenueOverride(
  year: number,
  month: number,
): Promise<{ amount: number } | null> {
  return api(`/revenue?year=${year}&month=${month}`);
}

async function upsertRevenueOverride(body: {
  year: number;
  month: number;
  amount: number;
}) {
  return api<{ amount: number }>('/revenue', {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

async function removeRevenueOverride(year: number, month: number) {
  return api(`/revenue?year=${year}&month=${month}`, {
    method: 'DELETE',
  });
}

type AdditionalIncomeItem = {
  id: string;
  amount: number;
  description: string | null;
};

async function getAdditionalIncome(
  year: number,
  month: number,
): Promise<AdditionalIncomeItem[]> {
  return api(`/revenue/additional?year=${year}&month=${month}`);
}

async function createAdditionalIncome(body: {
  year: number;
  month: number;
  amount: number;
  description?: string;
}) {
  return api<AdditionalIncomeItem>('/revenue/additional', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

async function deleteAdditionalIncome(id: string) {
  return api(`/revenue/additional/${id}`, { method: 'DELETE' });
}

type ExpectedFixedItem = {
  id: string;
  categoryId: string;
  categoryName: string;
  amount: number;
};

async function getExpectedFixedExpenses(
  year: number,
  month: number,
): Promise<ExpectedFixedItem[]> {
  return api(`/expected-fixed-expenses?year=${year}&month=${month}`);
}

async function createExpectedFixedExpense(body: {
  year: number;
  month: number;
  categoryId: string;
  amount: number;
}) {
  return api<ExpectedFixedItem>('/expected-fixed-expenses', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

async function deleteExpectedFixedExpense(id: string) {
  return api(`/expected-fixed-expenses/${id}`, { method: 'DELETE' });
}

async function getCategories(): Promise<
  { id: string; name: string; isFixed: boolean }[]
> {
  return api('/categories');
}

const chartConfig = {
  total: { label: 'Spend', color: 'var(--chart-1)' },
} satisfies ChartConfig;

// Fixed palette - same in light/dark, lighter for visibility on light backgrounds
const PIE_COLORS = [
  'oklch(0.68 0.16 165)',
  'oklch(0.65 0.15 185)',
  'oklch(0.62 0.14 205)',
  'oklch(0.6 0.13 225)',
  'oklch(0.62 0.12 250)',
  'oklch(0.65 0.11 275)',
  'oklch(0.7 0.14 170)',
  'oklch(0.6 0.14 195)',
];

const RADIAN = Math.PI / 180;
const LABEL_OFFSET = 44;
const LINE_BUFFER = 8;
const LINE_GAP_FROM_LABEL = 14;

function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angle: number,
) {
  return {
    x: cx + radius * Math.cos(-angle * RADIAN),
    y: cy + radius * Math.sin(-angle * RADIAN),
  };
}

function renderPieLabel(props: {
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
}) {
  const { cx, cy, midAngle, outerRadius, percent } = props;
  const name = props.name ?? props.payload?.name ?? '';
  const labelX = props.x ?? cx + (outerRadius + LABEL_OFFSET) * Math.cos(-midAngle * RADIAN);
  const labelY = props.y ?? cy + (outerRadius + LABEL_OFFSET) * Math.sin(-midAngle * RADIAN);
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
        <tspan x={labelX} dy="1.2em" className="fill-muted-foreground">
          {pct}%
        </tspan>
      </text>
    </g>
  );
}
(renderPieLabel as { offsetRadius?: number }).offsetRadius = LABEL_OFFSET;

function renderPieLabelLine(props: {
  points?: [{ x: number; y: number }, { x: number; y: number }];
  cx?: number;
  cy?: number;
  midAngle?: number;
  outerRadius?: number;
}) {
  const { points = [], cx = 0, cy = 0, midAngle = 0, outerRadius = 0 } = props;
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

export function Dashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [editOpen, setEditOpen] = useState(false);
  const [editAmount, setEditAmount] = useState('');
  const [addAmount, setAddAmount] = useState('');
  const [addDescription, setAddDescription] = useState('');
  const [expectedFixedOpen, setExpectedFixedOpen] = useState(false);
  const [expectedCategoryId, setExpectedCategoryId] = useState('');
  const [expectedAmount, setExpectedAmount] = useState('');
  const [chartType, setChartType] = useState< 'bar' | 'pie'>('bar');

  useEffect(() => {
    if (user?.id) {
      const stored = getSpendingChartType(user.id);
      queueMicrotask(() => setChartType(stored));
    }
  }, [user?.id]);

  const [pieActiveIndex, setPieActiveIndex] = useState<number | undefined>(
    undefined,
  );

  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const maxMonthForYear = year === currentYear ? currentMonth : 12;
  const effectiveMonth = Math.min(month, maxMonthForYear);

  const { data, isLoading } = useQuery({
    queryKey: ['analytics', 'monthly', year, effectiveMonth],
    queryFn: () => getMonthlySummary(year, effectiveMonth),
  });

  const { data: override } = useQuery({
    queryKey: ['revenue', year, effectiveMonth],
    queryFn: () => getRevenueOverride(year, effectiveMonth),
  });

  const { data: additionalIncome = [] } = useQuery({
    queryKey: ['revenue', 'additional', year, effectiveMonth],
    queryFn: () => getAdditionalIncome(year, effectiveMonth),
    enabled: editOpen,
  });

  const { data: expectedFixed = [] } = useQuery({
    queryKey: ['expected-fixed-expenses', year, effectiveMonth],
    queryFn: () => getExpectedFixedExpenses(year, effectiveMonth),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    enabled: expectedFixedOpen,
  });

  const hasOverride = override != null;
  const defaultIncome = user?.monthlyIncome ?? 0;

  const upsertMutation = useMutation({
    mutationFn: upsertRevenueOverride,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['analytics', 'monthly'],
      });
      queryClient.invalidateQueries({ queryKey: ['revenue'] });
      setEditOpen(false);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to save income');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => removeRevenueOverride(year, effectiveMonth),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['analytics', 'monthly'],
      });
      queryClient.invalidateQueries({ queryKey: ['revenue'] });
      setEditOpen(false);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to reset income');
    },
  });

  const addIncomeMutation = useMutation({
    mutationFn: createAdditionalIncome,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['analytics', 'monthly'],
      });
      queryClient.invalidateQueries({ queryKey: ['revenue'] });
      setAddAmount('');
      setAddDescription('');
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to add income');
    },
  });

  const removeAdditionalMutation = useMutation({
    mutationFn: deleteAdditionalIncome,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['analytics', 'monthly'],
      });
      queryClient.invalidateQueries({ queryKey: ['revenue'] });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to remove income');
    },
  });

  const addExpectedFixedMutation = useMutation({
    mutationFn: createExpectedFixedExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['analytics', 'monthly'],
      });
      queryClient.invalidateQueries({
        queryKey: ['expected-fixed-expenses'],
      });
      setExpectedFixedOpen(false);
      setExpectedCategoryId('');
      setExpectedAmount('');
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to add expected expense');
    },
  });

  const removeExpectedFixedMutation = useMutation({
    mutationFn: deleteExpectedFixedExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['analytics', 'monthly'],
      });
      queryClient.invalidateQueries({
        queryKey: ['expected-fixed-expenses'],
      });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to remove expected expense');
    },
  });

  const handleChartTypeChange = (type: 'bar' | 'pie') => {
    setChartType(type);
    if (user?.id) setSpendingChartType(user.id, type);
    setPieActiveIndex(undefined);
  };

  const handleEditOpen = (open: boolean) => {
    setEditOpen(open);
    if (open) {
      setEditAmount(
        hasOverride
          ? String(override.amount)
          : String(defaultIncome || ''),
      );
      setAddAmount('');
      setAddDescription('');
    }
  };

  const handleAddAdditional = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(addAmount);
    if (isNaN(amt) || amt <= 0) return;
    addIncomeMutation.mutate({
      year,
      month: effectiveMonth,
      amount: amt,
      description: addDescription.trim() || undefined,
    });
  };

  const handleSaveOverride = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(editAmount);
    if (isNaN(amt) || amt < 0) return;
    upsertMutation.mutate({
      year,
      month: effectiveMonth,
      amount: amt,
    });
  };

  const handleUseDefault = () => {
    deleteMutation.mutate();
  };

  const handleAddExpectedFixed = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(expectedAmount);
    if (isNaN(amt) || amt <= 0 || !expectedCategoryId) return;
    addExpectedFixedMutation.mutate({
      year,
      month: effectiveMonth,
      categoryId: expectedCategoryId,
      amount: amt,
    });
  };

  const monthName = new Date(year, effectiveMonth - 1).toLocaleString(
    'default',
    {
      month: 'long',
    },
  );

  const availableYears = [
    currentYear,
    currentYear - 1,
    currentYear - 2,
  ];
  const availableMonths =
    year === currentYear
      ? Array.from({ length: currentMonth }, (_, i) => i + 1)
      : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  const handleYearChange = (v: string) => {
    const newYear = parseInt(v, 10);
    setYear(newYear);
    const maxMonth = newYear === currentYear ? currentMonth : 12;
    if (month > maxMonth) setMonth(maxMonth);
  };

  const chartData =
    data?.byCategory.map((c) => ({
      id: c.id,
      name: c.name,
      total: c.total,
      budget: c.budget,
      isFixed: c.isFixed,
      over: c.budget > 0 && c.total > c.budget,
    })) ?? [];

  const variableCategories = chartData.filter((c) => !c.isFixed);

  const pieChartConfig: ChartConfig = (() => {
    const config: ChartConfig = { ...chartConfig };
    variableCategories.forEach((c, i) => {
      config[c.name] = {
        label: c.name,
        color: PIE_COLORS[i % PIE_COLORS.length],
      };
    });
    return config;
  })();

  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Loading...</p>
      </div>
    );
  }

  const expectedByCategoryId = Object.fromEntries(
    expectedFixed.map((e) => [e.categoryId, e]),
  );
  const fixedCategoriesForPicker = categories.filter(
    (c) => c.isFixed,
  );

  // Fixed categories from analytics (actual transactions + budgets only).
  // Merge in expected-only categories so they show in the fixed section.
  const fixedFromChart = chartData.filter((c) => c.isFixed);
  const fixedCategories = [...fixedFromChart];
  for (const exp of expectedFixed) {
    if (!fixedCategories.some((c) => c.id === exp.categoryId)) {
      fixedCategories.push({
        id: exp.categoryId,
        name: exp.categoryName,
        total: exp.amount,
        budget: exp.amount,
        isFixed: true,
        over: false,
      });
    }
  }

  const fixedTotal = fixedCategories.reduce(
    (sum, c) => sum + c.total,
    0,
  );
  const variableTotal = variableCategories.reduce(
    (sum, c) => sum + c.total,
    0,
  );

  return (
    <div>
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-muted-foreground mt-1">
        Spending and savings overview for {monthName} {year}.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Select
          value={String(effectiveMonth)}
          onValueChange={(v) => setMonth(parseInt(v, 10))}
        >
          <SelectTrigger className="h-9 w-full sm:w-[140px] bg-background text-foreground">
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            {availableMonths.map((m) => (
              <SelectItem key={m} value={String(m)}>
                {new Date(2000, m - 1).toLocaleString('default', {
                  month: 'long',
                })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={String(year)} onValueChange={handleYearChange}>
          <SelectTrigger className="h-9 w-full sm:w-[100px] bg-background text-foreground">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            {availableYears.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary: Income vs Expenses */}
      {data && (() => {
        const income = data.totalRevenue ?? 0;
        const expenses = data.totalSpend ?? 0;
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
                    className="h-full rounded-md bg-emerald-500/80 dark:bg-emerald-600/80 transition-all"
                    style={{ width: `${incomePct}%` }}
                  />
                </div>
                <div className="flex items-center justify-start gap-1.5 shrink-0 w-[8rem] pl-8">
                  <Dialog open={editOpen} onOpenChange={handleEditOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-auto min-w-0 p-0 font-mono text-sm tabular-nums ${
                          hasOverride
                            ? 'text-primary'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        ${income.toFixed(2)}
                        <Pencil className="ml-1 h-3.5 w-3.5 opacity-70" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="text-foreground">
                      <form onSubmit={handleSaveOverride}>
                        <DialogHeader>
                          <DialogTitle>
                            Income for {monthName} {year}
                          </DialogTitle>
                        </DialogHeader>
                        <p className="text-muted-foreground text-sm mt-2">
                          {defaultIncome > 0
                            ? `Your default is $${defaultIncome.toFixed(2)}/month. Override below if different this month.`
                            : 'Enter an amount for this month.'}
                        </p>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="amount">Base income</Label>
                            <Input
                              id="amount"
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              value={editAmount}
                              onChange={(e) => setEditAmount(e.target.value)}
                            />
                          </div>
                          {additionalIncome.length > 0 && (
                            <div className="space-y-2">
                              <Label>Additional income</Label>
                              <ul className="space-y-1.5 text-sm">
                                {additionalIncome.map((item) => (
                                  <li
                                    key={item.id}
                                    className="flex items-center justify-between gap-2 rounded-md border border-border bg-muted/30 px-2 py-1.5"
                                  >
                                    <span>
                                      {item.description || 'Other'}: $
                                      {item.amount.toFixed(2)}
                                    </span>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                      onClick={() =>
                                        removeAdditionalMutation.mutate(
                                          item.id,
                                        )
                                      }
                                      disabled={
                                        removeAdditionalMutation.isPending
                                      }
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          <div className="space-y-2">
                            <Label>Add extra income</Label>
                            <form
                              onSubmit={handleAddAdditional}
                              className="flex flex-wrap gap-2 items-center"
                            >
                              <Input
                                type="text"
                                placeholder="e.g. Sold item, Birthday Money"
                                value={addDescription}
                                onChange={(e) =>
                                  setAddDescription(e.target.value)
                                }
                                className="flex-1 min-w-[200px]"
                              />
                              <Input
                                type="number"
                                step="0.01"
                                min="0.01"
                                placeholder="Amount"
                                value={addAmount}
                                onChange={(e) => setAddAmount(e.target.value)}
                                className="w-[100px]"
                              />
                              <Button
                                type="submit"
                                variant="outline"
                                disabled={
                                  addIncomeMutation.isPending ||
                                  !addAmount ||
                                  parseFloat(addAmount) <= 0
                                }
                              >
                                <Plus className="mr-1 h-3.5 w-3.5" />
                                Add
                              </Button>
                            </form>
                          </div>
                        </div>
                        <DialogFooter className="gap-2 sm:gap-0">
                          {hasOverride && (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handleUseDefault}
                              disabled={deleteMutation.isPending}
                            >
                              Use default
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setEditOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={
                              upsertMutation.isPending ||
                              editAmount === '' ||
                              isNaN(parseFloat(editAmount)) ||
                              parseFloat(editAmount) < 0
                            }
                          >
                            {upsertMutation.isPending ? 'Saving...' : 'Save'}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                  {hasOverride && (
                    <span className="text-muted-foreground text-xs">
                      (override)
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium w-20 shrink-0">
                  Expenses
                </span>
                <div className="flex-1 min-w-0 h-6 rounded-md overflow-hidden bg-muted/50">
                  <div
                    className="h-full rounded-md bg-amber-600/70 dark:bg-amber-700/70 transition-all"
                    style={{ width: `${expensesPct}%` }}
                  />
                </div>
                <span className="text-sm font-mono tabular-nums shrink-0 w-[8rem] pl-8">
                  ${expenses.toFixed(2)}
                </span>
              </div>
            </div>
            {(data.savings ?? 0) !== 0 && (
              <div className="rounded-lg border border-dashed border-border pt-3 pb-3 px-4 flex items-center gap-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {data.savings >= 0 ? 'Savings' : 'Overspent'}
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      data.savings >= 0
                        ? 'text-[var(--positive)]'
                        : 'text-destructive'
                    }`}
                  >
                    ${Math.abs(data.savings).toFixed(2)}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground flex-1">
                  {data.savings >= 0
                    ? 'Your income was greater than your expenses this month.'
                    : 'Expenses exceeded income this month.'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        );
      })()}

      {/* Fixed bills section - compact */}
      {(fixedCategories.length > 0 || expectedFixed.length > 0) && (
        <Card className="mt-6">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <div>
                <CardTitle className="text-base">
                  Fixed bills this month
                </CardTitle>
                <p className="text-muted-foreground text-sm">
                  Rent, subscriptions, insurance — predictable costs
                </p>
              </div>
              <Dialog
                open={expectedFixedOpen}
                onOpenChange={(o) => {
                  setExpectedFixedOpen(o);
                  if (!o) {
                    setExpectedCategoryId('');
                    setExpectedAmount('');
                  }
                }}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add expected
                  </Button>
                </DialogTrigger>
                <DialogContent className="text-foreground">
                  <form onSubmit={handleAddExpectedFixed}>
                    <DialogHeader>
                      <DialogTitle>
                        Add expected fixed expense
                      </DialogTitle>
                    </DialogHeader>
                    <p className="text-muted-foreground text-sm mt-2">
                      For expenses paid from accounts you don&apos;t
                      track (e.g. rent). Add a fixed category in{' '}
                      <Link
                        to="/categories"
                        className="underline"
                        onClick={() => setExpectedFixedOpen(false)}
                      >
                        Categories
                      </Link>{' '}
                      first if needed.
                    </p>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="expected-category">
                          Category
                        </Label>
                        {fixedCategoriesForPicker.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            No fixed categories yet. Create one (e.g.
                            Rent) in{' '}
                            <Link
                              to="/categories"
                              className="underline"
                              onClick={() =>
                                setExpectedFixedOpen(false)
                              }
                            >
                              Categories
                            </Link>{' '}
                            and mark it as fixed.
                          </p>
                        ) : (
                          <Select
                            value={expectedCategoryId}
                            onValueChange={setExpectedCategoryId}
                          >
                            <SelectTrigger
                              id="expected-category"
                              className="bg-background text-foreground"
                            >
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {fixedCategoriesForPicker.map((cat) => (
                                <SelectItem
                                  key={cat.id}
                                  value={cat.id}
                                  className="text-foreground"
                                >
                                  {cat.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="expected-amount">
                          Amount
                        </Label>
                        <Input
                          id="expected-amount"
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={expectedAmount}
                          onChange={(e) =>
                            setExpectedAmount(e.target.value)
                          }
                          className="bg-background text-foreground"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setExpectedFixedOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={
                          addExpectedFixedMutation.isPending ||
                          !expectedCategoryId ||
                          !expectedAmount ||
                          parseFloat(expectedAmount) <= 0
                        }
                      >
                        Add
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              {fixedCategories.map((c) => {
                const expected = expectedByCategoryId[c.id];
                return (
                  <div
                    key={c.id}
                    className="flex items-center justify-between text-sm group"
                  >
                    <span className="text-muted-foreground">
                      {c.name}
                    </span>
                    <span className="flex items-center gap-2">
                      ${c.total.toFixed(2)}
                      {expected && (
                        <span className="text-muted-foreground text-xs">
                          (expected)
                        </span>
                      )}
                      {c.budget > 0 && !expected && (
                        <span className="text-muted-foreground ml-1">
                          / ${c.budget.toFixed(2)} expected
                        </span>
                      )}
                      {expected && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() =>
                            removeExpectedFixedMutation.mutate(
                              expected.id,
                            )
                          }
                          disabled={
                            removeExpectedFixedMutation.isPending
                          }
                          title="Remove expected expense"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </span>
                  </div>
                );
              })}
              <div className="flex items-center justify-between border-t border-border pt-2 mt-2 font-medium">
                <span>Total fixed</span>
                <span>${fixedTotal.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Variable spending section - main content */}
      {variableCategories.length > 0 && (
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
                            style={{ width: `${Math.min(pct, 100)}%` }}
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

            {variableCategories.length > 0 && (
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
                      data={variableCategories}
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
                      <Bar
                        dataKey="total"
                        fill="var(--color-total)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  ) : (
                    <PieChart margin={{ top: 40, right: 80, bottom: 40, left: 80 }}>
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            labelKey="name"
                            nameKey="name"
                            formatter={(value) =>
                              `$${Number(value).toFixed(2)}`
                            }
                          />
                        }
                      />
                      <Pie
                        data={variableCategories}
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
                              style={{
                                transformOrigin: `${cx}px ${cy}px`,
                                '--slide-dx': `${dx}px`,
                                '--slide-dy': `${dy}px`,
                              } as React.CSSProperties}
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
                        {variableCategories.map((_, index) => (
                          <Cell
                            key={index}
                            fill={
                              PIE_COLORS[
                                index % PIE_COLORS.length
                              ]
                            }
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  )}
                </ChartContainer>
                {chartType === 'pie' &&
                  pieActiveIndex !== undefined &&
                  variableCategories[pieActiveIndex] && (
                    <div
                      className="rounded-md border border-border/50 bg-background px-3 py-2 text-sm shadow-sm"
                      role="status"
                      aria-live="polite"
                    >
                      <span className="font-medium">
                        {variableCategories[pieActiveIndex].name}
                      </span>
                      <span className="ml-2 text-muted-foreground">
                        $
                        {variableCategories[
                          pieActiveIndex
                        ].total.toFixed(2)}
                      </span>
                      <span className="ml-1 text-xs text-muted-foreground">
                        (tap again to dismiss)
                      </span>
                    </div>
                  )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

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
