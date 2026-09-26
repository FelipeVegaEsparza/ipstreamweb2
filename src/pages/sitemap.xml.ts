import type { APIRoute } from 'astro';
import { SITE } from '../lib/site';

export const prerender = true;

const routes: Array<{ path: string; priority: string; changefreq: string }> = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/planes', priority: '0.9', changefreq: 'weekly' },
  { path: '/caracteristicas', priority: '0.8', changefreq: 'monthly' },
  { path: '/tutoriales', priority: '0.7', changefreq: 'weekly' },
  { path: '/noticias', priority: '0.7', changefreq: 'daily' },
  { path: '/clientes', priority: '0.5', changefreq: 'monthly' },
  { path: '/comunidad', priority: '0.6', changefreq: 'weekly' },
  { path: '/soporte', priority: '0.6', changefreq: 'monthly' },
];

export const GET: APIRoute = () => {
  const urls = routes
    .map(
      (route) =>
        `  <url>\n    <loc>${SITE.url}${route.path}</loc>\n    <priority>${route.priority}</priority>\n    <changefreq>${route.changefreq}</changefreq>\n  </url>`,
    )
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(xml, { headers: { 'content-type': 'application/xml; charset=utf-8' } });
};
