export const SITE = {
  name: 'CasterFly',
  tagline: 'Radio profesional asistida por IA',
  url: (process.env.SITE_URL ?? 'https://casterfly.com').replace(/\/$/, ''),
  panelUrl: 'https://panel.casterfly.com/',
  email: 'contacto@casterfly.com',
} as const;

export interface NavItem {
  label: string;
  href: string;
}

export const NAV: NavItem[] = [
  { label: 'Inicio', href: '/' },
  { label: 'IA', href: '/ia' },
  { label: 'Planes', href: '/planes' },
  { label: 'Características', href: '/caracteristicas' },
  { label: 'Tutoriales', href: '/tutoriales' },
  { label: 'Noticias', href: '/noticias' },
  { label: 'Clientes', href: '/clientes' },
];

export const SOCIAL_LABELS: Record<string, string> = {
  social_facebook: 'Facebook',
  social_twitter: 'X',
  social_instagram: 'Instagram',
  social_youtube: 'YouTube',
  social_tiktok: 'TikTok',
};
