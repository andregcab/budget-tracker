import { api } from '@/api/client';
import type {
  AdditionalIncomeItem,
  ExpectedFixedItem,
} from '@/types';

export async function getRevenueOverride(
  year: number,
  month: number,
): Promise<{ amount: number } | null> {
  return api(`/revenue?year=${year}&month=${month}`);
}

export async function upsertRevenueOverride(body: {
  year: number;
  month: number;
  amount: number;
}) {
  return api<{ amount: number }>('/revenue', {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export async function removeRevenueOverride(
  year: number,
  month: number,
) {
  return api(`/revenue?year=${year}&month=${month}`, {
    method: 'DELETE',
  });
}

export async function getAdditionalIncome(
  year: number,
  month: number,
): Promise<AdditionalIncomeItem[]> {
  return api(`/revenue/additional?year=${year}&month=${month}`);
}

export async function createAdditionalIncome(body: {
  year: number;
  month: number;
  amount: number;
  description?: string;
}) {
  return api<AdditionalIncomeItem>('/revenue/additional', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function deleteAdditionalIncome(id: string) {
  return api(`/revenue/additional/${id}`, { method: 'DELETE' });
}

export async function getExpectedFixedExpenses(
  year: number,
  month: number,
): Promise<ExpectedFixedItem[]> {
  return api(`/expected-fixed-expenses?year=${year}&month=${month}`);
}

export async function createExpectedFixedExpense(body: {
  year: number;
  month: number;
  categoryId: string;
  amount: number;
}) {
  return api<ExpectedFixedItem>('/expected-fixed-expenses', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function deleteExpectedFixedExpense(id: string) {
  return api(`/expected-fixed-expenses/${id}`, { method: 'DELETE' });
}
