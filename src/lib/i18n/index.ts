import { es } from './es'
import { en } from './en'

export type Locale = 'es' | 'en'
export const DEFAULT_LOCALE: Locale = 'es'

export const LOCALES: Record<Locale, { label: string; short: string }> = {
  es: { label: 'Español', short: 'ES' },
  en: { label: 'English', short: 'EN' },
}

export type TranslationKey = keyof typeof es
const DICT: Record<Locale, Record<TranslationKey, string>> = { es, en }

export function getLocaleFromPath(pathname: string): { locale: Locale; path: string } {
  const clean = pathname.replace(/\/+$/, '') || '/'
  if (clean === '/en') return { locale: 'en', path: '/' }
  if (clean.startsWith('/en/')) return { locale: 'en', path: clean.slice(3) || '/' }
  if (clean === '/es') return { locale: 'es', path: '/' }
  if (clean.startsWith('/es/')) return { locale: 'es', path: clean.slice(3) || '/' }
  return { locale: 'es', path: clean }
}

export function localizedPath(locale: Locale, path: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`
  if (locale === 'es') return clean
  return clean === '/' ? '/en' : `/en${clean}`
}

export function getLocale(locals: { locale?: Locale } | null | undefined): Locale {
  return locals?.locale ?? DEFAULT_LOCALE
}

export function getPathWithoutLocale(
  locals: { pathWithoutLocale?: string } | null | undefined,
  url: URL
): string {
  return locals?.pathWithoutLocale ?? url.pathname
}

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? `{${key}}`))
}

export function translate(
  locale: Locale,
  key: TranslationKey,
  vars?: Record<string, string | number>
): string {
  return interpolate(DICT[locale]?.[key] ?? DICT.es[key] ?? key, vars)
}

export function t(locale: Locale) {
  return (key: TranslationKey, vars?: Record<string, string | number>) => translate(locale, key, vars)
}
