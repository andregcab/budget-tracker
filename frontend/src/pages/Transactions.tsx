import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2 } from "lucide-react";
import { getTransactionsPerPage, setTransactionsPerPage } from "@/lib/user-preferences";

type Category = { id: string; name: string };
type TransactionRow = {
  id: string;
  date: string;
  description: string;
  amount: string;
  type: string;
  category: Category | null;
  notes: string | null;
  isExcluded: boolean;
};
type Account = { id: string; name: string };

async function getTransactions(params: {
  accountId?: string;
  categoryId?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}) {
  const sp = new URLSearchParams();
  if (params.accountId) sp.set("accountId", params.accountId);
  if (params.categoryId) sp.set("categoryId", params.categoryId);
  if (params.fromDate) sp.set("fromDate", params.fromDate);
  if (params.toDate) sp.set("toDate", params.toDate);
  if (params.page) sp.set("page", String(params.page));
  if (params.limit) sp.set("limit", String(params.limit));
  return api<{ items: TransactionRow[]; total: number; page: number; limit: number }>(
    `/transactions?${sp}`
  );
}

async function updateTransaction(
  id: string,
  body: {
    categoryId?: string | null;
    notes?: string | null;
    isExcluded?: boolean;
  }
) {
  return api<TransactionRow>(`/transactions/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

async function deleteTransaction(id: string) {
  return api(`/transactions/${id}`, { method: "DELETE" });
}

async function bulkDeleteTransactions(ids: string[]) {
  return api<{ deleted: number }>("/transactions/bulk-delete", {
    method: "POST",
    body: JSON.stringify({ ids }),
  });
}

async function deleteTransactionsByDateRange(fromDate: string, toDate: string) {
  return api<{ deleted: number }>(
    `/transactions?fromDate=${encodeURIComponent(fromDate)}&toDate=${encodeURIComponent(toDate)}`,
    { method: "DELETE" }
  );
}

async function getAccounts(): Promise<Account[]> {
  return api("/accounts");
}

function getMonthRange(): { from: string; to: string } {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return {
    from: `${y}-${m}-01`,
    to: `${y}-${m}-${new Date(y, now.getMonth() + 1, 0).getDate().toString().padStart(2, "0")}`,
  };
}

export function Transactions() {
  const queryClient = useQueryClient();
  const [accountId, setAccountId] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(getTransactionsPerPage);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<TransactionRow | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [deleteMonthOpen, setDeleteMonthOpen] = useState(false);

  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts"],
    queryFn: getAccounts,
  });
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: (): Promise<Category[]> => api("/categories"),
  });

  const { data, isLoading } = useQuery({
    queryKey: [
      "transactions",
      accountId,
      categoryId,
      fromDate,
      toDate,
      page,
      limit,
    ],
    queryFn: () =>
      getTransactions({
        accountId: accountId || undefined,
        categoryId: categoryId || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        page,
        limit,
      }),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: {
        categoryId?: string | null;
        notes?: string | null;
        isExcluded?: boolean;
      };
    }) => updateTransaction(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["analytics", "monthly"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["analytics", "monthly"] });
      setDeleteTarget(null);
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: bulkDeleteTransactions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["analytics", "monthly"] });
      setSelectedIds(new Set());
      setBulkDeleteOpen(false);
    },
  });

  const deleteMonthMutation = useMutation({
    mutationFn: ({ from, to }: { from: string; to: string }) =>
      deleteTransactionsByDateRange(from, to),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["analytics", "monthly"] });
      setDeleteMonthOpen(false);
    },
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const toggleSelectAll = () => {
    if (selectedIds.size === items.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(items.map((tx) => tx.id)));
  };
  const isAllSelected = items.length > 0 && selectedIds.size === items.length;
  const isSomeSelected = selectedIds.size > 0;

  const handleDeleteSingle = () => {
    if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
  };
  const handleBulkDelete = () => {
    bulkDeleteMutation.mutate(Array.from(selectedIds));
  };
  const handleDeleteMonth = () => {
    const { from, to } = getMonthRange();
    deleteMonthMutation.mutate({ from, to });
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold">Transactions</h1>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="grid gap-2 min-w-0">
            <Label>Account</Label>
            <Combobox
              options={accounts.map((a) => ({ value: a.id, label: a.name }))}
              value={accountId || null}
              onValueChange={(v) => setAccountId(v ?? "")}
              placeholder="All accounts"
              searchPlaceholder="Type to search..."
              allowEmpty
              emptyOption={{ value: null, label: "All accounts" }}
              triggerClassName="w-full sm:w-[180px]"
            />
          </div>
          <div className="grid gap-2 min-w-0">
            <Label>Category</Label>
            <Combobox
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
              value={categoryId || null}
              onValueChange={(v) => setCategoryId(v ?? "")}
              placeholder="All"
              searchPlaceholder="Type to search..."
              allowEmpty
              emptyOption={{ value: null, label: "All" }}
              triggerClassName="w-full sm:w-[180px]"
            />
          </div>
          <div className="grid gap-2 min-w-0">
            <Label>From date</Label>
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full min-w-0 sm:w-[160px]"
            />
          </div>
          <div className="grid gap-2 min-w-0">
            <Label>To date</Label>
            <Input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full min-w-0 sm:w-[160px]"
            />
          </div>
        </CardContent>
      </Card>
      <Card className="mt-4">
        <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
          <CardTitle>Transactions ({total})</CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-muted-foreground"
              onClick={toggleSelectAll}
            >
              {isAllSelected ? "Clear all" : "Select all"}
            </Button>
            {isSomeSelected && (
              <Button
                variant="outline"
                size="sm"
                className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:border-destructive"
                onClick={() => setBulkDeleteOpen(true)}
              >
                Delete selected ({selectedIds.size})
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:border-destructive"
              onClick={() => setDeleteMonthOpen(true)}
            >
              Delete all for this month
            </Button>
            <Label htmlFor="limit" className="text-sm text-muted-foreground whitespace-nowrap">
              Per page
            </Label>
            <Select
              value={String(limit)}
              onValueChange={(v) => {
                const next = parseInt(v, 10) as 25 | 50 | 100;
                setLimit(next);
                setTransactionsPerPage(next);
                setPage(1);
              }}
            >
              <SelectTrigger id="limit" className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : items.length === 0 ? (
            <p className="text-muted-foreground">No transactions match your filters.</p>
          ) : (
            <>
              {/* Mobile: card layout */}
              <div className="space-y-3 md:hidden">
                {items.map((tx) => (
                  <Card key={tx.id} className={tx.isExcluded ? "opacity-50 bg-muted/30" : ""}>
                    <CardContent className="p-3 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate" title={tx.description}>
                            {tx.description}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(tx.date).toLocaleDateString()} · {parseFloat(tx.amount) >= 0 ? tx.amount : `(${tx.amount})`}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(tx.id)}
                            onChange={() => toggleSelect(tx.id)}
                            title="Select"
                            className="h-4 w-4 rounded border-input"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => setDeleteTarget(tx)}
                            aria-label="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={tx.isExcluded}
                            onChange={() =>
                              updateMutation.mutate({
                                id: tx.id,
                                body: { isExcluded: !tx.isExcluded },
                              })
                            }
                            title="Exclude from budget"
                            className="h-4 w-4 rounded border-input shrink-0"
                          />
                          <span className="text-xs text-muted-foreground">Exclude from budget</span>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                          <Combobox
                            options={categories.map((c) => ({ value: c.id, label: c.name }))}
                            value={tx.category?.id ?? null}
                            onValueChange={(v) =>
                              updateMutation.mutate({
                                id: tx.id,
                                body: { categoryId: v },
                              })
                            }
                            placeholder="Category"
                            searchPlaceholder="Type to search..."
                            allowEmpty
                            emptyOption={{ value: null, label: "—" }}
                            triggerClassName="w-full"
                          />
                          <Input
                            className="w-full"
                            placeholder="Notes"
                            defaultValue={tx.notes ?? ""}
                            onBlur={(e) => {
                              const v = e.target.value.trim();
                              if (v !== (tx.notes ?? "")) {
                                updateMutation.mutate({
                                  id: tx.id,
                                  body: { notes: v || null },
                                });
                              }
                            }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {/* Desktop: table */}
              <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24">
                      <label className="flex cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isAllSelected}
                          ref={(el) => {
                            if (el) el.indeterminate = isSomeSelected && !isAllSelected;
                          }}
                          onChange={toggleSelectAll}
                          title="Select all on page"
                          className="h-4 w-4 rounded border-input"
                        />
                        <span className="text-xs font-medium text-muted-foreground">
                          Select all
                        </span>
                      </label>
                    </TableHead>
                    <TableHead className="w-20">Exclude</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-[220px]">Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="w-[160px]">Category</TableHead>
                    <TableHead className="w-[240px]">Notes</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((tx) => (
                    <TableRow
                      key={tx.id}
                      className={tx.isExcluded ? "opacity-50 bg-muted/30" : ""}
                    >
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(tx.id)}
                          onChange={() => toggleSelect(tx.id)}
                          title="Select for bulk delete"
                          className="h-4 w-4 rounded border-input"
                        />
                      </TableCell>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={tx.isExcluded}
                          onChange={() =>
                            updateMutation.mutate({
                              id: tx.id,
                              body: { isExcluded: !tx.isExcluded },
                            })
                          }
                          title="Exclude from budget (spend/savings)"
                          className="h-4 w-4 rounded border-input"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(tx.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell
                        className="max-w-[220px] truncate"
                        title={tx.description}
                      >
                        {tx.description}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {parseFloat(tx.amount) >= 0 ? tx.amount : `(${tx.amount})`}
                      </TableCell>
                      <TableCell className="w-[160px]">
                        <Combobox
                          options={categories.map((c) => ({
                            value: c.id,
                            label: c.name,
                          }))}
                          value={tx.category?.id ?? null}
                          onValueChange={(v) =>
                            updateMutation.mutate({
                              id: tx.id,
                              body: { categoryId: v },
                            })
                          }
                          placeholder="—"
                          searchPlaceholder="Type to search..."
                          allowEmpty
                          emptyOption={{ value: null, label: "—" }}
                          triggerClassName="w-[160px]"
                        />
                      </TableCell>
                      <TableCell className="w-[240px]">
                        <Input
                          className="w-full max-w-[240px]"
                          placeholder="Notes"
                          defaultValue={tx.notes ?? ""}
                          onBlur={(e) => {
                            const v = e.target.value.trim();
                            if (v !== (tx.notes ?? "")) {
                              updateMutation.mutate({
                                id: tx.id,
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
                          onClick={() => setDeleteTarget(tx)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
              {totalPages > 1 && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="border-destructive/50 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete transaction</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Delete &quot;{deleteTarget?.description}&quot;? This cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteSingle}
              disabled={deleteMutation.isPending}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <DialogContent className="border-destructive/50 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete selected transactions</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Delete {selectedIds.size} transaction{selectedIds.size !== 1 ? "s" : ""}? This cannot be
            undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={bulkDeleteMutation.isPending}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteMonthOpen} onOpenChange={setDeleteMonthOpen}>
        <DialogContent className="border-destructive/50 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete all for this month</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Delete all transactions in {new Date().toLocaleString("default", { month: "long", year: "numeric" })}?
            This cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteMonthOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteMonth}
              disabled={deleteMonthMutation.isPending}
            >
              Delete all
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
