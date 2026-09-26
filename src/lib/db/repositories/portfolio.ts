import { asc, eq } from 'drizzle-orm';
import { z } from 'zod';
import type { AppDatabase } from '../client';
import { clientPortfolio, type PortfolioItem } from '../schema';

export interface ListOptions {
  activeOnly?: boolean;
}

const portfolioInput = z.object({
  title: z.string().min(1, 'El titulo es obligatorio'),
  slug: z.string().min(1).optional(),
  description: z.string().nullish(),
  imageUrl: z.string().nullish(),
  projectUrl: z.string().nullish(),
  displayOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export type PortfolioInput = z.input<typeof portfolioInput>;

export function listPortfolio(db: AppDatabase, options: ListOptions = {}): PortfolioItem[] {
  return db
    .select()
    .from(clientPortfolio)
    .where(options.activeOnly ? eq(clientPortfolio.isActive, true) : undefined)
    .orderBy(asc(clientPortfolio.displayOrder), asc(clientPortfolio.id))
    .all();
}

export function getPortfolioById(db: AppDatabase, id: number): PortfolioItem | undefined {
  return db.select().from(clientPortfolio).where(eq(clientPortfolio.id, id)).get();
}

export function createPortfolioItem(db: AppDatabase, input: PortfolioInput): PortfolioItem {
  const data = portfolioInput.parse(input);
  const slug = data.slug?.trim() || data.title;
  return db
    .insert(clientPortfolio)
    .values({ ...data, slug })
    .returning()
    .get();
}

export function updatePortfolioItem(
  db: AppDatabase,
  id: number,
  input: Partial<PortfolioInput>,
): PortfolioItem {
  const data = portfolioInput.partial().parse(input);
  return db.update(clientPortfolio).set(data).where(eq(clientPortfolio.id, id)).returning().get();
}

export function setPortfolioActive(db: AppDatabase, id: number, isActive: boolean): PortfolioItem {
  return db.update(clientPortfolio).set({ isActive }).where(eq(clientPortfolio.id, id)).returning().get();
}

export function deletePortfolioItem(db: AppDatabase, id: number): void {
  db.delete(clientPortfolio).where(eq(clientPortfolio.id, id)).run();
}
