import { useState } from 'react';
import type { TransactionRow } from '@/types';
import type { Category } from '@/types';
import { Button } from '@/components/ui/button';
import {
  TableCell,
  TableRow,
} from '@/components/ui/table';
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

type TransactionTableRowProps = {
  transaction: TransactionRow;
  categories: Category[];
  onDelete: (tx: TransactionRow) => void;
  updateMutation: UpdateMutation;
};

export function TransactionTableRow({
  transaction,
  categories,
  onDelete,
  updateMutation,
}: TransactionTableRowProps) {
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

  const toggleExclude = () => {
    updateMutation.mutate({
      id: transaction.id,
      body: { isExcluded: !transaction.isExcluded },
    });
  };

  return (
    <TableRow
      className={
        transaction.isExcluded ? 'opacity-50 bg-muted/30' : ''
      }
    >
      <TableCell>
        {new Date(transaction.date).toLocaleDateString()}
      </TableCell>
      <TableCell
        className="max-w-[220px] min-w-0 truncate"
        title={transaction.description}
      >
        {transaction.description}
      </TableCell>
      <TableCell className="min-w-[5rem] w-24 text-right font-mono align-middle whitespace-nowrap">
        {editingAmount ? (
          <div className="flex justify-end">
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
              className="w-24 h-8 text-right"
              autoFocus
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              setAmountInput(absAmt.toFixed(2));
              setEditingAmount(true);
            }}
            className="hover:underline"
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
      </TableCell>
      <TableCell className="w-[150px] min-w-[120px]">
        <div className="flex flex-wrap gap-1 text-xs">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn(
              'h-6 px-2',
              transaction.isExcluded &&
                'bg-flag-active text-flag-active-foreground border-flag-active/40 dark:border-white/50 hover:bg-[color-mix(in_srgb,var(--flag-active)_80%,white)] dark:hover:bg-[color-mix(in_srgb,var(--secondary)_80%,white)]',
            )}
            onClick={toggleExclude}
            title={
              transaction.isExcluded
                ? 'Include in budget'
                : 'Exclude from budget (spend/savings)'
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
                'bg-flag-active text-flag-active-foreground border-flag-active/40 dark:border-white/50 hover:bg-[color-mix(in_srgb,var(--flag-active)_80%,white)] dark:hover:bg-[color-mix(in_srgb,var(--secondary)_80%,white)]',
            )}
            onClick={handleHalfClick}
            title={isHalfSplit ? 'Clear 50/50 split' : 'Split this 50/50'}
          >
            ½ split
          </Button>
        </div>
      </TableCell>
      <TableCell className="w-[160px]">
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
          placeholder="—"
          searchPlaceholder="Type to search..."
          allowEmpty
          emptyOption={{ value: null, label: '—' }}
          triggerClassName="w-[160px]"
        />
      </TableCell>
      <TableCell className="w-[240px]">
        <Input
          className="w-full max-w-[240px]"
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
      </TableCell>
      <TableCell>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={() => onDelete(transaction)}
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}
