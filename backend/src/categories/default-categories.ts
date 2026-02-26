const FIXED_DEFAULT_CATEGORIES = ['Rent', 'Subscriptions', 'Insurance'];

export const DEFAULT_CATEGORIES = [
  'Groceries',
  'Restaurants',
  'Rent',
  'Utilities',
  'Subscriptions',
  'Gas',
  'Travel',
  'Healthcare',
  'Insurance',
  'Entertainment',
  'Shopping',
  'Personal Care',
  'Education',
  'Gifts & Donations',
  'Transfer',
  'Uncategorized',
];

export function isDefaultCategoryFixed(name: string): boolean {
  return FIXED_DEFAULT_CATEGORIES.includes(name);
}
