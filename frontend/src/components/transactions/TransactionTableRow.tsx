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
        {parseFloat(transaction.amount) >= 0
          ? transaction.amount
          : `(${transaction.amount})`}
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
