import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createExpectedFixedExpense,
  deleteExpectedFixedExpense,
} from '@/api/revenue';
import type { Category, ExpectedFixedItem } from '@/types';
import type { FixedCategoryDisplay } from '@/hooks/useDashboardData';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Info, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

type ExpectedFixedCardProps = {
  year: number;
  month: number;
  fixedCategories: FixedCategoryDisplay[];
  expectedFixed: ExpectedFixedItem[];
  expectedByCategoryId: Record<string, ExpectedFixedItem>;
  fixedCategoriesForPicker: Category[];
  fixedTotal: number;
  invalidateKeys: string[];
};

export function ExpectedFixedCard({
  year,
  month,
  fixedCategories,
  expectedFixed,
  expectedByCategoryId,
  fixedCategoriesForPicker,
  fixedTotal,
  invalidateKeys,
}: ExpectedFixedCardProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');

  const addMutation = useMutation({
    mutationFn: createExpectedFixedExpense,
    onSuccess: () => {
      invalidateKeys.forEach((key) =>
        queryClient.invalidateQueries({ queryKey: [key] }),
      );
      setOpen(false);
      setCategoryId('');
      setAmount('');
    },
    onError: (err) => {
      toast.error(
        err instanceof Error
          ? err.message
          : 'Failed to add expected expense',
      );
    },
  });

  const removeMutation = useMutation({
    mutationFn: deleteExpectedFixedExpense,
    onSuccess: () => {
      invalidateKeys.forEach((key) =>
        queryClient.invalidateQueries({ queryKey: [key] }),
      );
    },
    onError: (err) => {
      toast.error(
        err instanceof Error
          ? err.message
          : 'Failed to remove expected expense',
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0 || !categoryId) return;
    addMutation.mutate({
      year,
      month,
      categoryId,
      amount: amt,
    });
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setCategoryId('');
      setAmount('');
    }
    setOpen(nextOpen);
  };

  if (fixedCategories.length === 0 && expectedFixed.length === 0) {
    return null;
  }

  return (
    <Card className="mt-6">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between mb-4 gap-2">
          <div className="flex items-center gap-1.5">
            <CardTitle className="text-base">
              Fixed bills this month
            </CardTitle>
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
                Rent, subscriptions, insurance — predictable costs
              </PopoverContent>
            </Popover>
          </div>
          <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button variant="default" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add expected
              </Button>
            </DialogTrigger>
            <DialogContent className="text-foreground">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    Add expected fixed expense
                  </DialogTitle>
                </DialogHeader>
                <p className="text-muted-foreground text-sm mt-2">
                  For expenses paid from accounts you don&apos;t track
                  (e.g. rent). Add a fixed category in{' '}
                  <Link
                    to="/categories"
                    className="underline"
                    onClick={() => setOpen(false)}
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
                          onClick={() => setOpen(false)}
                        >
                          Categories
                        </Link>{' '}
                        and mark it as fixed.
                      </p>
                    ) : (
                      <Select
                        value={categoryId}
                        onValueChange={setCategoryId}
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
                    <Label htmlFor="expected-amount">Amount</Label>
                    <Input
                      id="expected-amount"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="bg-background text-foreground"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      addMutation.isPending ||
                      !categoryId ||
                      !amount ||
                      parseFloat(amount) <= 0
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
          {fixedCategories
            .filter((c) => !(c.total === 0 && c.budget === 0))
            .map((c) => {
              const expected = expectedByCategoryId[c.id];
              const hasExpected = expected && c.budget > 0;
              const actual = c.total;
              const expectedAmt = c.budget;
              const showDiff =
                hasExpected && Math.abs(actual - expectedAmt) > 0.01;
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
                    {showDiff && (
                      <span className="text-muted-foreground text-xs">
                        (expected ${expectedAmt.toFixed(2)})
                      </span>
                    )}
                    {expected && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() =>
                          expected.id.startsWith('inherited-')
                            ? addMutation.mutate({
                                year,
                                month,
                                categoryId: expected.categoryId,
                                amount: 0,
                              })
                            : removeMutation.mutate(expected.id)
                        }
                        disabled={
                          removeMutation.isPending ||
                          addMutation.isPending
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
  );
}
