import { and, asc, desc, eq, like } from 'drizzle-orm';
import { z } from 'zod';
import type { AppDatabase } from '../client';
import { ValidationError } from '../errors';
import { news, type NewsItem } from '../schema';

const newsInput = z.object({
  title: z.string().min(1, 'El titulo es obligatorio'),
  slug: z.string().min(1).optional(),
  excerpt: z.string().nullish(),
  content: z.string().min(1, 'El contenido es obligatorio'),
  image: z.string().nullish(),
  author: z.string().min(1).default('IPStream'),
  publishedAt: z.string().min(1).optional(),
  isActive: z.boolean().default(true),
});

export type NewsInput = z.input<typeof newsInput>;

export interface ListNewsOptions {
  activeOnly?: boolean;
  limit?: number;
  offset?: number;
}

export function listNews(db: AppDatabase, options: ListNewsOptions = {}): NewsItem[] {
  return db
    .select()
    .from(news)
    .where(options.activeOnly ? eq(news.isActive, true) : undefined)
    .orderBy(desc(news.publishedAt), desc(news.id))
    .limit(options.limit ?? -1)
    .offset(options.offset ?? 0)
    .all();
}

export function countNews(db: AppDatabase, options: ListNewsOptions = {}): number {
  const rows = db
    .select({ id: news.id })
    .from(news)
    .where(options.activeOnly ? eq(news.isActive, true) : undefined)
    .all();
  return rows.length;
}

export function getNewsBySlug(db: AppDatabase, slug: string, options: ListNewsOptions = {}): NewsItem | undefined {
  const conditions = [eq(news.slug, slug)];
  if (options.activeOnly) conditions.push(eq(news.isActive, true));
  return db
    .select()
    .from(news)
    .where(and(...conditions))
    .get();
}

export function getNewsById(db: AppDatabase, id: number): NewsItem | undefined {
  return db.select().from(news).where(eq(news.id, id)).get();
}

export function findNewsByTitle(db: AppDatabase, title: string): NewsItem | undefined {
  return db.select().from(news).where(like(news.title, title)).get();
}

export function createNews(db: AppDatabase, input: NewsInput): NewsItem {
  const data = newsInput.parse(input);
  const slug = data.slug?.trim() || data.title;
  if (!slug) throw new ValidationError('El slug es obligatorio', 'slug');
  const existing = getNewsBySlug(db, slug);
  if (existing) throw new ValidationError('Ya existe una noticia con ese slug', 'slug');
  return db
    .insert(news)
    .values({ ...data, slug })
    .returning()
    .get();
}

export function updateNews(db: AppDatabase, id: number, input: Partial<NewsInput>): NewsItem {
  const data = newsInput.partial().parse(input);
  const current = getNewsById(db, id);
  if (!current) throw new ValidationError('La noticia no existe');
  if (data.slug && data.slug !== current.slug) {
    const existing = getNewsBySlug(db, data.slug);
    if (existing) throw new ValidationError('Ya existe una noticia con ese slug', 'slug');
  }
  return db.update(news).set(data).where(eq(news.id, id)).returning().get();
}

export function setNewsActive(db: AppDatabase, id: number, isActive: boolean): NewsItem {
  return db.update(news).set({ isActive }).where(eq(news.id, id)).returning().get();
}

export function deleteNews(db: AppDatabase, id: number): void {
  db.delete(news).where(eq(news.id, id)).run();
}

export function listNewsSlugs(db: AppDatabase, options: ListNewsOptions = {}): string[] {
  return db
    .select({ slug: news.slug })
    .from(news)
    .where(options.activeOnly ? eq(news.isActive, true) : undefined)
    .orderBy(asc(news.slug))
    .all()
    .map((row) => row.slug);
}
