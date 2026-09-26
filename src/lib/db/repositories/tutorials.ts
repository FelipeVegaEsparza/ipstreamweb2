import { asc, eq } from 'drizzle-orm';
import { z } from 'zod';
import type { AppDatabase } from '../client';
import { ValidationError } from '../errors';
import {
  tutorialCategories,
  tutorials,
  type Tutorial,
  type TutorialCategory,
} from '../schema';

export interface ListOptions {
  activeOnly?: boolean;
}

const categoryInput = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  slug: z.string().min(1).optional(),
  color: z.string().default('blue'),
  displayOrder: z.number().int().default(0),
});

const tutorialInput = z.object({
  categoryId: z.number().int(),
  title: z.string().min(1, 'El titulo es obligatorio'),
  slug: z.string().min(1).optional(),
  description: z.string().nullish(),
  videoUrl: z.string().nullish(),
  duration: z.string().nullish(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
  displayOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
  views: z.number().int().nonnegative().default(0),
});

export type TutorialInput = z.input<typeof tutorialInput>;
export type TutorialCategoryInput = z.input<typeof categoryInput>;

export function listTutorialCategories(db: AppDatabase): TutorialCategory[] {
  return db
    .select()
    .from(tutorialCategories)
    .orderBy(asc(tutorialCategories.displayOrder), asc(tutorialCategories.id))
    .all();
}

export function listTutorials(db: AppDatabase, options: ListOptions = {}): Tutorial[] {
  return db
    .select()
    .from(tutorials)
    .where(options.activeOnly ? eq(tutorials.isActive, true) : undefined)
    .orderBy(asc(tutorials.displayOrder), asc(tutorials.id))
    .all();
}

export function listTutorialsGroupedByCategory(
  db: AppDatabase,
  options: ListOptions = {},
): Array<{ category: TutorialCategory; tutorials: Tutorial[] }> {
  const categories = listTutorialCategories(db);
  const rows = listTutorials(db, options);
  return categories
    .map((category) => ({
      category,
      tutorials: rows.filter((tutorial) => tutorial.categoryId === category.id),
    }))
    .filter((group) => group.tutorials.length > 0);
}

function assertCategoryExists(db: AppDatabase, categoryId: number): void {
  const category = db
    .select()
    .from(tutorialCategories)
    .where(eq(tutorialCategories.id, categoryId))
    .get();
  if (!category) throw new ValidationError('La categoria de tutorial no existe', 'categoryId');
}

export function createTutorial(db: AppDatabase, input: TutorialInput): Tutorial {
  const data = tutorialInput.parse(input);
  assertCategoryExists(db, data.categoryId);
  const slug = data.slug?.trim() || data.title;
  const existing = db.select().from(tutorials).where(eq(tutorials.slug, slug)).get();
  if (existing) throw new ValidationError('Ya existe un tutorial con ese slug', 'slug');
  return db
    .insert(tutorials)
    .values({ ...data, slug })
    .returning()
    .get();
}

export function updateTutorial(db: AppDatabase, id: number, input: Partial<TutorialInput>): Tutorial {
  const data = tutorialInput.partial().parse(input);
  if (data.categoryId != null) assertCategoryExists(db, data.categoryId);
  return db.update(tutorials).set(data).where(eq(tutorials.id, id)).returning().get();
}

export function setTutorialActive(db: AppDatabase, id: number, isActive: boolean): Tutorial {
  return db.update(tutorials).set({ isActive }).where(eq(tutorials.id, id)).returning().get();
}

export function deleteTutorial(db: AppDatabase, id: number): void {
  db.delete(tutorials).where(eq(tutorials.id, id)).run();
}

export function createTutorialCategory(db: AppDatabase, input: TutorialCategoryInput): TutorialCategory {
  const data = categoryInput.parse(input);
  const slug = data.slug?.trim() || data.name;
  const existing = db.select().from(tutorialCategories).where(eq(tutorialCategories.slug, slug)).get();
  if (existing) throw new ValidationError('Ya existe una categoria con ese slug', 'slug');
  return db
    .insert(tutorialCategories)
    .values({ ...data, slug })
    .returning()
    .get();
}

export function updateTutorialCategory(
  db: AppDatabase,
  id: number,
  input: Partial<TutorialCategoryInput>,
): TutorialCategory {
  const data = categoryInput.partial().parse(input);
  return db.update(tutorialCategories).set(data).where(eq(tutorialCategories.id, id)).returning().get();
}

export function deleteTutorialCategory(db: AppDatabase, id: number): void {
  db.delete(tutorialCategories).where(eq(tutorialCategories.id, id)).run();
}
