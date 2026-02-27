import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import confetti from "canvas-confetti";
import { Check, Lightbulb, X } from "lucide-react";
import { api } from "@/api/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  getGettingStartedDismissed,
  getGettingStartedConfettiShown,
  setGettingStartedDismissed,
  setGettingStartedConfettiShown,
} from "@/lib/user-preferences";

async function getAccounts(): Promise<{ id: string }[]> {
  return api("/accounts");
}

async function getMonthlySummary(): Promise<{ totalSpend: number }> {
  const now = new Date();
  return api(
    `/analytics/monthly?year=${now.getFullYear()}&month=${now.getMonth() + 1}`,
  );
}

export function GettingStartedCard() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (userId) {
      queueMicrotask(() =>
        setDismissed(getGettingStartedDismissed(userId)),
      );
    }
  }, [userId]);

  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts"],
    queryFn: getAccounts,
  });

  const { data: summary } = useQuery({
    queryKey: ["analytics", "monthly", "current"],
    queryFn: getMonthlySummary,
  });

  const hasAccounts = accounts.length > 0;
  const hasTransactions = (summary?.totalSpend ?? 0) > 0;
  const hasIncome =
    user?.monthlyIncome != null && user.monthlyIncome > 0;
  const allDone = hasAccounts && hasTransactions && hasIncome;

  useEffect(() => {
    if (allDone && userId && !getGettingStartedConfettiShown(userId)) {
      setGettingStartedConfettiShown(userId, true);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        disableForReducedMotion: true,
      });
    }
  }, [allDone, userId]);

  function handleDismiss() {
    if (userId) setGettingStartedDismissed(userId, true);
    setDismissed(true);
  }

  if (dismissed) {
    return null;
  }

  if (allDone) {
    return (
      <Card className="mb-4 border-green-500/50 bg-green-500/5">
        <CardContent className="flex items-center justify-between gap-3 py-4">
          <p className="text-sm font-medium text-foreground">
            You&apos;re all set! Nice work getting everything set up.
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="shrink-0"
          >
            Dismiss
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4 border-amber-500/50 bg-amber-500/5 nudge-attention">
      <CardContent className="flex gap-3 pt-4 pb-4 pr-4">
        <Lightbulb className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-500 mt-0.5" />
        <div className="flex-1 min-w-0 space-y-2 text-sm">
          <div className="flex items-start justify-between gap-2">
            <p className="font-medium text-foreground">Getting started</p>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
              onClick={handleDismiss}
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <ol className="space-y-1.5 text-muted-foreground">
            <li className="flex items-center gap-2">
              {hasAccounts ? (
                <Check className="h-4 w-4 shrink-0 text-green-600 dark:text-green-500" />
              ) : (
                <span className="font-medium text-foreground w-4">1.</span>
              )}
              {hasAccounts ? (
                <span className="line-through opacity-75">Add an account</span>
              ) : (
                <>
                  <Link
                    to="/accounts"
                    className="text-amber-700 dark:text-amber-400 font-medium hover:underline"
                  >
                    Add an account
                  </Link>
                  <span>—required before importing</span>
                </>
              )}
            </li>
            <li className="flex items-center gap-2">
              {hasTransactions ? (
                <Check className="h-4 w-4 shrink-0 text-green-600 dark:text-green-500" />
              ) : (
                <span className="font-medium text-foreground w-4">2.</span>
              )}
              {hasTransactions ? (
                <span className="line-through opacity-75">
                  Import transactions
                </span>
              ) : (
                <>
                  <Link
                    to="/import"
                    className="text-amber-700 dark:text-amber-400 font-medium hover:underline"
                  >
                    Import transactions
                  </Link>
                  <span>—from your bank&apos;s CSV export</span>
                </>
              )}
            </li>
            <li className="flex items-center gap-2">
              {hasIncome ? (
                <Check className="h-4 w-4 shrink-0 text-green-600 dark:text-green-500" />
              ) : (
                <span className="font-medium text-foreground w-4">3.</span>
              )}
              {hasIncome ? (
                <span className="line-through opacity-75">
                  Set monthly income
                </span>
              ) : (
                <>
                  <Link
                    to="/settings"
                    className="text-amber-700 dark:text-amber-400 font-medium hover:underline"
                  >
                    Set monthly income
                  </Link>
                  <span>—for budget context</span>
                </>
              )}
            </li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
