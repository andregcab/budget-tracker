import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CategoriesService } from '../categories/categories.service';
import { externalId, parseBankCsv, ParsedRow } from './bank-csv.parser';
import { matchCategory, type CategoryMatchInput } from './category-matcher';

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

    const categoryByName = new Map<string, string>();
    const categoriesWithKeywords: { id: string; keywords: string[] }[] = [];
    const loadCategories = async () => {
      // Use only user categories so transactions get user IDs and match the dropdown
      const list = await this.prisma.category.findMany({
        where: { userId, isActive: true },
        select: { id: true, name: true, keywords: true },
        orderBy: { name: 'asc' },
      });
      list.forEach((c) => categoryByName.set(c.name.toLowerCase(), c.id));
      list.forEach((c) => {
        const explicit = c.keywords?.filter((k) => k?.trim()) ?? [];
        const effective = [
          ...new Set(explicit.map((k) => k.toLowerCase().trim())),
        ].filter(Boolean);
        categoriesWithKeywords.push({ id: c.id, keywords: effective });
      });
    };
    await loadCategories();

    const matchInput: CategoryMatchInput = {
      categoryByName,
      categoriesWithKeywords,
    };

    const uncategorizedId =
      categoryByName.get('uncategorized') ??
      (await this.prisma.category
        .findFirst({
          where: { name: 'Uncategorized', isActive: true },
          select: { id: true },
        })
        .then((c) => c?.id ?? null)) ??
      null;

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
        if (row.category) {
          categoryId = matchCategory(row.category, matchInput);
        }
        if (!categoryId) {
          categoryId = matchCategory(row.description, matchInput);
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
