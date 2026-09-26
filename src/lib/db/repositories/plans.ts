import { and, asc, eq, ne } from 'drizzle-orm';
import { z } from 'zod';
import type { AppDatabase } from '../client';
import { ValidationError } from '../errors';
import { planCategories, plans, type NewPlan, type Plan, type PlanCategory } from '../schema';

export interface ListOptions {
  activeOnly?: boolean;
}

const categoryInput = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  slug: z.string().min(1).optional(),
  description: z.string().nullish(),
  icon: z.string().nullish(),
  displayOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

const planInput = z.object({
  planKey: z.string().min(1, 'La clave es obligatoria'),
  planName: z.string().min(1, 'El nombre es obligatorio'),
  price: z.number().int().nonnegative(),
  title: z.string().nullish(),
  icon: z.string().nullish(),
  imageUrl: z.string().nullish(),
  description: z.string().nullish(),
  features: z.array(z.string()).default([]),
  monthlyPrice: z.number().int().nonnegative().nullish(),
  annualPrice: z.number().int().nonnegative().nullish(),
  usdPrice: z.number().nonnegative().nullish(),
  billingNote: z.string().nullish(),
  demoUrl: z.string().nullish(),
  contractUrl: z.string().nullish(),
  categoryId: z.number().int().nullish(),
  isActive: z.boolean().default(true),
});

export type PlanInput = z.input<typeof planInput>;
export type CategoryInput = z.input<typeof categoryInput>;

export interface PlanWithCategory {
  plan: Plan;
  category: PlanCategory | null;
}

export function listCategories(db: AppDatabase, options: ListOptions = {}): PlanCategory[] {
  return db
    .select()
    .from(planCategories)
    .where(options.activeOnly ? eq(planCategories.isActive, true) : undefined)
    .orderBy(asc(planCategories.displayOrder), asc(planCategories.id))
    .all();
}

export function listPlans(db: AppDatabase, options: ListOptions = {}): PlanWithCategory[] {
  return db
    .select({ plan: plans, category: planCategories })
    .from(plans)
    .leftJoin(planCategories, eq(plans.categoryId, planCategories.id))
    .where(options.activeOnly ? eq(plans.isActive, true) : undefined)
    .orderBy(asc(planCategories.displayOrder), asc(plans.id))
    .all();
}

const UNCATEGORIZED: PlanCategory = {
  id: 0,
  name: 'Planes',
  slug: 'planes',
  description: null,
  icon: null,
  displayOrder: Number.MAX_SAFE_INTEGER,
  isActive: true,
  createdAt: '',
  updatedAt: '',
};

export function listPlansGroupedByCategory(
  db: AppDatabase,
  options: ListOptions = {},
): Array<{ category: PlanCategory; plans: Plan[] }> {
  const categories = listCategories(db, options);
  const rows = listPlans(db, options);
  const activeCategoryIds = new Set(categories.map((category) => category.id));

  const groups = categories
    .map((category) => ({
      category,
      plans: rows.filter((row) => row.plan.categoryId === category.id).map((row) => row.plan),
    }))
    .filter((group) => group.plans.length > 0);

  const orphans = rows
    .filter((row) => row.plan.categoryId == null || !activeCategoryIds.has(row.plan.categoryId))
    .map((row) => row.plan);

  if (orphans.length > 0) {
    groups.push({ category: UNCATEGORIZED, plans: orphans });
  }

  return groups;
}

export function getPlanByKey(db: AppDatabase, planKey: string): Plan | undefined {
  return db.select().from(plans).where(eq(plans.planKey, planKey)).get();
}

export function getCategoryBySlug(db: AppDatabase, slug: string): PlanCategory | undefined {
  return db.select().from(planCategories).where(eq(planCategories.slug, slug)).get();
}

function assertCategoryExists(db: AppDatabase, categoryId: number): void {
  const category = db.select().from(planCategories).where(eq(planCategories.id, categoryId)).get();
  if (!category) {
    throw new ValidationError('La categoria indicada no existe', 'categoryId');
  }
}

function assertPlanKeyAvailable(db: AppDatabase, planKey: string, excludeId?: number): void {
  const existing = db
    .select()
    .from(plans)
    .where(excludeId ? and(eq(plans.planKey, planKey), ne(plans.id, excludeId)) : eq(plans.planKey, planKey))
    .get();
  if (existing) {
    throw new ValidationError('Ya existe un plan con esa clave', 'planKey');
  }
}

export function createPlan(db: AppDatabase, input: PlanInput): Plan {
  const data = planInput.parse(input);
  if (data.categoryId != null) assertCategoryExists(db, data.categoryId);
  assertPlanKeyAvailable(db, data.planKey);
  const values: NewPlan = { ...data, features: data.features ?? [] };
  return db.insert(plans).values(values).returning().get();
}

export function updatePlan(db: AppDatabase, id: number, input: Partial<PlanInput>): Plan {
  const data = planInput.partial().parse(input);
  const current = db.select().from(plans).where(eq(plans.id, id)).get();
  if (!current) throw new ValidationError('El plan no existe');
  if (data.categoryId != null) assertCategoryExists(db, data.categoryId);
  if (data.planKey) assertPlanKeyAvailable(db, data.planKey, id);
  return db.update(plans).set(data).where(eq(plans.id, id)).returning().get();
}

export function setPlanActive(db: AppDatabase, id: number, isActive: boolean): Plan {
  return db.update(plans).set({ isActive }).where(eq(plans.id, id)).returning().get();
}

export function deletePlan(db: AppDatabase, id: number): void {
  db.delete(plans).where(eq(plans.id, id)).run();
}

export function createCategory(db: AppDatabase, input: CategoryInput): PlanCategory {
  const data = categoryInput.parse(input);
  const slug = data.slug?.trim() || data.name;
  return db
    .insert(planCategories)
    .values({ ...data, slug })
    .returning()
    .get();
}

export function updateCategory(db: AppDatabase, id: number, input: Partial<CategoryInput>): PlanCategory {
  const data = categoryInput.partial().parse(input);
  return db.update(planCategories).set(data).where(eq(planCategories.id, id)).returning().get();
}

export function setCategoryActive(db: AppDatabase, id: number, isActive: boolean): PlanCategory {
  return db.update(planCategories).set({ isActive }).where(eq(planCategories.id, id)).returning().get();
}

export function deleteCategory(db: AppDatabase, id: number): void {
  const linked = db.select().from(plans).where(eq(plans.categoryId, id)).limit(1).get();
  if (linked) {
    throw new ValidationError('No se puede eliminar una categoria con planes asociados');
  }
  db.delete(planCategories).where(eq(planCategories.id, id)).run();
}
