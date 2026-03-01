import type { Category } from '@/types';
import { formatCurrency } from '@/lib/transaction-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pencil, Trash2 } from 'lucide-react';
import type { UseMutationResult } from '@tanstack/react-query';

type DeleteMutation = UseMutationResult<
  unknown,
  Error,
  { id: string; migrateTo?: string },
  unknown
>;

type CategoryCardProps = {
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

export function CategoryCard({
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
}: CategoryCardProps) {
  const isEditing = editId === category.id;
  const budget = budgetByCategory[category.id];

  if (isEditing) {
    return (
      <article className="rounded-lg border border-border bg-card p-4 shadow-sm">
        <form
          id={`edit-form-mobile-${category.id}`}
          onSubmit={onEditSave}
          className="flex flex-col gap-4"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="space-y-2">
            <Label htmlFor={`name-${category.id}`}>Name</Label>
            <Input
              id={`name-${category.id}`}
              value={editName}
              onChange={(e) => onEditNameChange(e.target.value)}
              className="w-full"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`budget-${category.id}`}>
              Monthly budget
            </Label>
            <Input
              id={`budget-${category.id}`}
              type="number"
              step="0.01"
              min="0"
              value={editBudgetAmount}
              onChange={(e) =>
                onEditBudgetAmountChange(e.target.value)
              }
              className="w-full"
              placeholder="0.00"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`fixed-${category.id}`}
              form={`edit-form-mobile-${category.id}`}
              name="isFixed"
              checked={editIsFixed}
              onChange={(e) => onEditIsFixedChange(e.target.checked)}
              className="h-4 w-4 rounded border-input"
              title="Fixed monthly cost"
            />
            <Label
              htmlFor={`fixed-${category.id}`}
              className="font-normal"
            >
              Fixed monthly cost
            </Label>
          </div>
          <div className="space-y-2">
            <Label htmlFor={`keywords-${category.id}`}>
              Keywords (comma-separated)
            </Label>
            <Input
              id={`keywords-${category.id}`}
              value={editKeywords}
              onChange={(e) => onEditKeywordsChange(e.target.value)}
              placeholder="dining, Food & Drink"
              className="w-full"
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="submit"
              form={`edit-form-mobile-${category.id}`}
            >
              Save
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border-border"
              onClick={onEditCancel}
            >
              Cancel
            </Button>
          </div>
        </form>
      </article>
    );
  }

  return (
    <article className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1 space-y-1.5">
          <h3 className="font-semibold">{category.name}</h3>
          <dl className="space-y-0.5 text-sm text-muted-foreground">
            <div>
              <span className="font-medium text-foreground">
                Budget:{' '}
              </span>
              {budget != null
                ? formatCurrency(budget)
                : category.isFixed
                  ? 'Set amount'
                  : 'Set budget'}
            </div>
            <div>
              <span className="font-medium text-foreground">
                Fixed:{' '}
              </span>
              {category.isFixed ? 'Yes' : '—'}
            </div>
            <div>
              <span className="font-medium text-foreground">
                Keywords:{' '}
              </span>
              {(category.keywords ?? []).length > 0
                ? (category.keywords ?? []).join(', ')
                : 'Name used by default'}
            </div>
          </dl>
        </div>
        <div className="flex shrink-0 gap-1">
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
            title="Edit"
            aria-label="Edit"
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
            aria-label="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </article>
  );
}
