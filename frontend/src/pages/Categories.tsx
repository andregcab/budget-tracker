import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '@/api/client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Combobox } from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { Pencil, Trash2 } from 'lucide-react';

type Category = {
  id: string;
  name: string;
  isDefault: boolean;
  isActive: boolean;
  isFixed: boolean;
  keywords: string[];
  userId: string | null;
};

type CategoryBudget = {
  categoryId: string;
  categoryName: string;
  amount: number;
};

async function getCategories(): Promise<Category[]> {
  return api('/categories');
}

async function getBudgets(): Promise<CategoryBudget[]> {
  return api('/category-budgets');
}

async function createCategory(body: {
  name: string;
  isFixed?: boolean;
  keywords?: string[];
}) {
  return api('/categories', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

async function updateCategory(
  id: string,
  body: {
    name?: string;
    isActive?: boolean;
    isFixed?: boolean;
    keywords?: string[];
  },
) {
  return api(`/categories/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

async function deleteCategory(id: string, migrateTo?: string) {
  const url = migrateTo
    ? `/categories/${id}?migrateTo=${encodeURIComponent(migrateTo)}`
    : `/categories/${id}`;
  return api(url, { method: 'DELETE' });
}

async function reApplyCategories(year: number, month: number) {
  return api<{ updated: number }>(
    `/transactions/re-apply-categories?year=${year}&month=${month}`,
    { method: 'POST' },
  );
}

async function getCategoryWithCount(id: string) {
  return api<{ id: string; name: string; transactionCount: number }>(
    `/categories/${id}`,
  );
}

async function upsertBudget(
  categoryId: string,
  amount: number,
): Promise<CategoryBudget> {
  return api<CategoryBudget>('/category-budgets', {
    method: 'PUT',
    body: JSON.stringify({ categoryId, amount }),
  });
}

async function removeBudget(categoryId: string) {
  return api(`/category-budgets/${categoryId}`, { method: 'DELETE' });
}

export function Categories() {
  const queryClient = useQueryClient();
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });
  const { data: budgets = [] } = useQuery({
    queryKey: ['category-budgets'],
    queryFn: getBudgets,
  });
  const budgetByCategory = Object.fromEntries(
    budgets.map((b) => [b.categoryId, b.amount]),
  );

  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createIsFixed, setCreateIsFixed] = useState(false);
  const [createKeywords, setCreateKeywords] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editIsFixed, setEditIsFixed] = useState(false);
  const [budgetEditId, setBudgetEditId] = useState<string | null>(
    null,
  );
  const [keywordsEditId, setKeywordsEditId] = useState<string | null>(
    null,
  );
  const [keywordsInput, setKeywordsInput] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
    transactionCount: number;
  } | null>(null);
  const [migrateToId, setMigrateToId] = useState('');
  const [deactivateTarget, setDeactivateTarget] =
    useState<Category | null>(null);

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setCreateOpen(false);
      setCreateName('');
      setCreateIsFixed(false);
      setCreateKeywords('');
      try {
        const now = new Date();
        const { updated } = await reApplyCategories(
          now.getFullYear(),
          now.getMonth() + 1,
        );
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
        queryClient.invalidateQueries({ queryKey: ['analytics', 'monthly'] });
        toast.success(
          updated > 0
            ? `Category added. ${updated} transaction(s) updated this month.`
            : 'Category added.',
        );
      } catch {
        toast.success('Category added.');
      }
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to add category');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: {
        name?: string;
        isActive?: boolean;
        isFixed?: boolean;
        keywords?: string[];
      };
    }) => updateCategory(id, body),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setEditId(null);
      try {
        const now = new Date();
        const { updated } = await reApplyCategories(
          now.getFullYear(),
          now.getMonth() + 1,
        );
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
        queryClient.invalidateQueries({ queryKey: ['analytics', 'monthly'] });
        if (updated > 0) {
          toast.success(`${updated} transaction(s) updated this month.`);
        }
      } catch {
        // Re-apply failed; category update still succeeded
      }
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to update category');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({
      id,
      migrateTo,
    }: {
      id: string;
      migrateTo?: string;
    }) => deleteCategory(id, migrateTo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({
        queryKey: ['category-budgets'],
      });
      queryClient.invalidateQueries({
        queryKey: ['analytics', 'monthly'],
      });
      setDeleteTarget(null);
      setMigrateToId('');
      toast.success('Category deleted.');
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to delete category');
    },
  });

  async function handleDeleteClick(cat: Category) {
    const data = await getCategoryWithCount(cat.id);
    setDeleteTarget({
      id: data.id,
      name: data.name,
      transactionCount: data.transactionCount,
    });
    setMigrateToId('');
  }

  const budgetMutation = useMutation({
    mutationFn: ({
      categoryId,
      amount,
    }: {
      categoryId: string;
      amount: number;
    }) => upsertBudget(categoryId, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['category-budgets'] });
      queryClient.invalidateQueries({ queryKey: ['analytics', 'monthly'] });
      setBudgetEditId(null);
      setBudgetAmount('');
    },
  });

  const removeBudgetMutation = useMutation({
    mutationFn: removeBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['category-budgets'] });
      queryClient.invalidateQueries({ queryKey: ['analytics', 'monthly'] });
      setBudgetEditId(null);
      setBudgetAmount('');
    },
  });

  function parseKeywords(s: string): string[] {
    return s
      .split(/[,;]/)
      .map((k) => k.trim())
      .filter(Boolean);
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    createMutation.mutate({
      name: createName,
      isFixed: createIsFixed,
      keywords: parseKeywords(createKeywords),
    });
  }

  function handleEditSave(e: React.FormEvent) {
    e.preventDefault();
    if (editId && editName.trim()) {
      updateMutation.mutate({
        id: editId,
        body: { name: editName.trim(), isFixed: editIsFixed },
      });
    }
  }

  const keywordsMutation = useMutation({
    mutationFn: ({
      id,
      keywords,
    }: {
      id: string;
      keywords: string[];
    }) => updateCategory(id, { keywords }),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setKeywordsEditId(null);
      try {
        const now = new Date();
        const { updated } = await reApplyCategories(
          now.getFullYear(),
          now.getMonth() + 1,
        );
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
        queryClient.invalidateQueries({ queryKey: ['analytics', 'monthly'] });
        if (updated > 0) {
          toast.success(`${updated} transaction(s) updated this month.`);
        }
      } catch {
        // Re-apply failed; keywords update still succeeded
      }
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to save keywords');
    },
  });

  function handleKeywordsSave(e: React.FormEvent) {
    e.preventDefault();
    if (keywordsEditId) {
      keywordsMutation.mutate({
        id: keywordsEditId,
        keywords: parseKeywords(keywordsInput),
      });
    }
  }

  function handleBudgetSave(e: React.FormEvent) {
    e.preventDefault();
    if (budgetEditId) {
      const trimmed = budgetAmount.trim();
      const amt = parseFloat(trimmed);
      if (trimmed === '' || isNaN(amt) || amt < 0) {
        if (budgetByCategory[budgetEditId] != null) {
          removeBudgetMutation.mutate(budgetEditId);
        } else {
          setBudgetEditId(null);
          setBudgetAmount('');
        }
      } else {
        budgetMutation.mutate({
          categoryId: budgetEditId,
          amount: amt,
        });
      }
    }
  }

  if (isLoading)
    return (
      <p className="text-muted-foreground">Loading categories...</p>
    );

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Categories</h1>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setCreateOpen(true)}>
              Add category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>New category</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    required
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="create-fixed"
                    checked={createIsFixed}
                    onChange={(e) =>
                      setCreateIsFixed(e.target.checked)
                    }
                  />
                  <Label htmlFor="create-fixed">
                    Fixed monthly cost
                  </Label>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="create-keywords">
                    Import keywords (optional)
                  </Label>
                  <Input
                    id="create-keywords"
                    value={createKeywords}
                    onChange={(e) =>
                      setCreateKeywords(e.target.value)
                    }
                    placeholder="dining, Food & Drink"
                  />
                  <p className="text-xs text-muted-foreground">
                    The category name is always used for matching. Add
                    extras here to map Chase categories or match
                    descriptions (e.g. &quot;dining&quot; for Eating
                    Out, &quot;Food &amp; Drink&quot; for Chase&apos;s
                    type).
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                >
                  Create
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        <Dialog
          open={deleteTarget != null}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Delete &quot;{deleteTarget?.name}&quot;
              </DialogTitle>
            </DialogHeader>
            {deleteTarget && (
              <>
                <p className="text-muted-foreground text-sm">
                  {deleteTarget.transactionCount === 0
                    ? 'No transactions use this category.'
                    : `${deleteTarget.transactionCount} transaction${deleteTarget.transactionCount === 1 ? '' : 's'} use this category.`}
                </p>
                {deleteTarget.transactionCount > 0 && (
                  <div className="grid gap-2 py-2">
                    <Label>Migrate to</Label>
                    <Combobox
                      options={categories
                        .filter((c) => c.id !== deleteTarget.id)
                        .map((c) => ({ value: c.id, label: c.name }))}
                      value={migrateToId || null}
                      onValueChange={(v) => setMigrateToId(v ?? '')}
                      placeholder="Select category (optional)"
                      searchPlaceholder="Type to search..."
                      allowEmpty
                      emptyOption={{
                        value: null,
                        label: "Don't migrate",
                      }}
                    />
                  </div>
                )}
              </>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (deleteTarget) {
                    deleteMutation.mutate({
                      id: deleteTarget.id,
                      migrateTo: migrateToId || undefined,
                    });
                  }
                }}
                disabled={deleteMutation.isPending}
              >
                {migrateToId
                  ? 'Migrate and delete'
                  : 'Delete and uncategorize'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog
          open={deactivateTarget != null}
          onOpenChange={(open) => !open && setDeactivateTarget(null)}
        >
          <DialogContent className="border-destructive/30">
            <DialogHeader>
              <DialogTitle className="text-destructive">
                Deactivate &quot;{deactivateTarget?.name}&quot;?
              </DialogTitle>
            </DialogHeader>
            <p className="text-muted-foreground text-sm">
              Deactivating hides this category from dropdowns.
              Transactions keep their category. You can reactivate
              anytime.
            </p>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeactivateTarget(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (deactivateTarget) {
                    updateMutation.mutate({
                      id: deactivateTarget.id,
                      body: { isActive: false },
                    });
                    setDeactivateTarget(null);
                  }
                }}
                disabled={updateMutation.isPending}
              >
                Deactivate
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <p className="text-muted-foreground text-sm">
            Edit names, set monthly budgets, or delete. Import
            keywords auto-categorize transactions: the category name
            is always used (e.g. &quot;Netflix&quot; matches
            &quot;netflix&quot;), and you can add extras like
            &quot;dining&quot; or &quot;Food &amp; Drink&quot; to map
            Chase types.
          </p>
        </CardHeader>
        <CardContent>
          <Table className="min-w-[520px]">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Monthly budget</TableHead>
                <TableHead className="w-[60px] text-center">
                  Fixed
                </TableHead>
                <TableHead className="min-w-[120px]">
                  Import keywords
                </TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="w-[140px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="min-w-[180px]">
                    {editId === cat.id ? (
                      <form
                        id={`edit-form-${cat.id}`}
                        onSubmit={handleEditSave}
                        className="flex items-center"
                        onClick={(e) => e.stopPropagation()}
                        onPointerDown={(e) => e.stopPropagation()}
                      >
                        <Input
                          value={editName}
                          onChange={(e) =>
                            setEditName(e.target.value)
                          }
                          className="h-8 w-[140px] max-w-[180px] text-sm"
                          autoFocus
                        />
                      </form>
                    ) : (
                      <span>{cat.name}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {budgetEditId === cat.id ? (
                      <form
                        onSubmit={handleBudgetSave}
                        className="flex gap-2 items-center"
                        onClick={(e) => e.stopPropagation()}
                        onPointerDown={(e) => e.stopPropagation()}
                      >
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={budgetAmount}
                          onChange={(e) =>
                            setBudgetAmount(e.target.value)
                          }
                          className="max-w-[120px]"
                          autoFocus
                        />
                        <Button type="submit" size="sm">
                          Save
                        </Button>
                        {budgetByCategory[cat.id] != null && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="border-border"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              removeBudgetMutation.mutate(cat.id);
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
                          onClick={() => setBudgetEditId(null)}
                        >
                          Cancel
                        </Button>
                      </form>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setBudgetEditId(cat.id);
                          setBudgetAmount(
                            budgetByCategory[cat.id] != null
                              ? String(budgetByCategory[cat.id])
                              : '',
                          );
                        }}
                        className="text-left hover:underline text-muted-foreground"
                      >
                        {budgetByCategory[cat.id] != null
                          ? `$${budgetByCategory[cat.id].toFixed(2)}`
                          : cat.isFixed
                            ? 'Set amount'
                            : 'Set budget'}
                      </button>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {editId === cat.id ? (
                      <div
                        className="flex items-center justify-center"
                        onClick={(e) => e.stopPropagation()}
                        onPointerDown={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          form={`edit-form-${cat.id}`}
                          name="isFixed"
                          checked={editIsFixed}
                          onChange={(e) =>
                            setEditIsFixed(e.target.checked)
                          }
                          title="Fixed monthly cost"
                        />
                      </div>
                    ) : cat.isFixed ? (
                      'Yes'
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell className="min-w-[120px]">
                    {keywordsEditId === cat.id ? (
                      <form
                        onSubmit={handleKeywordsSave}
                        className="flex gap-2 items-center"
                        onClick={(e) => e.stopPropagation()}
                        onPointerDown={(e) => e.stopPropagation()}
                      >
                        <Input
                          value={keywordsInput}
                          onChange={(e) =>
                            setKeywordsInput(e.target.value)
                          }
                          placeholder="dining, Food & Drink"
                          className="max-w-[160px]"
                          autoFocus
                        />
                        <Button type="submit" size="sm">
                          Save
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setKeywordsEditId(null)}
                        >
                          Cancel
                        </Button>
                      </form>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setKeywordsEditId(cat.id);
                          setKeywordsInput(
                            (cat.keywords ?? []).join(', '),
                          );
                        }}
                        className="text-left hover:underline text-muted-foreground text-sm"
                      >
                        {(cat.keywords ?? []).length > 0
                          ? (cat.keywords ?? []).join(', ')
                          : 'Add (name used by default)'}
                      </button>
                    )}
                  </TableCell>
                  <TableCell>{cat.isActive ? 'Yes' : 'No'}</TableCell>
                  <TableCell className="w-[140px]">
                    {editId === cat.id ? (
                      <div className="flex items-center gap-3">
                        <Button
                          type="submit"
                          form={`edit-form-${cat.id}`}
                          size="sm"
                        >
                          Save
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="border-border"
                          onClick={() => setEditId(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : budgetEditId !== cat.id ? (
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
                            setEditId(cat.id);
                            setEditName(cat.name);
                            setEditIsFixed(cat.isFixed);
                          }}
                          title="Edit name"
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
                            handleDeleteClick(cat);
                          }}
                          disabled={deleteMutation.isPending}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className={
                            cat.isActive
                              ? 'border-destructive/50 text-destructive hover:bg-destructive/10 hover:border-destructive hover:text-destructive'
                              : ''
                          }
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (cat.isActive) {
                              setDeactivateTarget(cat);
                            } else {
                              updateMutation.mutate({
                                id: cat.id,
                                body: { isActive: true },
                              });
                            }
                          }}
                          disabled={updateMutation.isPending}
                        >
                          {cat.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
