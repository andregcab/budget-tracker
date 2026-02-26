/**
 * Default categories aligned with common MCC codes and bank exports
 * (Chase, BofA, Citi, Wells Fargo, Amex, Capital One).
 * Keywords improve matching when CSV category names differ from bank to bank.
 */
export interface DefaultCategory {
  name: string;
  isFixed: boolean;
  keywords: string[];
}

export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  {
    name: 'Groceries',
    isFixed: false,
    keywords: ['grocery', 'supermarket', 'food'],
  },
  {
    name: 'Restaurants',
    isFixed: false,
    keywords: [
      'restaurant',
      'dining',
      'food & drink',
      'food and drink',
      'fast food',
      'cafe',
      'coffee',
    ],
  },
  { name: 'Rent', isFixed: true, keywords: ['rent', 'housing'] },
  {
    name: 'Utilities',
    isFixed: true,
    keywords: [
      'utilities',
      'electric',
      'gas',
      'water',
      'internet',
      'cable',
      'phone',
    ],
  },
  {
    name: 'Subscriptions',
    isFixed: true,
    keywords: ['subscription', 'streaming', 'netflix', 'spotify', 'recurring'],
  },
  {
    name: 'Gas',
    isFixed: false,
    keywords: ['gas', 'fuel', 'service station', 'ev charging'],
  },
  {
    name: 'Travel',
    isFixed: false,
    keywords: [
      'travel',
      'airline',
      'hotel',
      'car rental',
      'uber',
      'lyft',
      'transit',
    ],
  },
  {
    name: 'Healthcare',
    isFixed: false,
    keywords: ['healthcare', 'medical', 'doctor', 'hospital', 'health'],
  },
  {
    name: 'Drug Stores',
    isFixed: false,
    keywords: ['drug', 'pharmacy', 'cvs', 'walgreens'],
  },
  { name: 'Insurance', isFixed: true, keywords: ['insurance'] },
  {
    name: 'Entertainment',
    isFixed: false,
    keywords: ['entertainment', 'movies', 'recreation', 'fun'],
  },
  {
    name: 'Shopping',
    isFixed: false,
    keywords: ['shopping', 'merchandise', 'retail', 'amazon', 'clothing'],
  },
  {
    name: 'Personal Care',
    isFixed: false,
    keywords: ['personal care', 'gym', 'fitness', 'salon', 'spa'],
  },
  {
    name: 'Education',
    isFixed: false,
    keywords: ['education', 'tuition', 'student'],
  },
  {
    name: 'Gifts & Donations',
    isFixed: false,
    keywords: ['gift', 'donation', 'charity'],
  },
  {
    name: 'Transfer',
    isFixed: false,
    keywords: ['transfer', 'payment', 'ach'],
  },
  {
    name: 'Uncategorized',
    isFixed: false,
    keywords: ['uncategorized', 'other', 'miscellaneous'],
  },
];

export function isDefaultCategoryFixed(name: string): boolean {
  return DEFAULT_CATEGORIES.find((c) => c.name === name)?.isFixed ?? false;
}
