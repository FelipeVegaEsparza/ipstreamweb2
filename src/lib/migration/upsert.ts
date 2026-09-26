import { eq } from 'drizzle-orm';
import type { AppDatabase } from '../db/client';
import {
  clientPortfolio,
  communityRadios,
  news,
  planCategories,
  plans,
  tutorialCategories,
  type CommunityRadio,
  type NewsItem,
  type Plan,
  type PlanCategory,
  type PortfolioItem,
  type TutorialCategory,
} from '../db/schema';
import { slugify } from '../utils/slug';
import type {
  SourceCategory,
  SourceCommunity,
  SourceNews,
  SourcePlan,
  SourcePortfolio,
  SourceTutorialCategory,
} from './source';

export type UpsertAction = 'inserted' | 'updated';

export interface UpsertResult<T> {
  row: T;
  action: UpsertAction;
}

export function upsertPlanCategory(db: AppDatabase, category: SourceCategory): UpsertResult<PlanCategory> {
  const existing = db.select().from(planCategories).where(eq(planCategories.slug, category.slug)).get();
  if (existing) {
    const row = db
      .update(planCategories)
      .set({
        name: category.name,
        description: category.description,
        icon: category.icon,
        displayOrder: category.displayOrder,
      })
      .where(eq(planCategories.id, existing.id))
      .returning()
      .get();
    return { row, action: 'updated' };
  }
  const row = db
    .insert(planCategories)
    .values({
      slug: category.slug,
      name: category.name,
      description: category.description,
      icon: category.icon,
      displayOrder: category.displayOrder,
      isActive: true,
    })
    .returning()
    .get();
  return { row, action: 'inserted' };
}

export function upsertPlan(
  db: AppDatabase,
  plan: SourcePlan,
  categoryId: number | null,
  imageUrl: string | null,
): UpsertResult<Plan> {
  const values = {
    planKey: plan.planKey,
    planName: plan.planName,
    price: plan.price,
    title: plan.title,
    icon: plan.icon,
    imageUrl,
    description: plan.description,
    features: plan.features,
    monthlyPrice: plan.monthlyPrice,
    annualPrice: plan.annualPrice,
    billingNote: plan.billingNote,
    demoUrl: plan.demoUrl,
    categoryId,
    isActive: plan.isActive,
  };
  const existing = db.select().from(plans).where(eq(plans.planKey, plan.planKey)).get();
  if (existing) {
    const row = db.update(plans).set(values).where(eq(plans.id, existing.id)).returning().get();
    return { row, action: 'updated' };
  }
  const row = db.insert(plans).values(values).returning().get();
  return { row, action: 'inserted' };
}

export function upsertNews(db: AppDatabase, item: SourceNews, imageUrl: string | null): UpsertResult<NewsItem> {
  const values = {
    title: item.title,
    slug: item.slug,
    excerpt: item.excerpt,
    content: item.content,
    image: imageUrl,
    author: item.author,
    publishedAt: item.publishedAt || undefined,
    isActive: item.isActive,
  };
  const existing = db.select().from(news).where(eq(news.slug, item.slug)).get();
  if (existing) {
    const row = db.update(news).set(values).where(eq(news.id, existing.id)).returning().get();
    return { row, action: 'updated' };
  }
  const row = db.insert(news).values(values).returning().get();
  return { row, action: 'inserted' };
}

export function upsertTutorialCategory(
  db: AppDatabase,
  category: SourceTutorialCategory,
): UpsertResult<TutorialCategory> {
  const existing = db
    .select()
    .from(tutorialCategories)
    .where(eq(tutorialCategories.slug, category.slug))
    .get();
  if (existing) {
    const row = db
      .update(tutorialCategories)
      .set({ name: category.name, color: category.color, displayOrder: category.displayOrder })
      .where(eq(tutorialCategories.id, existing.id))
      .returning()
      .get();
    return { row, action: 'updated' };
  }
  const row = db.insert(tutorialCategories).values(category).returning().get();
  return { row, action: 'inserted' };
}

export function upsertPortfolio(
  db: AppDatabase,
  item: SourcePortfolio,
  imageUrl: string | null,
): UpsertResult<PortfolioItem> {
  const existing = db.select().from(clientPortfolio).where(eq(clientPortfolio.title, item.title)).get();
  const values = {
    title: item.title,
    slug: slugify(item.title),
    description: item.description,
    imageUrl,
    projectUrl: item.projectUrl,
    isActive: true,
  };
  if (existing) {
    const row = db.update(clientPortfolio).set(values).where(eq(clientPortfolio.id, existing.id)).returning().get();
    return { row, action: 'updated' };
  }
  const row = db.insert(clientPortfolio).values(values).returning().get();
  return { row, action: 'inserted' };
}

export function upsertCommunity(
  db: AppDatabase,
  item: SourceCommunity,
  logoUrl: string | null,
): UpsertResult<CommunityRadio> {
  const existing = db.select().from(communityRadios).where(eq(communityRadios.name, item.name)).get();
  const values = {
    name: item.name,
    slug: slugify(item.name),
    description: item.description,
    logoUrl,
    siteUrl: item.siteUrl,
    isActive: true,
  };
  if (existing) {
    const row = db.update(communityRadios).set(values).where(eq(communityRadios.id, existing.id)).returning().get();
    return { row, action: 'updated' };
  }
  const row = db.insert(communityRadios).values(values).returning().get();
  return { row, action: 'inserted' };
}
