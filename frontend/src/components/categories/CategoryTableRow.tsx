import type { Category } from '@/types';
import { formatCurrency } from '@/lib/transaction-utils';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Check, Pencil, Trash2, X } from 'lucide-react';
import type { UseMutationResult } from '@tanstack/react-query';

type DeleteMutation = UseMutationResult<
  unknown,
  Error,
  { id: string; migrateTo?: string },
  unknown
>;

type CategoryTableRowProps = {
  category: Category;
  budgetByCategory: Record<string, number>;
  editId: string | null;
  editName: string;
  editIsFixed: boolean;
  editKeywords: string;
  editBudgetAmount: string;
  onEditNameChange: (v: string) => void;
  onEditIsFixedChange: (v: boolean) => void;
  onEditKeywordsChange: (v: string) => void;
  onEditBudgetAmountChange: (v: string) => void;
  onEditSave: (e: React.FormEvent) => void;
  onEditCancel: () => void;
  onEditStart: (cat: Category) => void;
  onDeleteClick: (cat: Category) => void;
  deleteMutation: DeleteMutation;
};

export function CategoryTableRow({
  category,
  budgetByCategory,
  editId,
  editName,
  editIsFixed,
  editKeywords,
  editBudgetAmount,
  onEditNameChange,
  onEditIsFixedChange,
  onEditKeywordsChange,
  onEditBudgetAmountChange,
  onEditSave,
  onEditCancel,
  onEditStart,
  onDeleteClick,
  deleteMutation,
}: CategoryTableRowProps) {
  const isEditing = editId === category.id;
  const budget = budgetByCategory[category.id];

  return (
    <TableRow
      key={category.id}
      className="[&>td]:min-h-[3.25rem]" // Cells control row height; tr min-height is unreliable
    >
      <TableCell className="w-[180px] min-w-[180px] max-w-[180px] align-middle">
        {isEditing ? (
          <form
            id={`edit-form-${category.id}`}
            onSubmit={onEditSave}
            className="flex items-center"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <Input
              value={editName}
              onChange={(e) => onEditNameChange(e.target.value)}
              className="h-8 w-full min-w-0 text-sm"
              autoFocus
            />
          </form>
        ) : (
          <span className="block truncate">{category.name}</span>
        )}
      </TableCell>
      <TableCell className="w-[130px] min-w-[130px] align-middle">
        {isEditing ? (
          <div
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            className="flex items-center gap-2"
          >
            <Input
              type="number"
              step="0.01"
              min="0"
              value={editBudgetAmount}
              onChange={(e) =>
                onEditBudgetAmountChange(e.target.value)
              }
              className="h-8 w-full min-w-0"
              form={`edit-form-${category.id}`}
              name="budget"
            />
          </div>
        ) : (
          <span className="text-muted-foreground">
            {budget != null
              ? formatCurrency(budget)
              : category.isFixed
                ? 'Set amount'
                : 'Set budget'}
          </span>
        )}
      </TableCell>
      <TableCell className="w-[60px] min-w-[60px] text-center align-middle">
        {isEditing ? (
          <div
            className="flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              form={`edit-form-${category.id}`}
              name="isFixed"
              checked={editIsFixed}
              onChange={(e) => onEditIsFixedChange(e.target.checked)}
              title="Fixed monthly cost"
            />
          </div>
        ) : category.isFixed ? (
          'Yes'
        ) : (
          '—'
        )}
      </TableCell>
      <TableCell className="w-[200px] min-w-[200px] max-w-[200px] align-middle">
        {isEditing ? (
          <div
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            className="min-w-0"
          >
            <Input
              value={editKeywords}
              onChange={(e) => onEditKeywordsChange(e.target.value)}
              placeholder="dining, Food & Drink"
              className="h-8 w-full min-w-0 text-sm"
            />
          </div>
        ) : (
          <span className="block truncate text-muted-foreground text-sm">
            {(category.keywords ?? []).length > 0
              ? (category.keywords ?? []).join(', ')
              : 'Name used by default'}
          </span>
        )}
      </TableCell>
      <TableCell className="w-[170px] min-w-[170px] pl-8 align-middle shrink-0">
        {isEditing ? (
          <div className="flex gap-1 shrink-0">
            <Button
              type="submit"
              form={`edit-form-${category.id}`}
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-foreground dark:text-primary dark:hover:text-primary"
              title="Save"
            >
              <Check className="h-4 w-4" />
            </Button>
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
          <div
            className="flex gap-1"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEditStart(category);
              }}
              title="Edit name, fixed, keywords"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDeleteClick(category);
              }}
              disabled={deleteMutation.isPending}
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
