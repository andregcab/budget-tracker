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
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { CardTitleWithInfo } from '@/components/ui/card-title-with-info';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/transaction-utils';
import { getMutationErrorMessage } from '@/lib/error-utils';

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
        getMutationErrorMessage(
          err,
          'Failed to add expected expense',
        ),
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
        getMutationErrorMessage(
          err,
          'Failed to remove expected expense',
        ),
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
          <CardTitleWithInfo
            title="Fixed bills this month"
            infoContent={
              <>Rent, subscriptions, insurance — predictable costs</>
            }
          />
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
            .filter(
              (category) =>
                !(category.total === 0 && category.budget === 0),
            )
            .map((category) => {
              const expectedItem = expectedByCategoryId[category.id];
              const hasExpected = expectedItem && category.budget > 0;
              const actual = category.total;
              const expectedAmount = category.budget;
              const showExpectedDiff =
                hasExpected &&
                Math.abs(actual - expectedAmount) > 0.01;
              return (
                <div
                  key={category.id}
                  className="flex items-center justify-between text-sm group"
                >
                  <span className="text-muted-foreground">
                    {category.name}
                  </span>
                  <span className="flex items-center gap-2">
                    {formatCurrency(category.total)}
                    {showExpectedDiff && (
                      <span className="text-muted-foreground text-xs">
                        (expected {formatCurrency(expectedAmount)})
                      </span>
                    )}
                    {expectedItem && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() =>
                          expectedItem.id.startsWith('inherited-')
                            ? addMutation.mutate({
                                year,
                                month,
                                categoryId: expectedItem.categoryId,
                                amount: 0,
                              })
                            : removeMutation.mutate(expectedItem.id)
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
            <span>{formatCurrency(fixedTotal)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
