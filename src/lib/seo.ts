import type { AppDatabase } from './db/client';
import { getSetting } from './db/repositories/settings';

export interface SeoSettings {
  siteName: string;
  defaultDescription: string;
  defaultImage: string;
  keywords: string;
  robots: string;
  googleVerification: string;
  analyticsId: string;
  twitterHandle: string;
}

export const SEO_KEYS = {
  siteName: 'seo_site_name',
  defaultDescription: 'seo_default_description',
  defaultImage: 'seo_default_image',
  keywords: 'seo_keywords',
  robots: 'seo_robots',
  googleVerification: 'seo_google_verification',
  analyticsId: 'seo_analytics_id',
  twitterHandle: 'seo_twitter_handle',
} as const;

export const ROBOTS_OPTIONS = [
  { value: 'index,follow', label: 'index, follow (recomendado)' },
  { value: 'index,nofollow', label: 'index, nofollow' },
  { value: 'noindex,follow', label: 'noindex, follow' },
  { value: 'noindex,nofollow', label: 'noindex, nofollow' },
];

export const DEFAULT_SEO: SeoSettings = {
  siteName: 'IPStream',
  defaultDescription:
    'Plataforma profesional para tu radio online: sitio web, reproductor, app PWA y panel de administración.',
  defaultImage: '/images/og-default.png',
  keywords: '',
  robots: 'index,follow',
  googleVerification: '',
  analyticsId: '',
  twitterHandle: '',
};

export interface SeoPageDef {
  key: string;
  label: string;
  path: string;
}

export const SEO_PAGES: SeoPageDef[] = [
  { key: 'home', label: 'Inicio', path: '/' },
  { key: 'planes', label: 'Planes', path: '/planes' },
  { key: 'caracteristicas', label: 'Características', path: '/caracteristicas' },
  { key: 'tutoriales', label: 'Tutoriales', path: '/tutoriales' },
  { key: 'noticias', label: 'Noticias', path: '/noticias' },
  { key: 'clientes', label: 'Clientes', path: '/clientes' },
  { key: 'comunidad', label: 'Comunidad', path: '/comunidad' },
  { key: 'soporte', label: 'Soporte', path: '/soporte' },
];

export interface PageSeo {
  title: string;
  description: string;
  image: string;
  noindex: boolean;
}

export function getPageSeo(db: AppDatabase, key: string): PageSeo {
  return {
    title: getSetting(db, `seo_page_${key}_title`, '') ?? '',
    description: getSetting(db, `seo_page_${key}_description`, '') ?? '',
    image: getSetting(db, `seo_page_${key}_image`, '') ?? '',
    noindex: getSetting(db, `seo_page_${key}_noindex`, '0') === '1',
  };
}

export const DEFAULT_ROBOTS_TXT =
  'User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: {SITE}/sitemap.xml\n';

export function getRobotsTxt(db: AppDatabase, siteUrl: string): string {
  const custom = (getSetting(db, 'seo_robots_txt', '') ?? '').trim();
  const base = custom !== '' ? custom : DEFAULT_ROBOTS_TXT;
  return base.replaceAll('{SITE}', siteUrl);
}

export function getSitemapExtra(db: AppDatabase): string[] {
  const raw = getSetting(db, 'seo_sitemap_extra', '') ?? '';
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

export function getSitemapIncludeNews(db: AppDatabase): boolean {
  return getSetting(db, 'seo_sitemap_include_news', '1') !== '0';
}

export function getSeoSettings(db: AppDatabase): SeoSettings {
  return {
    siteName: getSetting(db, SEO_KEYS.siteName, DEFAULT_SEO.siteName) || DEFAULT_SEO.siteName,
    defaultDescription:
      getSetting(db, SEO_KEYS.defaultDescription, DEFAULT_SEO.defaultDescription) || DEFAULT_SEO.defaultDescription,
    defaultImage: getSetting(db, SEO_KEYS.defaultImage, DEFAULT_SEO.defaultImage) || DEFAULT_SEO.defaultImage,
    keywords: getSetting(db, SEO_KEYS.keywords, '') ?? '',
    robots: getSetting(db, SEO_KEYS.robots, DEFAULT_SEO.robots) || DEFAULT_SEO.robots,
    googleVerification: getSetting(db, SEO_KEYS.googleVerification, '') ?? '',
    analyticsId: getSetting(db, SEO_KEYS.analyticsId, '') ?? '',
    twitterHandle: getSetting(db, SEO_KEYS.twitterHandle, '') ?? '',
  };
}
