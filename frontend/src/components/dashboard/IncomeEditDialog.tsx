import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  upsertRevenueOverride,
  removeRevenueOverride,
  createAdditionalIncome,
  deleteAdditionalIncome,
  getAdditionalIncome,
} from '@/api/revenue';
import { Button } from '@/components/ui/button';
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
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/transaction-utils';
import { getMutationErrorMessage } from '@/lib/error-utils';

type IncomeEditDialogProps = {
  year: number;
  month: number;
  monthName: string;
  defaultIncome: number;
  hasOverride: boolean;
  overrideAmount: number | null;
  invalidateKeys: string[];
};

export function IncomeEditDialog({
  year,
  month,
  monthName,
  defaultIncome,
  hasOverride,
  overrideAmount,
  invalidateKeys,
}: IncomeEditDialogProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editAmount, setEditAmount] = useState('');
  const [addAmount, setAddAmount] = useState('');
  const [addDescription, setAddDescription] = useState('');

  const { data: additionalIncome = [] } = useQuery({
    queryKey: ['revenue', 'additional', year, month],
    queryFn: () => getAdditionalIncome(year, month),
    enabled: open,
  });

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setEditAmount('');
      setAddAmount('');
      setAddDescription('');
    } else {
      setEditAmount(
        hasOverride
          ? String(overrideAmount ?? '')
          : String(defaultIncome || ''),
      );
      setAddAmount('');
      setAddDescription('');
    }
    setOpen(nextOpen);
  };

  const upsertMutation = useMutation({
    mutationFn: upsertRevenueOverride,
    onSuccess: () => {
      invalidateKeys.forEach((key) =>
        queryClient.invalidateQueries({ queryKey: [key] }),
      );
      handleOpenChange(false);
    },
    onError: (err) => {
      toast.error(getMutationErrorMessage(err, 'Failed to save income'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => removeRevenueOverride(year, month),
    onSuccess: () => {
      invalidateKeys.forEach((key) =>
        queryClient.invalidateQueries({ queryKey: [key] }),
      );
      handleOpenChange(false);
    },
    onError: (err) => {
      toast.error(getMutationErrorMessage(err, 'Failed to reset income'));
    },
  });

  const addIncomeMutation = useMutation({
    mutationFn: createAdditionalIncome,
    onSuccess: () => {
      invalidateKeys.forEach((key) =>
        queryClient.invalidateQueries({ queryKey: [key] }),
      );
      setAddAmount('');
      setAddDescription('');
    },
    onError: (err) => {
      toast.error(getMutationErrorMessage(err, 'Failed to add income'));
    },
  });

  const removeAdditionalMutation = useMutation({
    mutationFn: deleteAdditionalIncome,
    onSuccess: () => {
      invalidateKeys.forEach((key) =>
        queryClient.invalidateQueries({ queryKey: [key] }),
      );
    },
    onError: (err) => {
      toast.error(getMutationErrorMessage(err, 'Failed to remove income'));
    },
  });

  const handleSaveOverride = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(editAmount);
    if (isNaN(amt) || amt < 0) return;
    upsertMutation.mutate({ year, month, amount: amt });
  };

  const handleUseDefault = () => {
    deleteMutation.mutate();
  };

  const handleAddAdditional = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(addAmount);
    if (isNaN(amt) || amt <= 0) return;
    addIncomeMutation.mutate({
      year,
      month,
      amount: amt,
      description: addDescription.trim() || undefined,
    });
  };

  const income = (hasOverride ? overrideAmount : defaultIncome) ?? 0;

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={`h-auto min-w-0 p-0 font-mono text-sm tabular-nums ${
              hasOverride
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {formatCurrency(income)}
            <Pencil className="ml-1 h-3.5 w-3.5 opacity-70" />
          </Button>
        </DialogTrigger>
      <DialogContent className="text-foreground">
        <form onSubmit={handleSaveOverride}>
          <DialogHeader>
            <DialogTitle>Income for {monthName} {year}</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm mt-2">
            {defaultIncome > 0
              ? `Your default is ${formatCurrency(defaultIncome)}/month. Override below if different this month.`
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
                        {item.description || 'Other'}:{' '}
                        {formatCurrency(item.amount)}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() =>
                          removeAdditionalMutation.mutate(item.id)
                        }
                        disabled={removeAdditionalMutation.isPending}
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
                  onChange={(e) => setAddDescription(e.target.value)}
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
              onClick={() => handleOpenChange(false)}
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
        <span className="text-muted-foreground text-xs">(override)</span>
      )}
    </>
  );
}
