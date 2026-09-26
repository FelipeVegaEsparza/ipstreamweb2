import { load } from 'cheerio';

export interface SourceCategory {
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  displayOrder: number;
}

export interface SourcePlan {
  planKey: string;
  planName: string;
  price: number;
  title: string | null;
  icon: string | null;
  imageUrl: string | null;
  description: string | null;
  features: string[];
  monthlyPrice: number | null;
  annualPrice: number | null;
  billingNote: string | null;
  demoUrl: string | null;
  categorySlug: string | null;
  isActive: boolean;
}

export interface SourceNews {
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  image: string | null;
  author: string;
  publishedAt: string;
  isActive: boolean;
}

export interface SourceTutorialCategory {
  name: string;
  slug: string;
  color: string;
  displayOrder: number;
}

export interface SourcePortfolio {
  title: string;
  imageUrl: string | null;
  projectUrl: string | null;
  description: string | null;
}

export interface SourceCommunity {
  name: string;
  logoUrl: string | null;
  siteUrl: string;
  description: string | null;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function str(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const result = String(value).trim();
  return result === '' ? null : result;
}

function num(value: unknown, fallback: number | null = null): number | null {
  if (value === null || value === undefined || value === '') return fallback;
  const result = Number(value);
  return Number.isFinite(result) ? result : fallback;
}

function bool(value: unknown, fallback = true): boolean {
  if (value === null || value === undefined) return fallback;
  return value === true || value === 1 || value === '1' || value === 'true';
}

function parseFeatures(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((item) => String(item));
  if (typeof value === 'string' && value.trim() !== '') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map((item) => String(item));
    } catch {
      return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }
  return [];
}

export function parsePlans(payload: unknown): { categories: SourceCategory[]; plans: SourcePlan[] } {
  const data = asRecord(payload);
  if (data.success === false) {
    throw new Error(`La API de planes devolvio un error: ${String(data.error ?? 'desconocido')}`);
  }
  const categories = asArray(data.categories).map((item) => {
    const category = asRecord(item);
    return {
      slug: String(category.slug ?? ''),
      name: String(category.name ?? ''),
      description: str(category.description),
      icon: str(category.icon),
      displayOrder: num(category.display_order, 0) ?? 0,
    } satisfies SourceCategory;
  });
  const plans = asArray(data.plans).map((item) => {
    const plan = asRecord(item);
    return {
      planKey: String(plan.plan_key ?? ''),
      planName: String(plan.plan_name ?? plan.title ?? ''),
      price: num(plan.price, 0) ?? 0,
      title: str(plan.title),
      icon: str(plan.icon),
      imageUrl: str(plan.image_url),
      description: str(plan.description),
      features: parseFeatures(plan.features),
      monthlyPrice: num(plan.monthly_price),
      annualPrice: num(plan.annual_price),
      billingNote: str(plan.billing_note),
      demoUrl: str(plan.demo_url),
      categorySlug: str(plan.category_slug),
      isActive: bool(plan.is_active),
    } satisfies SourcePlan;
  });
  return { categories, plans };
}

export function parseNews(payload: unknown): SourceNews[] {
  const data = asRecord(payload);
  return asArray(data.data).map((item) => {
    const article = asRecord(item);
    return {
      title: String(article.title ?? ''),
      slug: String(article.slug ?? ''),
      excerpt: str(article.excerpt),
      content: str(article.content) ?? str(article.excerpt) ?? '',
      image: str(article.image),
      author: str(article.author) ?? 'IPStream',
      publishedAt: str(article.published_at) ?? '',
      isActive: true,
    } satisfies SourceNews;
  });
}

export function parseNewsDetailHtml(html: string): string | null {
  const $ = load(html);
  const container = $('div.prose.prose-lg.max-w-none').first();
  if (container.length === 0) return null;
  const inner = container.html();
  return inner ? inner.trim() : null;
}

export function parseTutorialCategories(payload: unknown): SourceTutorialCategory[] {
  const data = asRecord(payload);
  return asArray(data.categories).map((item) => {
    const category = asRecord(item);
    return {
      name: String(category.name ?? ''),
      slug: String(category.slug ?? ''),
      color: str(category.color) ?? 'blue',
      displayOrder: num(category.display_order, 0) ?? 0,
    } satisfies SourceTutorialCategory;
  });
}

export function parsePortfolioHtml(html: string): SourcePortfolio[] {
  const $ = load(html);
  const items: SourcePortfolio[] = [];
  $('img[src*="/uploads/portfolio/"]').each((_, element) => {
    const img = $(element);
    const anchor = img.closest('a');
    const container = anchor.length > 0 ? anchor : img.parent();
    const description = container.find('p').first().text().trim();
    items.push({
      title: img.attr('alt')?.trim() || container.find('h3').first().text().trim(),
      imageUrl: img.attr('src') ?? null,
      projectUrl: anchor.attr('href') ?? null,
      description: description || null,
    });
  });
  return items.filter((item) => item.title !== '');
}

export function parseCommunityHtml(html: string): SourceCommunity[] {
  const $ = load(html);
  const items: SourceCommunity[] = [];
  $('img[src*="/uploads/community/"]').each((_, element) => {
    const img = $(element);
    let ancestor = img.parent();
    let siteUrl = '';
    for (let depth = 0; depth < 6 && ancestor.length > 0; depth += 1) {
      const link = ancestor.find('a[href^="http"]').first();
      if (link.length > 0) {
        siteUrl = link.attr('href') ?? '';
        break;
      }
      ancestor = ancestor.parent();
    }
    items.push({
      name: img.attr('alt')?.trim() || ancestor.find('h3').first().text().trim(),
      logoUrl: img.attr('src') ?? null,
      siteUrl,
      description: ancestor.find('p').first().text().trim() || null,
    });
  });
  return items.filter((item) => item.name !== '' && item.siteUrl !== '');
}

export async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url, { headers: { accept: 'application/json' } });
  if (!response.ok) {
    throw new Error(`GET ${url} respondio ${response.status}`);
  }
  return response.json();
}

export async function fetchText(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`GET ${url} respondio ${response.status}`);
  }
  return response.text();
}

export interface SourceData {
  categories: SourceCategory[];
  plans: SourcePlan[];
  news: SourceNews[];
  tutorialCategories: SourceTutorialCategory[];
  portfolio: SourcePortfolio[];
  community: SourceCommunity[];
}

export async function fetchSourceData(site: string): Promise<SourceData> {
  const base = site.replace(/\/$/, '');
  const [plansPayload, newsPayload, tutorialsPayload, portfolioHtml, communityHtml] = await Promise.all([
    fetchJson(`${base}/php/api/get-plans.php`),
    fetchJson(`${base}/api/news.php`),
    fetchJson(`${base}/php/api/get-tutorials.php`),
    fetchText(`${base}/clientes/`),
    fetchText(`${base}/comunidad/`),
  ]);

  const { categories, plans } = parsePlans(plansPayload);
  const news = parseNews(newsPayload);
  const tutorialCategories = parseTutorialCategories(tutorialsPayload);

  const newsWithContent = await Promise.all(
    news.map(async (item) => {
      if (!item.slug) return item;
      try {
        const detail = await fetchText(`${base}/noticias/?slug=${encodeURIComponent(item.slug)}`);
        const content = parseNewsDetailHtml(detail);
        return content ? { ...item, content } : item;
      } catch {
        return item;
      }
    }),
  );

  return {
    categories,
    plans,
    news: newsWithContent,
    tutorialCategories,
    portfolio: parsePortfolioHtml(portfolioHtml),
    community: parseCommunityHtml(communityHtml),
  };
}
