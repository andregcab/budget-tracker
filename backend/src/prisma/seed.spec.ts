describe('Category seed', () => {
  const DEFAULT_CATEGORIES = [
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

  it('includes required default categories', () => {
    expect(DEFAULT_CATEGORIES).toContain('Uncategorized');
    expect(DEFAULT_CATEGORIES).toContain('Groceries');
    expect(DEFAULT_CATEGORIES.length).toBeGreaterThanOrEqual(10);
  });

  it('has no duplicate names', () => {
    const set = new Set(DEFAULT_CATEGORIES);
    expect(set.size).toBe(DEFAULT_CATEGORIES.length);
  });
});
