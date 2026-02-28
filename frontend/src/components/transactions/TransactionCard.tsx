import { useState } from 'react';
import type { TransactionRow } from '@/types';
import type { Category } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Combobox } from '@/components/ui/combobox';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatAmount } from '@/lib/transaction-utils';
import type { UseMutationResult } from '@tanstack/react-query';

type UpdateMutation = UseMutationResult<
  unknown,
  Error,
  {
    id: string;
    body: {
      categoryId?: string | null;
      notes?: string | null;
      isExcluded?: boolean;
      amount?: number;
      myShare?: number | null;
    };
  },
  unknown
>;

type TransactionCardProps = {
  transaction: TransactionRow;
  categories: Category[];
  onDelete: (tx: TransactionRow) => void;
  updateMutation: UpdateMutation;
};

export function TransactionCard({
  transaction,
  categories,
  onDelete,
  updateMutation,
}: TransactionCardProps) {
  const [editingAmount, setEditingAmount] = useState(false);
  const [amountInput, setAmountInput] = useState('');

  const amt = parseFloat(transaction.amount);
  const absAmt = Math.abs(amt);
  const myShareVal = transaction.myShare
    ? Math.abs(parseFloat(transaction.myShare))
    : null;
  const isHalfSplit =
    myShareVal != null && Math.abs(myShareVal - absAmt / 2) < 0.01;

  const handleAmountSave = () => {
    const val = parseFloat(amountInput);
    if (!isNaN(val) && val > 0) {
      updateMutation.mutate({
        id: transaction.id,
        body: { amount: val },
      });
    }
    setEditingAmount(false);
  };

  const handleHalfClick = () => {
    if (isHalfSplit) {
      updateMutation.mutate({
        id: transaction.id,
        body: { myShare: null },
      });
    } else {
      updateMutation.mutate({
        id: transaction.id,
        body: { myShare: absAmt / 2 },
      });
    }
  };

  return (
    <Card
      className={transaction.isExcluded ? 'opacity-50 bg-muted/30' : ''}
    >
      <CardContent className="p-3 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p
              className="font-medium truncate"
              title={transaction.description}
            >
              {transaction.description}
            </p>
            <p className="text-sm text-muted-foreground">
              {new Date(transaction.date).toLocaleDateString()}
            </p>
            <div className="mt-0.5 flex items-center gap-x-1.5 text-sm text-muted-foreground">
              {editingAmount ? (
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  onBlur={handleAmountSave}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAmountSave();
                    if (e.key === 'Escape') setEditingAmount(false);
                  }}
                  className="w-24 h-7 text-sm text-right"
                  autoFocus
                />
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setAmountInput(absAmt.toFixed(2));
                    setEditingAmount(true);
                  }}
                  className="hover:underline text-left"
                  title={
                    myShareVal != null
                      ? `Total: ${formatAmount(transaction.amount)}`
                      : undefined
                  }
                >
                  {myShareVal != null
                    ? amt < 0
                      ? `(${myShareVal.toFixed(2)})`
                      : `$${myShareVal.toFixed(2)}`
                    : formatAmount(transaction.amount)}
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(transaction)}
              aria-label="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2 text-xs">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={cn(
                'h-6 px-2',
                transaction.isExcluded &&
                  'border-flag-active/55 bg-flag-active/35 text-flag-active-foreground hover:bg-flag-active/45',
              )}
              onClick={() =>
                updateMutation.mutate({
                  id: transaction.id,
                  body: { isExcluded: !transaction.isExcluded },
                })
              }
              title={
                transaction.isExcluded
                  ? 'Include in budget'
                  : 'Exclude from budget'
              }
            >
              Excluded
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={cn(
                'h-6 px-2',
                myShareVal != null &&
                  'border-flag-active/55 bg-flag-active/35 text-flag-active-foreground hover:bg-flag-active/45',
              )}
              onClick={handleHalfClick}
              title={isHalfSplit ? 'Clear 50/50 split' : 'Split this 50/50'}
            >
              ½ split
            </Button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Combobox
              options={categories.map((c) => ({
                value: c.id,
                label: c.name,
              }))}
              value={transaction.category?.id ?? null}
              onValueChange={(v) =>
                updateMutation.mutate({
                  id: transaction.id,
                  body: { categoryId: v },
                })
              }
              placeholder="Category"
              searchPlaceholder="Type to search..."
              allowEmpty
              emptyOption={{ value: null, label: '—' }}
              triggerClassName="w-full"
            />
            <Input
              className="w-full"
              placeholder="Notes"
              defaultValue={transaction.notes ?? ''}
              onBlur={(e) => {
                const v = e.target.value.trim();
                if (v !== (transaction.notes ?? '')) {
                  updateMutation.mutate({
                    id: transaction.id,
                    body: { notes: v || null },
                  });
                }
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
