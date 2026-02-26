import { useState } from "react";
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

  const { data, isLoading } = useQuery({
    queryKey: ["analytics", "monthly", year, month],
    queryFn: () => getMonthlySummary(year, month),
  });

  const { data: override } = useQuery({
    queryKey: ["revenue", year, month],
    queryFn: () => getRevenueOverride(year, month),
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
    mutationFn: () => removeRevenueOverride(year, month),
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
    upsertMutation.mutate({ year, month, amount: amt });
  };

  const handleUseDefault = () => {
    deleteMutation.mutate();
  };

  const monthName = new Date(year, month - 1).toLocaleString("default", {
    month: "long",
  });

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

  const fixedTotal =
    chartData
      .filter((c) => c.isFixed)
      .reduce((sum, c) => sum + c.total, 0) ?? 0;
  const variableTotal =
    chartData
      .filter((c) => !c.isFixed)
      .reduce((sum, c) => sum + c.total, 0) ?? 0;

  return (
    <div>
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-muted-foreground mt-1">
        Spending and savings overview for {monthName} {year}.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <select
          value={month}
          onChange={(e) => setMonth(parseInt(e.target.value, 10))}
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
            <option key={m} value={m}>
              {new Date(2000, m - 1).toLocaleString("default", {
                month: "long",
              })}
            </option>
          ))}
        </select>
        <select
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value, 10))}
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
        >
          {[
            now.getFullYear(),
            now.getFullYear() - 1,
            now.getFullYear() - 2,
          ].map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader>
            <CardTitle>Total spend</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              ${data?.totalSpend?.toFixed(2) ?? "0.00"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Fixed costs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              ${fixedTotal.toFixed(2)}
            </p>
            <p className="text-muted-foreground text-xs mt-1">
              Rent, subscriptions, insurance, etc.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Variable spending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              ${variableTotal.toFixed(2)}
            </p>
            <p className="text-muted-foreground text-xs mt-1">
              Groceries, restaurants, shopping, etc.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Revenue</CardTitle>
            <Dialog open={editOpen} onOpenChange={handleEditOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Pencil className="h-4 w-4" />
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
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              ${data?.totalRevenue?.toFixed(2) ?? "0.00"}
            </p>
            {hasOverride && (
              <p className="text-muted-foreground text-xs mt-1">
                Override for this month
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`text-3xl font-bold ${
                (data?.savings ?? 0) >= 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              ${data?.savings?.toFixed(2) ?? "0.00"}
            </p>
          </CardContent>
        </Card>
      </div>

      {!user?.monthlyIncome && (
        <Card className="mt-4 border-amber-500/50 bg-amber-500/5">
          <CardContent className="py-4">
            <p className="text-sm">
              Set your default monthly income in{" "}
              <Link to="/settings" className="underline font-medium">
                Settings
              </Link>{" "}
              to see savings. You can override it for specific months from the
              Revenue card.
            </p>
          </CardContent>
        </Card>
      )}

      {chartData.length > 0 && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Spend by category</CardTitle>
            <p className="text-muted-foreground text-sm">
              Set monthly budgets in Categories. Over-budget categories are
              highlighted in red.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4 max-h-[400px] overflow-y-auto">
              {chartData.map((c) => (
                <div
                  key={c.name}
                  className="flex items-center justify-between gap-4 py-2 border-b last:border-0"
                >
                  <span className="font-medium min-w-[120px]">{c.name}</span>
                  <span className="text-muted-foreground text-sm">
                    ${c.total.toFixed(2)}
                    {c.budget > 0 && (
                      <span className="ml-1">
                        / ${c.budget.toFixed(2)}{" "}
                        {c.isFixed ? "expected" : "budget"}
                      </span>
                    )}
                  </span>
                  {c.budget > 0 && (
                    <span
                      className={
                        c.over
                          ? "text-red-600 dark:text-red-400 font-medium"
                          : "text-green-600 dark:text-green-400 text-sm"
                      }
                    >
                      {c.over ? "Over" : "Under"}
                    </span>
                  )}
                </div>
              ))}
            </div>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart data={chartData} margin={{ left: 12, right: 12 }}>
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
          </CardContent>
        </Card>
      )}
      {data && chartData.length === 0 && (
        <Card className="mt-4">
          <CardContent className="py-8">
            <p className="text-muted-foreground text-center">
              No spending data yet. Import a CSV from the Import page to get
              started.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
