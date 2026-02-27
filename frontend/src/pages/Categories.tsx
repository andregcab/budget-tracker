import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { getBudgets, getCategoryWithCount } from '@/api/categories';
import type { Category } from '@/types';
import { useCategories } from '@/hooks/useCategories';
import { useCategoryMutations } from '@/hooks/useCategoryMutations';
import { parseKeywords } from '@/lib/format-utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Info } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { CategoryCreateDialog } from '@/components/categories/CategoryCreateDialog';
import { CategoryDeleteDialog } from '@/components/categories/CategoryDeleteDialog';
import { CategoryTableRow } from '@/components/categories/CategoryTableRow';

export function Categories() {
  const { data: categories = [], isLoading } = useCategories();
  const { data: budgets = [] } = useQuery({
    queryKey: ['category-budgets'],
    queryFn: getBudgets,
  });
  const budgetByCategory = Object.fromEntries(
    budgets.map((b) => [b.categoryId, b.amount]),
  );

  const {
    createMutation,
    updateMutation,
    deleteMutation,
    budgetMutation,
    removeBudgetMutation,
  } = useCategoryMutations();

  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editIsFixed, setEditIsFixed] = useState(false);
  const [editKeywords, setEditKeywords] = useState('');
  const [budgetEditId, setBudgetEditId] = useState<string | null>(null);
  const [budgetAmount, setBudgetAmount] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
    transactionCount: number;
  } | null>(null);
  const [migrateToId, setMigrateToId] = useState('');

  async function handleDeleteClick(cat: Category) {
    const data = await getCategoryWithCount(cat.id);
    setDeleteTarget({
      id: data.id,
      name: data.name,
      transactionCount: data.transactionCount,
    });
    setMigrateToId('');
  }

  function handleEditSave(e: React.FormEvent) {
    e.preventDefault();
    if (editId && editName.trim()) {
      updateMutation.mutate(
        {
          id: editId,
          body: {
            name: editName.trim(),
            isFixed: editIsFixed,
            keywords: parseKeywords(editKeywords),
          },
        },
        { onSuccess: () => setEditId(null) },
      );
    }
  }

  function handleBudgetSave(e: React.FormEvent) {
    e.preventDefault();
    if (budgetEditId) {
      const trimmed = budgetAmount.trim();
      const amt = parseFloat(trimmed);
      const resetBudgetEdit = () => {
        setBudgetEditId(null);
        setBudgetAmount('');
      };
      if (trimmed === '' || isNaN(amt) || amt < 0) {
        if (budgetByCategory[budgetEditId] != null) {
          removeBudgetMutation.mutate(budgetEditId, {
            onSuccess: resetBudgetEdit,
          });
        } else {
          resetBudgetEdit();
        }
      } else {
        budgetMutation.mutate(
          { categoryId: budgetEditId, amount: amt },
          { onSuccess: resetBudgetEdit },
        );
      }
    }
  }

  if (isLoading) {
    return <LoadingSpinner message="Loading categories..." />;
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Categories</h1>
        <CategoryCreateDialog
          createMutation={createMutation}
          trigger={<Button>Add category</Button>}
        />
      </div>
      <CategoryDeleteDialog
        target={deleteTarget}
        categories={categories}
        migrateToId={migrateToId}
        onMigrateChange={setMigrateToId}
        onClose={() => {
          setDeleteTarget(null);
          setMigrateToId('');
        }}
        deleteMutation={deleteMutation}
      />
      <Card className="mt-4">
        <CardHeader>
          <div className="flex items-center gap-1.5">
            <CardTitle>Categories</CardTitle>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="inline-flex text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                  aria-label="More information"
                >
                  <Info className="h-4 w-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-72 text-sm" align="start">
                Edit names, set budgets, or delete. Keywords auto-categorize
                transactions: the category name always matches (e.g.
                &quot;Netflix&quot; → &quot;netflix&quot;). Add extras like
                &quot;dining&quot; or &quot;Food &amp; Drink&quot; to map bank
                export types.
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent>
          <Table className="min-w-[520px] table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Name</TableHead>
                <TableHead>Monthly budget</TableHead>
                <TableHead className="w-[60px] text-center">Fixed</TableHead>
                <TableHead className="min-w-[200px]">
                  Keywords <span className="font-normal text-muted-foreground">(comma-separated)</span>
                </TableHead>
                <TableHead className="w-[170px] pl-8">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((cat) => (
                <CategoryTableRow
                  key={cat.id}
                  category={cat}
                  budgetByCategory={budgetByCategory}
                  editId={editId}
                  editName={editName}
                  editIsFixed={editIsFixed}
                  editKeywords={editKeywords}
                  budgetEditId={budgetEditId}
                  budgetAmount={budgetAmount}
                  onEditNameChange={setEditName}
                  onEditIsFixedChange={setEditIsFixed}
                  onEditKeywordsChange={setEditKeywords}
                  onEditSave={handleEditSave}
                  onEditCancel={() => setEditId(null)}
                  onEditStart={(c) => {
                    setEditId(c.id);
                    setEditName(c.name);
                    setEditIsFixed(c.isFixed ?? false);
                    setEditKeywords((c.keywords ?? []).join(', '));
                  }}
                  onBudgetEditStart={(id, amt) => {
                    setBudgetEditId(id);
                    setBudgetAmount(amt != null ? String(amt) : '');
                  }}
                  onBudgetAmountChange={setBudgetAmount}
                  onBudgetSave={handleBudgetSave}
                  onBudgetCancel={() => {
                    setBudgetEditId(null);
                    setBudgetAmount('');
                  }}
                  onBudgetRemove={(id) => removeBudgetMutation.mutate(id)}
                  onDeleteClick={handleDeleteClick}
                  removeBudgetMutation={removeBudgetMutation}
                  deleteMutation={deleteMutation}
                />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
