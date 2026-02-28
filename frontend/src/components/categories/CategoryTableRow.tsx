import type { Category } from '@/types';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Pencil, Trash2 } from 'lucide-react';
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
    <TableRow key={category.id}>
      <TableCell className="min-w-[180px] align-middle">
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
      <TableCell className="align-middle">
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
              onChange={(e) => onEditBudgetAmountChange(e.target.value)}
              className="max-w-[120px]"
              autoFocus
              form={`edit-form-${category.id}`}
              name="budget"
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEditStart(category);
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
      <TableCell className="w-[170px] pl-8 align-top">
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
