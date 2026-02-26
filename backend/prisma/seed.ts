import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

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

async function main() {
  const existing = await prisma.category.count({ where: { userId: null } });
  if (existing > 0) {
    console.log('Default categories already seeded, skipping.');
    return;
  }
  await prisma.category.createMany({
    data: DEFAULT_CATEGORIES.map((name) => ({
      userId: null,
      name,
      isDefault: true,
      isActive: true,
    })),
  });
  console.log(`Seeded ${DEFAULT_CATEGORIES.length} default categories.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    void prisma.$disconnect();
    process.exit(1);
  });
