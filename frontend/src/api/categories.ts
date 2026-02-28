import { api } from '@/api/client';
import type { Category, CategoryBudget } from '@/types';

export async function getCategories(): Promise<Category[]> {
  return api('/categories');
}

export async function getBudgets(): Promise<CategoryBudget[]> {
  return api('/category-budgets');
}

export async function createCategory(body: {
  name: string;
  isFixed?: boolean;
  keywords?: string[];
}) {
  return api('/categories', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function updateCategory(
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

export async function deleteCategory(id: string, migrateTo?: string) {
  const url = migrateTo
    ? `/categories/${id}?migrateTo=${encodeURIComponent(migrateTo)}`
    : `/categories/${id}`;
  return api(url, { method: 'DELETE' });
}

export async function reApplyCategories(year: number, month: number) {
  return api<{ updated: number }>(
    `/transactions/re-apply-categories?year=${year}&month=${month}`,
    { method: 'POST' },
  );
}

export async function getCategoryWithCount(id: string) {
  return api<{ id: string; name: string; transactionCount: number }>(
    `/categories/${id}`,
  );
}

export async function upsertBudget(
  categoryId: string,
  amount: number,
): Promise<CategoryBudget> {
  return api<CategoryBudget>('/category-budgets', {
    method: 'PUT',
    body: JSON.stringify({ categoryId, amount }),
  });
}

export async function removeBudget(categoryId: string) {
  return api(`/category-budgets/${categoryId}`, { method: 'DELETE' });
}
