import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bar, BarChart, XAxis, YAxis } from "recharts";
import { Pencil } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  month?: number
): Promise<MonthlySummary> {
  const now = new Date();
  const y = year ?? now.getFullYear();
  const m = month ?? now.getMonth() + 1;
  return api(`/analytics/monthly?year=${y}&month=${m}`);
}

async function getRevenueOverride(
  year: number,
  month: number
): Promise<{ amount: number } | null> {
  return api(`/revenue?year=${year}&month=${month}`);
}

async function upsertRevenueOverride(body: {
  year: number;
  month: number;
  amount: number;
}) {
  return api<{ amount: number }>("/revenue", {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

async function removeRevenueOverride(year: number, month: number) {
  return api(`/revenue?year=${year}&month=${month}`, { method: "DELETE" });
}

const chartConfig = {
  total: { label: "Spend", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function Dashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [editOpen, setEditOpen] = useState(false);
  const [editAmount, setEditAmount] = useState("");

  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const maxMonthForYear = year === currentYear ? currentMonth : 12;
  const effectiveMonth = Math.min(month, maxMonthForYear);

  const { data, isLoading } = useQuery({
    queryKey: ["analytics", "monthly", year, effectiveMonth],
    queryFn: () => getMonthlySummary(year, effectiveMonth),
  });

  const { data: override } = useQuery({
    queryKey: ["revenue", year, effectiveMonth],
    queryFn: () => getRevenueOverride(year, effectiveMonth),
  });

  const hasOverride = override != null;
  const defaultIncome = user?.monthlyIncome ?? 0;

  const upsertMutation = useMutation({
    mutationFn: upsertRevenueOverride,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["analytics", "monthly"] });
      queryClient.invalidateQueries({ queryKey: ["revenue"] });
      setEditOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => removeRevenueOverride(year, effectiveMonth),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["analytics", "monthly"] });
      queryClient.invalidateQueries({ queryKey: ["revenue"] });
      setEditOpen(false);
    },
  });

  const handleEditOpen = (open: boolean) => {
    setEditOpen(open);
    if (open) {
      setEditAmount(
        hasOverride ? String(override.amount) : String(defaultIncome || "")
      );
    }
  };

  const handleSaveOverride = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(editAmount);
    if (isNaN(amt) || amt < 0) return;
    upsertMutation.mutate({ year, month: effectiveMonth, amount: amt });
  };

  const handleUseDefault = () => {
    deleteMutation.mutate();
  };

  const monthName = new Date(year, effectiveMonth - 1).toLocaleString("default", {
    month: "long",
  });

  const availableYears = [currentYear, currentYear - 1, currentYear - 2];
  const availableMonths =
    year === currentYear
      ? Array.from({ length: currentMonth }, (_, i) => i + 1)
      : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  useEffect(() => {
    if (month > maxMonthForYear) {
      setMonth(maxMonthForYear);
    }
  }, [year, month, maxMonthForYear]);

  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Loading...</p>
      </div>
    );
  }

  const chartData =
    data?.byCategory.map((c) => ({
      name: c.name,
      total: c.total,
      budget: c.budget,
      isFixed: c.isFixed,
      over: c.budget > 0 && c.total > c.budget,
    })) ?? [];

  const fixedCategories = chartData.filter((c) => c.isFixed);
  const variableCategories = chartData.filter((c) => !c.isFixed);
  const fixedTotal = fixedCategories.reduce((sum, c) => sum + c.total, 0);
  const variableTotal = variableCategories.reduce((sum, c) => sum + c.total, 0);

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
          <SelectTrigger className="h-9 w-[140px] bg-background text-foreground">
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            {availableMonths.map((m) => (
              <SelectItem key={m} value={String(m)}>
                {new Date(2000, m - 1).toLocaleString("default", {
                  month: "long",
                })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={String(year)}
          onValueChange={(v) => setYear(parseInt(v, 10))}
        >
          <SelectTrigger className="h-9 w-[100px] bg-background text-foreground">
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

      {/* Hero: Savings + compact Income */}
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-muted-foreground text-sm font-medium">
            Savings this month
          </p>
          <p
            className={`text-4xl font-bold sm:text-5xl ${
              (data?.savings ?? 0) >= 0
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            ${data?.savings?.toFixed(2) ?? "0.00"}
          </p>
          <p className="text-muted-foreground mt-1 text-sm">
            Total spend: ${data?.totalSpend?.toFixed(2) ?? "0.00"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">Income:</span>
          <Dialog open={editOpen} onOpenChange={handleEditOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={`h-auto p-0 font-medium ${
                  hasOverride
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                ${data?.totalRevenue?.toFixed(2) ?? "0.00"}
                <Pencil className="ml-1 h-3.5 w-3.5 opacity-70" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSaveOverride}>
                <DialogHeader>
                  <DialogTitle>
                    Override revenue for {monthName} {year}
                  </DialogTitle>
                </DialogHeader>
                <p className="text-muted-foreground text-sm mt-2">
                  {defaultIncome > 0
                    ? `Your default is $${defaultIncome.toFixed(2)}/month. Enter a different amount to override for this month.`
                    : "Set your default monthly income in Settings first, or enter an amount for this month."}
                </p>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="amount">Amount</Label>
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
                </div>
                <DialogFooter>
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
                      editAmount === "" ||
                      isNaN(parseFloat(editAmount)) ||
                      parseFloat(editAmount) < 0
                    }
                  >
                    {upsertMutation.isPending ? "Saving..." : "Save"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          {hasOverride && (
            <span className="text-muted-foreground text-xs">(override)</span>
          )}
        </div>
      </div>

      {!user?.monthlyIncome && (
        <Card className="mt-4 border-amber-500/50 bg-amber-500/5">
          <CardContent className="py-4">
            <p className="text-sm">
              Set your default monthly income in{" "}
              <Link to="/settings" className="underline font-medium">
                Settings
              </Link>{" "}
              to see savings. You can override it for specific months by
              clicking the income amount above.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Fixed bills section - compact */}
      {fixedCategories.length > 0 && (
        <Card className="mt-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Fixed bills this month</CardTitle>
            <p className="text-muted-foreground text-sm">
              Rent, subscriptions, insurance — predictable costs
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              {fixedCategories.map((c) => (
                <div
                  key={c.name}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-muted-foreground">{c.name}</span>
                  <span>
                    ${c.total.toFixed(2)}
                    {c.budget > 0 && (
                      <span className="text-muted-foreground ml-1">
                        / ${c.budget.toFixed(2)} expected
                      </span>
                    )}
                  </span>
                </div>
              ))}
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
            <CardTitle>Variable spending</CardTitle>
            <p className="text-muted-foreground text-sm">
              Groceries, dining, shopping — set budgets in{" "}
              <Link to="/categories" className="underline">
                Categories
              </Link>
              . Over-budget items are highlighted.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
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
                            ? "font-medium text-red-600 dark:text-red-400"
                            : "font-medium"
                        }
                      >
                        {c.name}
                      </span>
                      <span className="text-muted-foreground">
                        ${c.total.toFixed(2)}
                        {c.budget > 0 && (
                          <>
                            {" "}
                            / ${c.budget.toFixed(2)}
                            <span
                              className={
                                c.over
                                  ? "ml-1 font-medium text-red-600 dark:text-red-400"
                                  : "ml-1 text-green-600 dark:text-green-400"
                              }
                            >
                              {c.over ? "Over" : "Under"}
                            </span>
                          </>
                        )}
                      </span>
                    </div>
                    {c.budget > 0 && (
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full transition-all ${
                            c.over
                              ? "bg-red-500 dark:bg-red-400"
                              : "bg-primary"
                          }`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between border-t border-border pt-3 text-sm font-medium">
              <span>Total variable</span>
              <span>${variableTotal.toFixed(2)}</span>
            </div>

            {variableCategories.length > 0 && (
              <ChartContainer
                config={chartConfig}
                className="h-[260px] w-full"
              >
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
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                  <Bar
                    dataKey="total"
                    fill="var(--color-total)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      )}

      {data && chartData.length === 0 && (
        <Card className="mt-6">
          <CardContent className="py-8">
            <p className="text-muted-foreground text-center">
              No spending data yet. Import a CSV from the{" "}
              <Link to="/import" className="underline">Import</Link> page to get
              started.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
