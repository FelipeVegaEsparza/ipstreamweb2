import { getContent } from './content-i18n'
import type { Feature } from './content'
import { SITE } from './site'
import { t, type Locale, type TranslationKey } from './i18n'

export interface SitePlayer {
  title: string
  description: string
  tags: string[]
  image: string
}

export interface SiteSupportCard {
  title: string
  description: string
  href: string
  action: string
}

export interface SiteFaq {
  question: string
  answer: string
}

export interface SiteProFeature {
  icon: string
  title: string
  text: string
}

export interface SiteStep {
  code: string
  title: string
  description: string
}

export interface SiteCollections {
  pillars: Feature[]
  highlights: Feature[]
  aiFeatures: Feature[]
  aiSteps: SiteStep[]
  studioFeatures: Feature[]
  players: SitePlayer[]
  supportCards: SiteSupportCard[]
  faq: SiteFaq[]
  proFeatures: SiteProFeature[]
}

export interface SiteGlobal {
  siteName: string
  tagline: string
  contactEmail: string
  panelUrl: string
  demoStreamUrl: string
  social: Record<string, string>
}

interface PanelDocument {
  global: Partial<SiteGlobal>
  i18n: Record<string, string>
  collections: Partial<SiteCollections>
}

export interface SiteContentBundle {
  global: SiteGlobal
  i18n: Record<string, string>
  collections: SiteCollections
}

export type SiteTranslator = (
  key: TranslationKey,
  vars?: Record<string, string | number>
) => string

const PANEL_URL = SITE.panelUrl.replace(/\/+$/, '')
const CACHE_TTL_MS = 60_000
const FETCH_TIMEOUT_MS = 2_500

let cache: { at: number; docs: Record<Locale, PanelDocument | null> } | null = null
let inflight: Promise<Record<Locale, PanelDocument | null>> | null = null

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function normalizeDocument(value: unknown): PanelDocument | null {
  if (!isRecord(value)) return null
  const global = isRecord(value.global) ? value.global : {}
  const i18n = isRecord(value.i18n)
    ? Object.fromEntries(
        Object.entries(value.i18n).filter(([, entry]) => typeof entry === 'string')
      )
    : {}
  const collections = isRecord(value.collections) ? value.collections : {}
  return {
    global: global as Partial<SiteGlobal>,
    i18n: i18n as Record<string, string>,
    collections: collections as Partial<SiteCollections>,
  }
}

async function fetchDocument(locale: Locale, signal: AbortSignal): Promise<PanelDocument | null> {
  try {
    const res = await fetch(`${PANEL_URL}/api/public/site-content?locale=${locale}`, {
      headers: { Accept: 'application/json' },
      signal,
    })
    if (!res.ok) return null
    const data = (await res.json()) as { content?: unknown }
    return normalizeDocument(data.content)
  } catch {
    return null
  }
}

async function loadDocuments(): Promise<Record<Locale, PanelDocument | null>> {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.docs
  if (inflight) return inflight

  inflight = (async () => {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
    try {
      const [es, en] = await Promise.all([
        fetchDocument('es', controller.signal),
        fetchDocument('en', controller.signal),
      ])
      const docs: Record<Locale, PanelDocument | null> = { es, en }
      cache = { at: Date.now(), docs }
      if (!es && !en) {
        console.warn('No se pudo leer el contenido del sitio desde el panel; usando fallback local.')
      }
      return docs
    } finally {
      clearTimeout(timer)
      inflight = null
    }
  })()

  return inflight
}

function mergeObject<T extends Record<string, unknown>>(base: T, override: unknown): T {
  if (!isRecord(override)) return base
  const result: Record<string, unknown> = { ...base }
  for (const [key, value] of Object.entries(override)) {
    const current = result[key]
    if (isRecord(current) && isRecord(value)) {
      result[key] = mergeObject(current, value)
    } else if (Array.isArray(value)) {
      result[key] = value
    } else if (value !== undefined) {
      result[key] = value
    }
  }
  return result as T
}

function mergeCollection<T extends Record<string, unknown>>(
  defaults: T[],
  override: unknown
): T[] {
  if (!Array.isArray(override) || override.length === 0) return defaults
  return override.map((item, index) => {
    const base = defaults[index] ?? ({} as T)
    return mergeObject(base, item)
  })
}

interface StaticContentExports {
  PILLARS?: Feature[]
  HIGHLIGHTS?: Feature[]
  AI_FEATURES?: Feature[]
  AI_STEPS?: SiteStep[]
  STUDIO_FEATURES?: Feature[]
  PLAYERS?: SitePlayer[]
  SUPPORT_CARDS?: SiteSupportCard[]
  FAQ?: SiteFaq[]
  PRO_FEATURES?: SiteProFeature[]
}

function staticCollections(locale: Locale): SiteCollections {
  const es = getContent('es') as StaticContentExports
  const localized = getContent(locale) as StaticContentExports
  return {
    pillars: localized.PILLARS ?? es.PILLARS ?? [],
    highlights: localized.HIGHLIGHTS ?? es.HIGHLIGHTS ?? [],
    aiFeatures: localized.AI_FEATURES ?? es.AI_FEATURES ?? [],
    aiSteps: localized.AI_STEPS ?? es.AI_STEPS ?? [],
    studioFeatures: localized.STUDIO_FEATURES ?? es.STUDIO_FEATURES ?? [],
    players: localized.PLAYERS ?? es.PLAYERS ?? [],
    supportCards: localized.SUPPORT_CARDS ?? es.SUPPORT_CARDS ?? [],
    faq: localized.FAQ ?? es.FAQ ?? [],
    proFeatures: localized.PRO_FEATURES ?? es.PRO_FEATURES ?? [],
  }
}

function defaultGlobal(): SiteGlobal {
  return {
    siteName: SITE.name,
    tagline: SITE.tagline,
    contactEmail: SITE.email,
    panelUrl: SITE.panelUrl,
    demoStreamUrl: SITE.demoStreamUrl,
    social: {
      facebook: '',
      youtube: '',
      instagram: '',
      tiktok: '',
      twitter: '',
    },
  }
}

function resolveGlobal(
  defaults: SiteGlobal,
  es: PanelDocument | null,
  localized: PanelDocument | null
): SiteGlobal {
  const base = mergeObject(defaults as unknown as Record<string, unknown>, es?.global)
  const merged = mergeObject(base, localized?.global)
  return merged as unknown as SiteGlobal
}

function resolveCollections(
  defaults: SiteCollections,
  es: PanelDocument | null,
  localized: PanelDocument | null
): SiteCollections {
  const keys = Object.keys(defaults) as Array<keyof SiteCollections>
  const result = { ...defaults } as SiteCollections
  for (const key of keys) {
    const fallback = es?.collections[key]
    const current = localized?.collections[key]
    const esMerged = mergeCollection(
      (defaults[key] ?? []) as unknown as Array<Record<string, unknown>>,
      fallback
    )
    result[key] = mergeCollection(esMerged, current) as never
  }
  return result
}

export async function getSiteContent(locale: Locale): Promise<SiteContentBundle> {
  const docs = await loadDocuments()
  const es = docs.es
  const localized = locale === 'en' ? docs.en : docs.es
  const defaults = defaultGlobal()

  const i18n = {
    ...es?.i18n,
    ...(locale === 'en' ? localized?.i18n : {}),
  }

  return {
    global: resolveGlobal(defaults, es, locale === 'en' ? localized : null),
    i18n,
    collections: resolveCollections(staticCollections(locale), es, locale === 'en' ? localized : null),
  }
}

function interpolate(
  template: string,
  vars?: Record<string, string | number>
): string {
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? `{${key}}`))
}

export function createSiteTranslator(
  locale: Locale,
  overrides: Record<string, string>
): SiteTranslator {
  const base = t(locale)
  return (key, vars) => {
    const value = overrides[key]
    return value === undefined ? base(key, vars) : interpolate(value, vars)
  }
}
