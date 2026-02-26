import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CategoriesService } from '../categories/categories.service';
import { externalId, parseBankCsv, ParsedRow } from './bank-csv.parser';

export interface ImportResult {
  jobId: string;
  imported: number;
  skipped: number;
  errors: number;
  message?: string;
}

@Injectable()
export class ImportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly categoriesService: CategoriesService,
  ) {}

  async importFromCsv(
    userId: string,
    accountId: string,
    filename: string,
    buffer: Buffer,
  ): Promise<ImportResult> {
    const account = await this.prisma.account.findFirst({
      where: { id: accountId, userId },
    });
    if (!account) {
      throw new BadRequestException('Account not found');
    }

    let rows: ParsedRow[];
    try {
      rows = parseBankCsv(buffer.toString('utf-8'));
    } catch (e) {
      throw new BadRequestException(
        e instanceof Error ? e.message : 'Invalid CSV format',
      );
    }

    const job = await this.prisma.importJob.create({
      data: {
        userId,
        accountId,
        filename,
        status: 'processing',
      },
    });

    await this.categoriesService.ensureUserCategories(userId);

    let imported = 0;
    let skipped = 0;
    let errors = 0;

    const uncategorizedId = await this.prisma.category
      .findFirst({
        where: { name: 'Uncategorized', userId: null, isActive: true },
        select: { id: true },
      })
      .then((c) => c?.id ?? null);

    const categoryByName = new Map<string, string>();
    const categoriesWithKeywords: { id: string; keywords: string[] }[] = [];
    const loadCategories = async () => {
      const list = await this.prisma.category.findMany({
        where: {
          isActive: true,
          OR: [{ userId: null }, { userId }],
        },
        select: { id: true, name: true, keywords: true },
        orderBy: { userId: 'desc' },
      });
      list.forEach((c) => categoryByName.set(c.name.toLowerCase(), c.id));
      list.forEach((c) => {
        const explicit = c.keywords?.filter((k) => k?.trim()) ?? [];
        const nameLower = c.name.toLowerCase().trim();
        const effective = [
          ...new Set([
            nameLower,
            ...explicit.map((k) => k.toLowerCase().trim()),
          ]),
        ].filter(Boolean);
        categoriesWithKeywords.push({ id: c.id, keywords: effective });
      });
    };
    await loadCategories();

    function matchCategoryByKeyword(text: string): string | null {
      if (!text?.trim()) return null;
      const textLower = text.toLowerCase();
      for (const cat of categoriesWithKeywords) {
        for (const kw of cat.keywords) {
          if (!kw?.trim()) continue;
          const kwLower = kw.toLowerCase();
          const matches =
            textLower.includes(kwLower) || kwLower.includes(textLower);
          if (matches) return cat.id;
        }
      }
      return null;
    }

    try {
      for (const row of rows) {
        const extId = externalId(accountId, row);
        const existing = await this.prisma.transaction.findUnique({
          where: { accountId_externalId: { accountId, externalId: extId } },
        });
        if (existing) {
          skipped++;
          continue;
        }

        let categoryId: string | null = null;
        categoryId = matchCategoryByKeyword(row.description);
        if (!categoryId && row.category) {
          // Exact name match first (pre-keywords behavior); keyword match for fuzzy mapping (e.g. "Food & Drink" → Restaurants)
          categoryId =
            categoryByName.get(row.category.toLowerCase().trim()) ??
            matchCategoryByKeyword(row.category) ??
            uncategorizedId;
        }
        if (!categoryId) categoryId = uncategorizedId;

        try {
          await this.prisma.transaction.create({
            data: {
              userId,
              accountId,
              date: row.date,
              description: row.description,
              amount: row.amount,
              type:
                row.type || (parseFloat(row.amount) >= 0 ? 'credit' : 'debit'),
              balanceAfter: row.balance ? parseAmount(row.balance) : null,
              categoryId,
              externalId: extId,
            },
          });
          imported++;
        } catch {
          errors++;
        }
      }

      await this.prisma.importJob.update({
        where: { id: job.id },
        data: {
          status: 'completed',
          completedAt: new Date(),
          summary: {
            imported,
            skipped,
            errors,
            total: rows.length,
          },
        },
      });
    } catch (e) {
      await this.prisma.importJob.update({
        where: { id: job.id },
        data: {
          status: 'failed',
          completedAt: new Date(),
          summary: { imported, skipped, errors, total: rows.length },
        },
      });
      throw e;
    }

    return {
      jobId: job.id,
      imported,
      skipped,
      errors,
    };
  }

  async listJobs(userId: string) {
    return this.prisma.importJob.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        account: { select: { id: true, name: true } },
      },
    });
  }
}

function parseAmount(value: string): string {
  const cleaned = value.replace(/[$,]/g, '').trim();
  const num = parseFloat(cleaned);
  return Number.isNaN(num) ? '0' : num.toFixed(2);
}
