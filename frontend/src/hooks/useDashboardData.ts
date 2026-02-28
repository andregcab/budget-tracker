import { useQuery } from '@tanstack/react-query';
import { getMonthlySummary } from '@/api/analytics';
import {
  getRevenueOverride,
  getExpectedFixedExpenses,
} from '@/api/revenue';
import { getCategories } from '@/api/categories';

export type ChartCategory = {
  id: string;
  name: string;
  total: number;
  budget: number;
  isFixed: boolean;
  over: boolean;
};

export type FixedCategoryDisplay = {
  id: string;
  name: string;
  total: number;
  budget: number;
  isFixed: boolean;
  over: boolean;
};

export function useDashboardData(year: number, effectiveMonth: number) {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics', 'monthly', year, effectiveMonth],
    queryFn: () => getMonthlySummary(year, effectiveMonth),
    placeholderData: (prev) => prev,
  });

  const { data: override } = useQuery({
    queryKey: ['revenue', year, effectiveMonth],
    queryFn: async () =>
      (await getRevenueOverride(year, effectiveMonth)) ?? null,
    placeholderData: (prev) => prev,
  });

  const { data: expectedFixed = [] } = useQuery({
    queryKey: ['expected-fixed-expenses', year, effectiveMonth],
    queryFn: () => getExpectedFixedExpenses(year, effectiveMonth),
    placeholderData: (prev) => prev,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const chartData: ChartCategory[] =
    data?.byCategory.map((c) => ({
      id: c.id,
      name: c.name,
      total: c.total,
      budget: c.budget,
      isFixed: c.isFixed,
      over: c.budget > 0 && c.total > c.budget,
    })) ?? [];

  const variableCategories = chartData.filter((c) => !c.isFixed);
  const fixedFromChart = chartData.filter((c) => c.isFixed);

  const expectedByCategoryId = Object.fromEntries(
    expectedFixed.map((e) => [e.categoryId, e]),
  );

  const fixedCategories: FixedCategoryDisplay[] = fixedFromChart.map((c) => {
    const expected = expectedByCategoryId[c.id];
    const actual = c.total;
    const total =
      actual > 0 ? actual : expected ? expected.amount : 0;
    const budget = expected ? expected.amount : c.budget;
    return {
      ...c,
      total,
      budget,
      over: budget > 0 && total > budget,
    };
  });
  for (const exp of expectedFixed) {
    if (!fixedCategories.some((c) => c.id === exp.categoryId)) {
      fixedCategories.push({
        id: exp.categoryId,
        name: exp.categoryName,
        total: exp.amount,
        budget: exp.amount,
        isFixed: true,
        over: false,
      });
    }
  }

  const fixedCategoriesForPicker = categories.filter((c) => c.isFixed);
  const fixedTotal = fixedCategories.reduce((sum, c) => sum + c.total, 0);
  const variableTotal = variableCategories.reduce((sum, c) => sum + c.total, 0);

  return {
    data,
    override,
    expectedFixed,
    categories,
    isLoading,
    chartData,
    variableCategories,
    fixedCategories,
    fixedTotal,
    variableTotal,
    expectedByCategoryId,
    fixedCategoriesForPicker,
  };
}
