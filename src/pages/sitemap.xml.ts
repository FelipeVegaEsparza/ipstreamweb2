import type { APIRoute } from 'astro';
import { getDatabase } from '../lib/db/client';
import { listNewsSlugs } from '../lib/db/repositories/news';
import { getSitemapExtra, getSitemapIncludeNews, SEO_PAGES } from '../lib/seo';
import { SITE } from '../lib/site';
import { localizedPath } from '../lib/i18n';

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

  const alternates = (path: string) =>
    `\n    <xhtml:link rel="alternate" hreflang="es" href="${SITE.url}${localizedPath('es', path)}" />` +
    `\n    <xhtml:link rel="alternate" hreflang="en" href="${SITE.url}${localizedPath('en', path)}" />` +
    `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE.url}${localizedPath('es', path)}" />`;

  const urls = [...paths]
    .flatMap((path) =>
      (['es', 'en'] as const).map(
        (locale) =>
          `  <url>\n    <loc>${SITE.url}${localizedPath(locale, path)}</loc>${alternates(path)}\n  </url>`
      )
    )
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`;

  return new Response(xml, {
    headers: { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'no-store' },
  });
};
