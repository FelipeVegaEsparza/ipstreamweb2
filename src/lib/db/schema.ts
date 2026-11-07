import { sql } from 'drizzle-orm';
import { index, integer, real, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

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
    author: text('author').notNull().default('CasterFly'),
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

export const analyticsSessions = sqliteTable(
  'analytics_sessions',
  {
    id: text('id').primaryKey(),
    visitorHash: text('visitor_hash').notNull(),
    startedAt: text('started_at').notNull().default(sql`CURRENT_TIMESTAMP`),
    lastSeenAt: text('last_seen_at').notNull().default(sql`CURRENT_TIMESTAMP`),
    landingPath: text('landing_path').notNull(),
    exitPath: text('exit_path'),
    pageviews: integer('pageviews').notNull().default(0),
    referrer: text('referrer'),
    utmSource: text('utm_source'),
    utmMedium: text('utm_medium'),
    utmCampaign: text('utm_campaign'),
    country: text('country'),
    region: text('region'),
    city: text('city'),
    device: text('device'),
    browser: text('browser'),
    os: text('os'),
    language: text('language'),
    screenWidth: integer('screen_width'),
    screenHeight: integer('screen_height'),
  },
  (table) => [
    index('idx_analytics_sessions_started').on(table.startedAt),
    index('idx_analytics_sessions_visitor').on(table.visitorHash),
    index('idx_analytics_sessions_landing').on(table.landingPath),
  ],
);

export const analyticsPageviews = sqliteTable(
  'analytics_pageviews',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    pageviewId: text('pageview_id').notNull().unique(),
    sessionId: text('session_id').notNull(),
    visitorHash: text('visitor_hash').notNull(),
    path: text('path').notNull(),
    title: text('title'),
    locale: text('locale'),
    referrer: text('referrer'),
    utmSource: text('utm_source'),
    utmMedium: text('utm_medium'),
    utmCampaign: text('utm_campaign'),
    country: text('country'),
    region: text('region'),
    city: text('city'),
    device: text('device'),
    browser: text('browser'),
    os: text('os'),
    language: text('language'),
    screenWidth: integer('screen_width'),
    screenHeight: integer('screen_height'),
    durationMs: integer('duration_ms').notNull().default(0),
    maxScrollDepth: integer('max_scroll_depth').notNull().default(0),
    createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index('idx_analytics_pageviews_created').on(table.createdAt),
    index('idx_analytics_pageviews_path').on(table.path),
    index('idx_analytics_pageviews_session').on(table.sessionId),
    index('idx_analytics_pageviews_visitor').on(table.visitorHash),
    index('idx_analytics_pageviews_country').on(table.country),
    index('idx_analytics_pageviews_device').on(table.device),
  ],
);

export const analyticsSectionViews = sqliteTable(
  'analytics_section_views',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    pageviewId: text('pageview_id').notNull(),
    sessionId: text('session_id').notNull(),
    visitorHash: text('visitor_hash').notNull(),
    path: text('path').notNull(),
    sectionKey: text('section_key').notNull(),
    sectionLabel: text('section_label'),
    durationMs: integer('duration_ms').notNull().default(0),
    maxVisibleRatio: real('max_visible_ratio').notNull().default(0),
    createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex('uniq_analytics_section_pageview').on(table.pageviewId, table.sectionKey),
    index('idx_analytics_sections_created').on(table.createdAt),
    index('idx_analytics_sections_key').on(table.sectionKey),
    index('idx_analytics_sections_path').on(table.path),
  ],
);

export const analyticsEvents = sqliteTable(
  'analytics_events',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    sessionId: text('session_id').notNull(),
    visitorHash: text('visitor_hash').notNull(),
    pageviewId: text('pageview_id'),
    name: text('name').notNull(),
    label: text('label'),
    path: text('path').notNull(),
    value: real('value'),
    metadata: text('metadata'),
    createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index('idx_analytics_events_created').on(table.createdAt),
    index('idx_analytics_events_name').on(table.name),
    index('idx_analytics_events_path').on(table.path),
    index('idx_analytics_events_session').on(table.sessionId),
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
export type AnalyticsSession = typeof analyticsSessions.$inferSelect;
export type AnalyticsPageview = typeof analyticsPageviews.$inferSelect;
export type AnalyticsSectionView = typeof analyticsSectionViews.$inferSelect;
export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type Setting = typeof settings.$inferSelect;
