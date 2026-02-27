import type { Category } from '@/types';
import { Button } from '@/components/ui/button';
import {
  TableCell,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Pencil, Trash2 } from 'lucide-react';
import type { UseMutationResult } from '@tanstack/react-query';

type RemoveBudgetMutation = UseMutationResult<
  unknown,
  Error,
  string,
  unknown
>;

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
  budgetEditId: string | null;
  budgetAmount: string;
  onEditNameChange: (v: string) => void;
  onEditIsFixedChange: (v: boolean) => void;
  onEditKeywordsChange: (v: string) => void;
  onEditSave: (e: React.FormEvent) => void;
  onEditCancel: () => void;
  onEditStart: (cat: Category) => void;
  onBudgetEditStart: (catId: string, currentAmount: number | undefined) => void;
  onBudgetAmountChange: (v: string) => void;
  onBudgetSave: (e: React.FormEvent) => void;
  onBudgetCancel: () => void;
  onBudgetRemove: (catId: string) => void;
  onDeleteClick: (cat: Category) => void;
  removeBudgetMutation: RemoveBudgetMutation;
  deleteMutation: DeleteMutation;
};

export function CategoryTableRow({
  category,
  budgetByCategory,
  editId,
  editName,
  editIsFixed,
  editKeywords,
  budgetEditId,
  budgetAmount,
  onEditNameChange,
  onEditIsFixedChange,
  onEditKeywordsChange,
  onEditSave,
  onEditCancel,
  onEditStart,
  onBudgetEditStart,
  onBudgetAmountChange,
  onBudgetSave,
  onBudgetCancel,
  onBudgetRemove,
  onDeleteClick,
  removeBudgetMutation,
  deleteMutation,
}: CategoryTableRowProps) {
  const isEditing = editId === category.id;
  const isBudgetEditing = budgetEditId === category.id;
  const budget = budgetByCategory[category.id];

  return (
    <TableRow key={category.id}>
      <TableCell className="min-w-[180px]">
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
              className="h-8 w-[140px] max-w-[180px] text-sm"
              autoFocus
            />
          </form>
        ) : (
          <span>{category.name}</span>
        )}
      </TableCell>
      <TableCell>
        {isBudgetEditing ? (
          <form
            onSubmit={onBudgetSave}
            className="flex gap-2 items-center"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <Input
              type="number"
              step="0.01"
              min="0"
              value={budgetAmount}
              onChange={(e) => onBudgetAmountChange(e.target.value)}
              className="max-w-[120px]"
              autoFocus
            />
            <Button type="submit" size="sm">
              Save
            </Button>
            {budget != null && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-border"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onBudgetRemove(category.id);
                }}
                disabled={removeBudgetMutation.isPending}
              >
                Clear
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-border"
              onClick={onBudgetCancel}
            >
              Cancel
            </Button>
          </form>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onBudgetEditStart(category.id, budget);
            }}
            className="text-left hover:underline text-muted-foreground"
          >
            {budget != null
              ? `$${budget.toFixed(2)}`
              : category.isFixed
                ? 'Set amount'
                : 'Set budget'}
          </button>
        )}
      </TableCell>
      <TableCell className="text-center">
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
      <TableCell className="min-w-[200px]">
        {isEditing ? (
          <div
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <Input
              value={editKeywords}
              onChange={(e) => onEditKeywordsChange(e.target.value)}
              placeholder="dining, Food & Drink"
              className="h-8 w-full min-w-[180px] text-sm"
            />
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">
            {(category.keywords ?? []).length > 0
              ? (category.keywords ?? []).join(', ')
              : 'Name used by default'}
          </span>
        )}
      </TableCell>
      <TableCell className="w-[170px] pl-8">
        {isEditing ? (
          <div className="flex items-center gap-2 shrink-0">
            <Button type="submit" form={`edit-form-${category.id}`} size="sm">
              Save
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-border"
              onClick={onEditCancel}
            >
              Cancel
            </Button>
          </div>
        ) : !isBudgetEditing ? (
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
        ) : null}
      </TableCell>
    </TableRow>
  );
}
