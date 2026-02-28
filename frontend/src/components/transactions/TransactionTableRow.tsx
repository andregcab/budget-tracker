import type { TransactionRow } from '@/types';
import type { Category } from '@/types';
import { Button } from '@/components/ui/button';
import {
  TableCell,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Combobox } from '@/components/ui/combobox';
import { Check, Pencil, Trash2, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  formatAmount,
  formatDateToMMDDYY,
  parseMMDDYYToISO,
} from '@/lib/transaction-utils';
import type { UseMutationResult } from '@tanstack/react-query';

type UpdateMutation = UseMutationResult<
  unknown,
  Error,
  {
    id: string;
    body: {
      date?: string;
      description?: string;
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
  editId: string | null;
  editDate: string;
  editDescription: string;
  editAmount: string;
  editCategoryId: string | null;
  editNotes: string;
  onEditDateChange: (v: string) => void;
  onEditDescriptionChange: (v: string) => void;
  onEditAmountChange: (v: string) => void;
  onEditCategoryIdChange: (v: string | null) => void;
  onEditNotesChange: (v: string) => void;
  onEditSave: (e: React.FormEvent) => void;
  onEditCancel: () => void;
  onEditStart: (tx: TransactionRow) => void;
};

export function TransactionTableRow({
  transaction,
  categories,
  onDelete,
  updateMutation,
  editId,
  editDate,
  editDescription,
  editAmount,
  editCategoryId,
  editNotes,
  onEditDateChange,
  onEditDescriptionChange,
  onEditAmountChange,
  onEditCategoryIdChange,
  onEditNotesChange,
  onEditSave,
  onEditCancel,
  onEditStart,
}: TransactionTableRowProps) {
  const isEditing = editId === transaction.id;
  const [dateInputValue, setDateInputValue] = useState('');

  useEffect(() => {
    if (isEditing) setDateInputValue(formatDateToMMDDYY(editDate));
  }, [isEditing, editDate]);

  const handleDateInputChange = (value: string) => {
    setDateInputValue(value);
    const iso = parseMMDDYYToISO(value);
    if (iso) onEditDateChange(iso);
  };

  const amt = parseFloat(transaction.amount);
  const absAmt = Math.abs(amt);
  const myShareVal = transaction.myShare
    ? Math.abs(parseFloat(transaction.myShare))
    : null;
  const isHalfSplit =
    myShareVal != null && Math.abs(myShareVal - absAmt / 2) < 0.01;

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
      <TableCell className="min-w-[100px] w-[100px]">
        {isEditing ? (
          <Input
            type="text"
            inputMode="numeric"
            placeholder="M/D/YY"
            value={dateInputValue}
            onChange={(e) => handleDateInputChange(e.target.value)}
            className="h-8 w-full min-w-0 pl-2 -ml-2 font-mono"
            form={`edit-tx-form-${transaction.id}`}
          />
        ) : (
          new Date(transaction.date).toLocaleDateString(undefined, {
              year: '2-digit',
              month: 'numeric',
              day: 'numeric',
            })
        )}
      </TableCell>
      <TableCell
        className={cn(
          'max-w-[220px] min-w-0',
          !isEditing && 'truncate',
        )}
        title={!isEditing ? transaction.description : undefined}
      >
        {isEditing ? (
          <Input
            value={editDescription}
            onChange={(e) => onEditDescriptionChange(e.target.value)}
            className="h-8 w-full min-w-0 text-sm pl-2 -ml-2"
            form={`edit-tx-form-${transaction.id}`}
          />
        ) : (
          transaction.description
        )}
      </TableCell>
      <TableCell className="min-w-[5rem] w-24 text-right font-mono align-middle whitespace-nowrap">
        {isEditing ? (
          <div className="flex justify-end">
            <Input
              type="number"
              step="0.01"
              min="0.01"
              value={editAmount}
              onChange={(e) => onEditAmountChange(e.target.value)}
              className="h-8 w-24 text-right pl-2 pr-2 -mr-2"
              form={`edit-tx-form-${transaction.id}`}
            />
          </div>
        ) : (
          <span
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
          </span>
        )}
      </TableCell>
      <TableCell className="w-[150px] min-w-[120px]">
        <div className="flex flex-wrap gap-1 text-xs">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn(
              'h-6 px-2.5 py-1',
              transaction.isExcluded &&
                'border-flag-active/55 bg-flag-active/35 text-flag-active-foreground hover:bg-flag-active/45',
            )}
            onClick={toggleExclude}
            title={
              transaction.isExcluded
                ? 'Include in budget'
                : 'Omit from budget'
            }
          >
            Omit
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn(
              'h-6 px-2.5 py-1',
              myShareVal != null &&
                'border-flag-active/55 bg-flag-active/35 text-flag-active-foreground hover:bg-flag-active/45',
            )}
            onClick={handleHalfClick}
            title={isHalfSplit ? 'Clear 50/50 split' : 'Split this 50/50'}
          >
            Split
          </Button>
        </div>
      </TableCell>
      <TableCell className="w-[160px]">
        {isEditing ? (
          <Combobox
            options={categories.map((c) => ({
              value: c.id,
              label: c.name,
            }))}
            value={editCategoryId}
            onValueChange={(v) => onEditCategoryIdChange(v)}
            placeholder="—"
            searchPlaceholder="Type to search..."
            allowEmpty
            emptyOption={{ value: null, label: '—' }}
            triggerClassName="w-[160px] -ml-2 pl-2"
          />
        ) : (
          <span className="text-muted-foreground">
            {transaction.category?.name ?? '—'}
          </span>
        )}
      </TableCell>
      <TableCell className="w-[120px] min-w-[100px] max-w-[120px]">
        {isEditing ? (
          <Input
            value={editNotes}
            onChange={(e) => onEditNotesChange(e.target.value)}
            placeholder="Notes"
            className="h-8 w-full min-w-0 pl-2 -ml-2"
            form={`edit-tx-form-${transaction.id}`}
          />
        ) : (
          <span
            className="text-muted-foreground text-sm truncate block min-w-0"
            title={transaction.notes ?? '—'}
          >
            {transaction.notes ?? '—'}
          </span>
        )}
      </TableCell>
      <TableCell className="w-20 shrink-0">
        {isEditing ? (
          <div className="flex gap-1 shrink-0">
            <form
              id={`edit-tx-form-${transaction.id}`}
              onSubmit={onEditSave}
              className="contents"
            >
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary hover:text-primary"
                title="Save"
              >
                <Check className="h-4 w-4" />
              </Button>
            </form>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={onEditCancel}
              title="Cancel"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onEditStart(transaction)}
              title="Edit"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={() => onDelete(transaction)}
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </TableCell>
    </TableRow>
  );
}
