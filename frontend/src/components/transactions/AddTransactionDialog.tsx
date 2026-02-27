import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Combobox } from '@/components/ui/combobox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import type { UseMutationResult } from '@tanstack/react-query';

type Account = { id: string; name: string };
type Category = { id: string; name: string };

type AddTransactionMutation = UseMutationResult<
  unknown,
  Error,
  {
    accountId: string;
    date: string;
    description: string;
    amount: number;
    type: 'debit' | 'credit';
    categoryId?: string | null;
    notes?: string | null;
  },
  unknown
>;

type AddTransactionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accounts: Account[];
  categories: Category[];
  defaultAccountId: string;
  defaultCategoryId: string | null;
  createMutation: AddTransactionMutation;
};

export function AddTransactionDialog({
  open,
  onOpenChange,
  accounts,
  categories,
  defaultAccountId,
  defaultCategoryId,
  createMutation,
}: AddTransactionDialogProps) {
  const [form, setForm] = useState({
    accountId: '',
    date: new Date().toISOString().slice(0, 10),
    description: '',
    amount: '',
    myShare: '' as string,
    type: 'debit' as 'debit' | 'credit',
    categoryId: '' as string | null,
    notes: '',
  });

  useEffect(() => {
    if (open) {
      setForm({
        accountId: defaultAccountId || (accounts[0]?.id ?? ''),
        date: new Date().toISOString().slice(0, 10),
        description: '',
        amount: '',
        myShare: '',
        type: 'debit',
        categoryId: defaultCategoryId,
        notes: '',
      });
    }
  }, [open, defaultAccountId, defaultCategoryId, accounts]);

  const amt = parseFloat(form.amount);
  const absAmt = Math.abs(amt);
  const myShareNum = form.myShare ? parseFloat(form.myShare) : null;
  const isHalfSplit =
    amt > 0 && myShareNum != null && Math.abs(myShareNum - absAmt / 2) < 0.01;

  const handleHalfClick = () => {
    if (!form.amount || amt <= 0) return;
    if (isHalfSplit) {
      setForm((f) => ({ ...f, myShare: '' }));
    } else {
      setForm((f) => ({
        ...f,
        myShare: (Math.abs(amt) / 2).toFixed(2),
      }));
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(form.amount);
    if (
      !form.accountId ||
      !form.description ||
      !form.amount ||
      isNaN(amt) ||
      amt <= 0
    )
      return;
    createMutation.mutate(
      {
        accountId: form.accountId,
        date: form.date,
        description: form.description.trim(),
        amount: amt,
        ...(form.myShare && parseFloat(form.myShare) > 0 && {
          myShare: parseFloat(form.myShare),
        }),
        type: form.type,
        categoryId: form.categoryId || null,
        notes: form.notes.trim() || null,
      },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add transaction</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Account</Label>
              <Combobox
                options={accounts.map((a) => ({
                  value: a.id,
                  label: a.name,
                }))}
                value={form.accountId || null}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, accountId: v ?? '' }))
                }
                placeholder="Select account"
                searchPlaceholder="Type to search..."
                triggerClassName="w-full"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-date">Date</Label>
              <Input
                id="add-date"
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, date: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-description">Description</Label>
              <Input
                id="add-description"
                placeholder="e.g. Coffee shop"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="add-amount">Amount</Label>
                <div className="flex gap-2">
                  <Input
                    id="add-amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        amount: e.target.value,
                        myShare: '',
                      }))
                    }
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleHalfClick}
                    disabled={!form.amount || amt <= 0}
                    title={isHalfSplit ? 'Clear split' : 'Split 50/50'}
                  >
                    ½
                  </Button>
                </div>
                {form.myShare && (
                  <p className="text-xs text-muted-foreground">
                    My share: ${parseFloat(form.myShare).toFixed(2)}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="add-type">Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(v: 'debit' | 'credit') =>
                    setForm((f) => ({ ...f, type: v }))
                  }
                >
                  <SelectTrigger id="add-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="debit">Expense</SelectItem>
                    <SelectItem value="credit">Income</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Category</Label>
              <Combobox
                options={categories.map((c) => ({
                  value: c.id,
                  label: c.name,
                }))}
                value={form.categoryId}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, categoryId: v }))
                }
                placeholder="Optional"
                searchPlaceholder="Type to search..."
                allowEmpty
                emptyOption={{ value: null, label: '—' }}
                triggerClassName="w-full"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-notes">Notes</Label>
              <Input
                id="add-notes"
                placeholder="Optional"
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                createMutation.isPending ||
                !form.accountId ||
                !form.description.trim() ||
                !form.amount ||
                parseFloat(form.amount) <= 0
              }
            >
              {createMutation.isPending ? 'Adding...' : 'Add'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
