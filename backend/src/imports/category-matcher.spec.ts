import { normalizeForMatch, matchCategory } from './category-matcher';

describe('normalizeForMatch', () => {
  it('lowercases and collapses & to and', () => {
    expect(normalizeForMatch('Food & Drink')).toBe('food and drink');
    expect(normalizeForMatch('Food and Drink')).toBe('food and drink');
  });

  it('collapses whitespace', () => {
    expect(normalizeForMatch('  Food   &   Drink  ')).toBe('food and drink');
  });

  it('returns empty for blank input', () => {
    expect(normalizeForMatch('')).toBe('');
    expect(normalizeForMatch('   ')).toBe('');
  });

  it('strips surrounding CSV-style quotes', () => {
    expect(normalizeForMatch('"Home"')).toBe('home');
    expect(normalizeForMatch("'Travel'")).toBe('travel');
  });
});

describe('matchCategory', () => {
  const categoryByName = new Map([
    ['restaurants', 'cat-restaurants'],
    ['groceries', 'cat-groceries'],
    ['travel', 'cat-travel'],
  ]);
  const categoriesWithKeywords = [
    { id: 'cat-restaurants', keywords: ['restaurant', 'food and drink'] },
    { id: 'cat-groceries', keywords: ['grocery', 'food'] },
    { id: 'cat-travel', keywords: ['travel', 'uber'] },
  ];
  const input = { categoryByName, categoriesWithKeywords };

  it('matches Food & Drink via keyword (normalization)', () => {
    expect(matchCategory('Food & Drink', input)).toBe('cat-restaurants');
    expect(matchCategory('Food and Drink', input)).toBe('cat-restaurants');
  });

  it('matches exact category name', () => {
    expect(matchCategory('Restaurants', input)).toBe('cat-restaurants');
  });

  it('matches via keyword', () => {
    expect(matchCategory('Restaurant visit', input)).toBe('cat-restaurants');
  });

  it('prefers longest keyword match', () => {
    // "food and drink" (14) vs "food" in Groceries (4)
    expect(matchCategory('Food & Drink', input)).toBe('cat-restaurants');
  });

  it('matches merchant names in description', () => {
    const input2 = {
      categoryByName,
      categoriesWithKeywords: [
        {
          id: 'cat-restaurants',
          keywords: ['starbucks', 'coffee', 'food and drink'],
        },
        { id: 'cat-groceries', keywords: ['grocery', 'whole foods'] },
      ],
    };
    expect(matchCategory('STARBUCKS #12345', input2)).toBe('cat-restaurants');
  });

  it('returns null for unknown', () => {
    expect(matchCategory('Unknown Category', input)).toBeNull();
  });
});
