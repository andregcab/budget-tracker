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
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { CategoryCreateDialog } from '@/components/categories/CategoryCreateDialog';
import { CategoryDeleteDialog } from '@/components/categories/CategoryDeleteDialog';
import { CategoryDeactivateDialog } from '@/components/categories/CategoryDeactivateDialog';
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
    keywordsMutation,
  } = useCategoryMutations();

  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editIsFixed, setEditIsFixed] = useState(false);
  const [budgetEditId, setBudgetEditId] = useState<string | null>(null);
  const [keywordsEditId, setKeywordsEditId] = useState<string | null>(null);
  const [keywordsInput, setKeywordsInput] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
    transactionCount: number;
  } | null>(null);
  const [migrateToId, setMigrateToId] = useState('');
  const [deactivateTarget, setDeactivateTarget] = useState<Category | null>(
    null,
  );

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
          body: { name: editName.trim(), isFixed: editIsFixed },
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

  function handleKeywordsSave(e: React.FormEvent) {
    e.preventDefault();
    if (keywordsEditId) {
      keywordsMutation.mutate(
        {
          id: keywordsEditId,
          keywords: parseKeywords(keywordsInput),
        },
        { onSuccess: () => setKeywordsEditId(null) },
      );
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
      <CategoryDeactivateDialog
        target={deactivateTarget}
        onClose={() => setDeactivateTarget(null)}
        updateMutation={updateMutation}
      />
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <p className="text-muted-foreground text-sm">
            Edit names, set monthly budgets, or delete. Import keywords
            auto-categorize transactions: the category name is always
            used (e.g. &quot;Netflix&quot; matches &quot;netflix&quot;),
            and you can add extras like &quot;dining&quot; or &quot;Food
            &amp; Drink&quot; to map bank export types.
          </p>
        </CardHeader>
        <CardContent>
          <Table className="min-w-[520px]">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Monthly budget</TableHead>
                <TableHead className="w-[60px] text-center">Fixed</TableHead>
                <TableHead className="min-w-[120px]">
                  Import keywords
                </TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="w-[140px]">Actions</TableHead>
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
                  budgetEditId={budgetEditId}
                  budgetAmount={budgetAmount}
                  keywordsEditId={keywordsEditId}
                  keywordsInput={keywordsInput}
                  onEditNameChange={setEditName}
                  onEditIsFixedChange={setEditIsFixed}
                  onEditSave={handleEditSave}
                  onEditCancel={() => setEditId(null)}
                  onEditStart={(c) => {
                    setEditId(c.id);
                    setEditName(c.name);
                    setEditIsFixed(c.isFixed ?? false);
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
                  onKeywordsEditStart={(id, kw) => {
                    setKeywordsEditId(id);
                    setKeywordsInput(kw.join(', '));
                  }}
                  onKeywordsInputChange={setKeywordsInput}
                  onKeywordsSave={handleKeywordsSave}
                  onKeywordsCancel={() => setKeywordsEditId(null)}
                  onDeleteClick={handleDeleteClick}
                  onDeactivateClick={setDeactivateTarget}
                  onActivateClick={(id) =>
                    updateMutation.mutate({
                      id,
                      body: { isActive: true },
                    })
                  }
                  removeBudgetMutation={removeBudgetMutation}
                  updateMutation={updateMutation}
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
