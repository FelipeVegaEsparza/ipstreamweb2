import type { APIRoute } from 'astro';
import { getDatabase } from '../lib/db/client';
import { listNewsSlugs } from '../lib/db/repositories/news';
import { getSitemapExtra, getSitemapIncludeNews, SEO_PAGES } from '../lib/seo';
import { SITE } from '../lib/site';

export const prerender = false;

export const GET: APIRoute = () => {
  const db = getDatabase();
  const paths = new Set<string>(SEO_PAGES.map((page) => page.path));

  if (getSitemapIncludeNews(db)) {
    for (const slug of listNewsSlugs(db, { activeOnly: true })) {
      paths.add(`/noticias/${slug}`);
    }
  }

  for (const extra of getSitemapExtra(db)) {
    paths.add(extra.startsWith('/') ? extra : `/${extra}`);
  }

  const urls = [...paths]
    .map((path) => `  <url>\n    <loc>${SITE.url}${path}</loc>\n  </url>`)
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

  return new Response(xml, {
    headers: { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'no-store' },
  });
};
