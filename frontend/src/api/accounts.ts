import { api } from '@/api/client';
import type { Account } from '@/types';

export async function getAccounts(): Promise<Account[]> {
  return api('/accounts');
}

export async function createAccount(body: {
  name: string;
  type: string;
  institution?: string;
  isDefault?: boolean;
}) {
  return api('/accounts', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function updateAccount(
  id: string,
  body: {
    name?: string;
    type?: string;
    institution?: string;
    isDefault?: boolean;
  },
) {
  return api(`/accounts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function deleteAccount(id: string) {
  return api(`/accounts/${id}`, { method: 'DELETE' });
}
