import { sql } from 'drizzle-orm';
import { createDatabase } from '../src/lib/db/client';
import {
  clientPortfolio,
  communityRadios,
  news,
  planCategories,
  plans,
  tutorialCategories,
} from '../src/lib/db/schema';
import { downloadImage, type ImageContext } from '../src/lib/migration/images';
import { fetchSourceData } from '../src/lib/migration/source';
import {
  upsertCommunity,
  upsertNews,
  upsertPlan,
  upsertPlanCategory,
  upsertPortfolio,
  upsertTutorialCategory,
  type UpsertAction,
} from '../src/lib/migration/upsert';

const site = process.env.SOURCE_SITE ?? 'https://ipstream.cl';
const dbPath = process.env.DATABASE_PATH ?? './data/app.db';
const uploadsDir = process.env.UPLOADS_DIR ?? './uploads';

interface Counter {
  inserted: number;
  updated: number;
}

function count(counter: Counter, action: UpsertAction): void {
  counter[action] += 1;
}

function formatCounter(label: string, counter: Counter): string {
  return `  ${label.padEnd(20)} insertados: ${counter.inserted}, actualizados: ${counter.updated}`;
}

async function main(): Promise<void> {
  console.log(`Migrando contenido desde ${site} hacia ${dbPath}`);
  const { db, sqlite } = createDatabase(dbPath);
  const imageContext: ImageContext = { site, uploadsDir };

  const source = await fetchSourceData(site);
  console.log(
    `Origen: ${source.categories.length} categorias, ${source.plans.length} planes, ${source.news.length} noticias, ` +
      `${source.tutorialCategories.length} categorias de tutoriales, ${source.portfolio.length} clientes, ` +
      `${source.community.length} radios de comunidad`,
  );

  const counters = {
    planCategories: { inserted: 0, updated: 0 } as Counter,
    plans: { inserted: 0, updated: 0 } as Counter,
    news: { inserted: 0, updated: 0 } as Counter,
    tutorialCategories: { inserted: 0, updated: 0 } as Counter,
    portfolio: { inserted: 0, updated: 0 } as Counter,
    community: { inserted: 0, updated: 0 } as Counter,
  };
  const imageWarnings: string[] = [];

  const categoryIdBySlug = new Map<string, number>();
  for (const category of source.categories) {
    const { row, action } = upsertPlanCategory(db, category);
    categoryIdBySlug.set(category.slug, row.id);
    count(counters.planCategories, action);
  }

  for (const plan of source.plans) {
    const image = await downloadImage(plan.imageUrl, imageContext);
    if (plan.imageUrl && !image) imageWarnings.push(`plan ${plan.planKey}: ${plan.imageUrl}`);
    const categoryId = plan.categorySlug ? categoryIdBySlug.get(plan.categorySlug) ?? null : null;
    const { action } = upsertPlan(db, plan, categoryId, image);
    count(counters.plans, action);
  }

  for (const article of source.news) {
    const image = await downloadImage(article.image, imageContext);
    if (article.image && !image) imageWarnings.push(`noticia ${article.slug}: ${article.image}`);
    const { action } = upsertNews(db, article, image);
    count(counters.news, action);
  }

  for (const category of source.tutorialCategories) {
    const { action } = upsertTutorialCategory(db, category);
    count(counters.tutorialCategories, action);
  }

  for (const item of source.portfolio) {
    const image = await downloadImage(item.imageUrl, imageContext);
    if (item.imageUrl && !image) imageWarnings.push(`cliente ${item.title}: ${item.imageUrl}`);
    const { action } = upsertPortfolio(db, item, image);
    count(counters.portfolio, action);
  }

  for (const radio of source.community) {
    const logo = await downloadImage(radio.logoUrl, imageContext);
    if (radio.logoUrl && !logo) imageWarnings.push(`comunidad ${radio.name}: ${radio.logoUrl}`);
    const { action } = upsertCommunity(db, radio, logo);
    count(counters.community, action);
  }

  const totals = {
    planCategories: db.select({ n: sql<number>`count(*)` }).from(planCategories).get()?.n ?? 0,
    plans: db.select({ n: sql<number>`count(*)` }).from(plans).get()?.n ?? 0,
    news: db.select({ n: sql<number>`count(*)` }).from(news).get()?.n ?? 0,
    tutorialCategories: db.select({ n: sql<number>`count(*)` }).from(tutorialCategories).get()?.n ?? 0,
    portfolio: db.select({ n: sql<number>`count(*)` }).from(clientPortfolio).get()?.n ?? 0,
    community: db.select({ n: sql<number>`count(*)` }).from(communityRadios).get()?.n ?? 0,
  };

  console.log('\nReporte de migracion');
  console.log(formatCounter('Categorias de plan', counters.planCategories));
  console.log(formatCounter('Planes', counters.plans));
  console.log(formatCounter('Noticias', counters.news));
  console.log(formatCounter('Categorias tutorial', counters.tutorialCategories));
  console.log(formatCounter('Clientes (portafolio)', counters.portfolio));
  console.log(formatCounter('Comunidad', counters.community));
  console.log('\nTotales en base de datos');
  for (const [label, value] of Object.entries(totals)) {
    console.log(`  ${label.padEnd(20)} ${value}`);
  }
  if (imageWarnings.length > 0) {
    console.warn(`\nImagenes no descargadas (${imageWarnings.length}):`);
    for (const warning of imageWarnings) console.warn(`  - ${warning}`);
  }
  sqlite.close();
}

main().catch((error: unknown) => {
  console.error('La migracion fallo:', error instanceof Error ? error.message : error);
  process.exit(1);
});
