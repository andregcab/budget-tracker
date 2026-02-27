import { api } from '@/api/client';
import type { MonthlySummary } from '@/types';

export async function getMonthlySummary(
  year?: number,
  month?: number,
): Promise<MonthlySummary> {
  const now = new Date();
  const y = year ?? now.getFullYear();
  const m = month ?? now.getMonth() + 1;
  return api(`/analytics/monthly?year=${y}&month=${m}`);
}
