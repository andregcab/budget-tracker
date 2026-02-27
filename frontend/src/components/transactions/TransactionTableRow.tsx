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

  return (
    <TableRow
      className={
        transaction.isExcluded ? 'opacity-50 bg-muted/30' : ''
      }
    >
      <TableCell>
        <input
          type="checkbox"
          checked={transaction.isExcluded}
          onChange={() =>
            updateMutation.mutate({
              id: transaction.id,
              body: { isExcluded: !transaction.isExcluded },
            })
          }
          title="Exclude from budget (spend/savings)"
          className="h-4 w-4 rounded border-input"
        />
      </TableCell>
      <TableCell>
        {new Date(transaction.date).toLocaleDateString()}
      </TableCell>
      <TableCell
        className="max-w-[220px] truncate"
        title={transaction.description}
      >
        {transaction.description}
      </TableCell>
      <TableCell className="text-right font-mono">
        <div className="flex items-center justify-end gap-1">
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
              className="w-20 h-8 text-right"
              autoFocus
            />
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  setAmountInput(absAmt.toFixed(2));
                  setEditingAmount(true);
                }}
                className="hover:underline"
              >
                {formatAmount(transaction.amount)}
              </button>
              {myShareVal != null && (
                <span className="text-muted-foreground">
                  / ${myShareVal.toFixed(2)}
                </span>
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 px-1.5 text-xs"
                onClick={handleHalfClick}
                title={isHalfSplit ? 'Clear split' : 'Split 50/50'}
              >
                ½
              </Button>
            </>
          )}
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
