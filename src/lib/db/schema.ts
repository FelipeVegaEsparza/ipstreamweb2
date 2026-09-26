import { sql } from 'drizzle-orm';
import { index, integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

const timestamps = {
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
};

export const planCategories = sqliteTable(
  'plan_categories',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    description: text('description'),
    icon: text('icon'),
    displayOrder: integer('display_order').notNull().default(0),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
    ...timestamps,
  },
  (table) => [index('idx_plan_categories_display_order').on(table.displayOrder)],
);

export const plans = sqliteTable(
  'plans',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    planKey: text('plan_key').notNull().unique(),
    planName: text('plan_name').notNull(),
    price: integer('price').notNull(),
    title: text('title'),
    icon: text('icon'),
    imageUrl: text('image_url'),
    description: text('description'),
    features: text('features', { mode: 'json' }).$type<string[]>(),
    monthlyPrice: integer('monthly_price'),
    annualPrice: integer('annual_price'),
    usdPrice: real('usd_price'),
    billingNote: text('billing_note'),
    demoUrl: text('demo_url'),
    contractUrl: text('contract_url'),
    categoryId: integer('category_id').references(() => planCategories.id, { onDelete: 'set null' }),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
    ...timestamps,
  },
  (table) => [
    index('idx_plans_category').on(table.categoryId),
    index('idx_plans_active').on(table.isActive),
  ],
);

export const news = sqliteTable(
  'news',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    title: text('title').notNull(),
    slug: text('slug').notNull().unique(),
    excerpt: text('excerpt'),
    content: text('content').notNull(),
    image: text('image'),
    seoTitle: text('seo_title'),
    seoDescription: text('seo_description'),
    seoImage: text('seo_image'),
    author: text('author').notNull().default('IPStream'),
    publishedAt: text('published_at').notNull().default(sql`CURRENT_TIMESTAMP`),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
    ...timestamps,
  },
  (table) => [
    index('idx_news_published_at').on(table.publishedAt),
    index('idx_news_active').on(table.isActive),
  ],
);

export const tutorialCategories = sqliteTable(
  'tutorial_categories',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    color: text('color').notNull().default('blue'),
    displayOrder: integer('display_order').notNull().default(0),
    ...timestamps,
  },
  (table) => [index('idx_tutorial_categories_display_order').on(table.displayOrder)],
);

export const tutorials = sqliteTable(
  'tutorials',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    categoryId: integer('category_id')
      .notNull()
      .references(() => tutorialCategories.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    slug: text('slug').notNull().unique(),
    description: text('description'),
    videoUrl: text('video_url'),
    duration: text('duration'),
    difficulty: text('difficulty', { enum: ['beginner', 'intermediate', 'advanced'] }).notNull().default('beginner'),
    displayOrder: integer('display_order').notNull().default(0),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
    views: integer('views').notNull().default(0),
    ...timestamps,
  },
  (table) => [
    index('idx_tutorials_category').on(table.categoryId),
    index('idx_tutorials_active').on(table.isActive),
    index('idx_tutorials_display_order').on(table.displayOrder),
  ],
);

export const clientPortfolio = sqliteTable(
  'client_portfolio',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    title: text('title').notNull(),
    slug: text('slug').notNull(),
    description: text('description'),
    imageUrl: text('image_url'),
    projectUrl: text('project_url'),
    displayOrder: integer('display_order').notNull().default(0),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
    ...timestamps,
  },
  (table) => [index('idx_client_portfolio_display_order').on(table.displayOrder)],
);

export const communityRadios = sqliteTable(
  'community_radios',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    slug: text('slug').unique(),
    description: text('description'),
    logoUrl: text('logo_url'),
    siteUrl: text('site_url').notNull(),
    displayOrder: integer('display_order').notNull().default(0),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
    ...timestamps,
  },
  (table) => [
    index('idx_community_radios_active').on(table.isActive),
    index('idx_community_radios_display_order').on(table.displayOrder),
  ],
);

export const contactMessages = sqliteTable(
  'contact_messages',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    email: text('email').notNull(),
    phone: text('phone'),
    subject: text('subject'),
    message: text('message').notNull(),
    isRead: integer('is_read', { mode: 'boolean' }).notNull().default(false),
    ...timestamps,
  },
  (table) => [
    index('idx_contact_messages_created_at').on(table.createdAt),
    index('idx_contact_messages_read').on(table.isRead),
  ],
);

export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value'),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export type Plan = typeof plans.$inferSelect;
export type NewPlan = typeof plans.$inferInsert;
export type PlanCategory = typeof planCategories.$inferSelect;
export type NewsItem = typeof news.$inferSelect;
export type Tutorial = typeof tutorials.$inferSelect;
export type TutorialCategory = typeof tutorialCategories.$inferSelect;
export type PortfolioItem = typeof clientPortfolio.$inferSelect;
export type CommunityRadio = typeof communityRadios.$inferSelect;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type Setting = typeof settings.$inferSelect;
