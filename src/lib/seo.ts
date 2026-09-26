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
