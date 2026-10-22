import type { TranslationKey } from './i18n'

export const SITE = {
  name: 'CasterFly',
  tagline: 'Radio profesional asistida por IA',
  url: (process.env.SITE_URL ?? 'https://casterfly.com').replace(/\/$/, ''),
  panelUrl: 'https://panel.casterfly.com/',
  email: 'contacto@casterfly.com',
} as const;


export interface NavItem {
  key: TranslationKey;
  href: string;
}

export const NAV: NavItem[] = [
  { key: 'nav.home', href: '/' },
  { key: 'nav.ia', href: '/ia' },
  { key: 'nav.plans', href: '/planes' },
  { key: 'nav.features', href: '/caracteristicas' },
  { key: 'nav.tutorials', href: '/tutoriales' },
  { key: 'nav.news', href: '/noticias' },
  { key: 'nav.clients', href: '/clientes' },
];

export const SOCIAL_LABELS: Record<string, string> = {
  social_facebook: 'Facebook',
  social_twitter: 'X',
  social_instagram: 'Instagram',
  social_youtube: 'YouTube',
  social_tiktok: 'TikTok',
};
