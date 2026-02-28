import { useState } from 'react';
import { useAccounts } from '@/hooks/useAccounts';
import { useCategories } from '@/hooks/useCategories';
import { useTransactions } from '@/hooks/useTransactions';
import { useTransactionMutations } from '@/hooks/useTransactionMutations';
import type { TransactionRow } from '@/types';
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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { TransactionFiltersCard } from '@/components/transactions/TransactionFiltersCard';
import { TransactionCard } from '@/components/transactions/TransactionCard';
import { TransactionTableRow } from '@/components/transactions/TransactionTableRow';
import { AddTransactionDialog } from '@/components/transactions/AddTransactionDialog';
import { DeleteTransactionDialog } from '@/components/transactions/DeleteTransactionDialog';
import { DeleteMonthDialog } from '@/components/transactions/DeleteMonthDialog';

export function Transactions() {
  const { data: accounts = [] } = useAccounts();
  const { data: categories = [] } = useCategories();
  const {
    accountId,
    setAccountId,
    categoryId,
    setCategoryId,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    page,
    setPage,
    limit,
    setLimit,
    isLoading,
    items,
    total,
    totalPages,
  } = useTransactions();

  const {
    updateMutation,
    deleteMutation,
    deleteMonthMutation,
    createMutation,
  } = useTransactionMutations();

  const [deleteTarget, setDeleteTarget] = useState<TransactionRow | null>(
    null,
  );
  const [deleteMonthOpen, setDeleteMonthOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div>
      <h1 className="text-2xl font-semibold">Transactions</h1>

      <TransactionFiltersCard
        accounts={accounts}
        categories={categories}
        accountId={accountId}
        onAccountChange={setAccountId}
        categoryId={categoryId}
        onCategoryChange={setCategoryId}
        fromDate={fromDate}
        onFromDateChange={setFromDate}
        toDate={toDate}
        onToDateChange={setToDate}
      />

      <Card className="mt-4">
        <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
          <CardTitle>Transactions ({total})</CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="default" size="sm" onClick={() => setAddOpen(true)}>
              <Plus className="mr-1 h-4 w-4" />
              Add
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-destructive/40 text-destructive bg-destructive/10 hover:bg-destructive/20"
              onClick={() => setDeleteMonthOpen(true)}
            >
              Delete All
            </Button>
            <Label
              htmlFor="limit"
              className="text-sm text-muted-foreground whitespace-nowrap"
            >
              Per page
            </Label>
            <Select
              value={String(limit)}
              onValueChange={(v) => {
                const next = parseInt(v, 10) as 25 | 50 | 100;
                setLimit(next);
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
            <LoadingSpinner message="Loading transactions..." />
          ) : items.length === 0 ? (
            <p className="text-muted-foreground">
              No transactions match your filters.
            </p>
          ) : (
            <>
              <div className="space-y-3 md:hidden">
                {items.map((tx) => (
                  <TransactionCard
                    key={tx.id}
                    transaction={tx}
                    categories={categories}
                    onDelete={setDeleteTarget}
                    updateMutation={updateMutation}
                  />
                ))}
              </div>
              <div className="hidden md:block">
                <Table className="table-fixed">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-24">Date</TableHead>
                      <TableHead className="w-[220px] min-w-[180px]">Description</TableHead>
                      <TableHead className="w-24 min-w-[5rem] text-right">Amount</TableHead>
                      <TableHead className="w-[150px] min-w-[120px]">Flags</TableHead>
                      <TableHead className="w-[160px]">Category</TableHead>
                      <TableHead className="w-[240px]">Notes</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((tx) => (
                      <TransactionTableRow
                        key={tx.id}
                        transaction={tx}
                        categories={categories}
                        onDelete={setDeleteTarget}
                        updateMutation={updateMutation}
                      />
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

      <DeleteTransactionDialog
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        deleteMutation={deleteMutation}
      />

      <AddTransactionDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        accounts={accounts}
        categories={categories}
        defaultAccountId={accountId || (accounts[0]?.id ?? '')}
        defaultCategoryId={categoryId || null}
        createMutation={createMutation}
      />

      <DeleteMonthDialog
        open={deleteMonthOpen}
        onOpenChange={setDeleteMonthOpen}
        deleteMonthMutation={deleteMonthMutation}
      />
    </div>
  );
}
