export const SITE = {
  name: 'IPStream',
  tagline: 'Tu radio online',
  url: (process.env.SITE_URL ?? 'https://ipstream.cl').replace(/\/$/, ''),
  panelUrl: 'https://panelipstream.cl/',
  email: 'contacto@ipstream.cl',
} as const;

export interface NavItem {
  label: string;
  href: string;
}

export const NAV: NavItem[] = [
  { label: 'Inicio', href: '/' },
  { label: 'Planes', href: '/planes' },
  { label: 'Características', href: '/caracteristicas' },
  { label: 'Tutoriales', href: '/tutoriales' },
  { label: 'Noticias', href: '/noticias' },
  { label: 'Clientes', href: '/clientes' },
  { label: 'Comunidad', href: '/comunidad' },
  { label: 'Soporte', href: '/soporte' },
];

export const SOCIAL_LABELS: Record<string, string> = {
  social_facebook: 'Facebook',
  social_twitter: 'X',
  social_instagram: 'Instagram',
  social_youtube: 'YouTube',
  social_tiktok: 'TikTok',
};
