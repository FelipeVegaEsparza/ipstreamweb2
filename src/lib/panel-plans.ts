import { getDatabase } from './db/client'
import { listPlansGroupedByCategory } from './db/repositories/plans'
import { SITE } from './site'
import type { Locale } from './i18n'

export interface PanelPlan {
  id: string
  slug: string
  name: string
  description: string
  interval: string
  services: string
  usdAmount: number
  currency: 'USD'
  features: string[]
  maxDjs: number
  aiLiveEnabled: boolean
  aiMonthlyCharacters: number
  aiMusicMinutes: number
  radioStorageQuotaMB: number | null
  videoStorageQuotaMB: number | null
  imageUrl: string | null
  demoUrl: string | null
  contractUrl: string
}

export interface PanelPlanGroup {
  key: 'radio' | 'tv' | 'both'
  label: string
  description: string
  plans: PanelPlan[]
}

const GROUP_META: Record<Locale, Record<PanelPlanGroup['key'], { label: string; description: string }>> = {
  es: {
    radio: { label: 'Radio', description: 'Streaming de audio, AutoDJ, sitio web y app PWA para tu emisora.' },
    tv: { label: 'TV', description: 'Canal de televisión online con AutoDJ de video y playlist.' },
    both: { label: 'Radio + TV', description: 'Audio y video en una sola plataforma.' },
  },
  en: {
    radio: { label: 'Radio', description: 'Audio streaming, AutoDJ, website and PWA app for your station.' },
    tv: { label: 'TV', description: 'Online TV channel with video AutoDJ and playlist.' },
    both: { label: 'Radio + TV', description: 'Audio and video in one platform.' },
  },
}

const PLAN_EN: Record<string, { name: string; description: string; features: string[] }> = {
  'plan-radio-basico': {
    name: 'Basic Radio Plan',
    description:
      'Everything you need to get your online radio on the air and start streaming. A simple, affordable option for stations that need an online presence, AutoDJ and the essential tools to keep the signal available.',
    features: [
      '10 GB AutoDJ storage',
      'Social media links',
      'Stream from the panel live console, Butt or RadioBoss',
      'GC message lines',
      'Admin panel access',
      'VAT not included · Monthly billing, no long-term contract',
    ],
  },
  'plan-tv-basico': {
    name: 'Basic TV Plan',
    description:
      'Put your TV channel online and reach your audience from anywhere. A simple solution to stream your signal, keep content available with AutoDJ Video and give your channel its own online presence.',
    features: [
      '25 GB AutoDJ Video storage',
      'Stream from OBS or AutoDJ',
      'GC message lines',
      'Social media links',
      'Admin panel access',
    ],
  },
  'plan-radio-pro': {
    name: 'Radio Pro Plan',
    description:
      'More than an online radio: build a community around your station. The Pro plan gives you the tools to share news, podcasts, videoclips and content, stay in touch with listeners and be present on their devices.',
    features: [
      '30 GB AutoDJ storage',
      'Change templates as often as you want',
      'Stream from the panel live console, Butt or RadioBoss',
      'GC message lines',
      'Admin panel access',
      'News, podcast, videocast and social media management',
      'Contact form',
      'PWA app for Android, PC and iOS',
    ],
  },
  'plan-tv-pro': {
    name: 'TV Pro Plan',
    description:
      'Much more than streaming TV online: build a community around your channel. The Pro plan gives you the tools to publish content, keep your audience connected and create your own experience for viewers on any device.',
    features: [
      '50 GB AutoDJ Video storage',
      'Stream from OBS or AutoDJ',
      'GC message lines',
      'Social media links',
      'Admin panel access',
      'News, podcast, videocast and social media management',
      'Contact form',
      'PWA app for Android, PC and iOS',
    ],
  },
}

const LEGACY_STUDIO_SOFTWARE = /IpstreamStudio|CasterFly Studio/gi

function normalizeLegacyStudioCopy(features: string[], locale: Locale): string[] {
  const replacement = locale === 'en' ? 'the panel live console' : 'la consola en vivo del panel'
  return features.map((feature) => feature.replace(LEGACY_STUDIO_SOFTWARE, replacement))
}

export function localizePlan(plan: PanelPlan, locale: Locale): PanelPlan {
  if (locale === 'es') {
    return { ...plan, features: normalizeLegacyStudioCopy(plan.features, locale) }
  }
  const translation = PLAN_EN[plan.slug]
  const localized = translation ? { ...plan, ...translation } : plan
  return { ...localized, features: normalizeLegacyStudioCopy(localized.features, locale) }
}

const GROUP_ORDER: PanelPlanGroup['key'][] = ['radio', 'tv', 'both']
const CACHE_TTL_MS = 60_000

let cache: { at: number; plans: PanelPlan[] } | null = null

function panelSlugFromLocal(contractUrl: string | null, name: string): string {
  const fromUrl = (contractUrl || '').split('/').filter(Boolean).pop()
  if (fromUrl && fromUrl !== 'planes') return fromUrl
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Fallback: planes locales de la SQLite del sitio (solo si el panel no responde). */
function localPlans(): PanelPlan[] {
  try {
    const db = getDatabase()
    return listPlansGroupedByCategory(db, { activeOnly: true })
      .flatMap((group) => group.plans)
      .map((plan) => {
        const services = /tv/i.test(plan.planName) ? 'tv' : 'radio'
        return {
          id: String(plan.id),
          slug: panelSlugFromLocal(plan.contractUrl, plan.planName),
          name: plan.title ?? plan.planName,
          description: plan.description ?? '',
          interval: 'monthly',
          services,
          usdAmount: plan.usdPrice ?? 0,
          currency: 'USD' as const,
          features: plan.features ?? [],
          maxDjs: 0,
          aiLiveEnabled: false,
          aiMonthlyCharacters: 0,
          aiMusicMinutes: 0,
          radioStorageQuotaMB: null,
          videoStorageQuotaMB: null,
          imageUrl: plan.imageUrl ?? null,
          demoUrl: plan.demoUrl ?? null,
          contractUrl: plan.contractUrl ?? `${SITE.panelUrl}planes/${panelSlugFromLocal(plan.contractUrl, plan.planName)}`,
        }
      })
      .filter((plan) => plan.usdAmount > 0)
  } catch {
    return []
  }
}

/** Planes activos del dashboard (fuente de verdad), con fallback local. */
export async function fetchPanelPlans(): Promise<PanelPlan[]> {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.plans

  try {
    const res = await fetch(`${SITE.panelUrl.replace(/\/+$/, '')}/api/public/plans`, {
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) throw new Error(`panel plans ${res.status}`)
    const data = (await res.json()) as { plans?: PanelPlan[] }
    const plans = Array.isArray(data.plans)
      ? data.plans.filter((plan) => typeof plan.usdAmount === 'number' && plan.usdAmount > 0)
      : []
    cache = { at: Date.now(), plans }
    return plans
  } catch (error) {
    console.warn('No se pudieron leer los planes del dashboard; usando planes locales:', error)
    const fallback = localPlans()
    cache = { at: Date.now(), plans: fallback }
    return fallback
  }
}

export function groupPanelPlans(plans: PanelPlan[], locale: Locale = 'es'): PanelPlanGroup[] {
  return GROUP_ORDER.map((key) => ({
    key,
    ...GROUP_META[locale][key],
    plans: plans.filter((plan) => plan.services === key),
  })).filter((group) => group.plans.length > 0)
}

export async function getPanelPlans(locale: Locale = 'es'): Promise<PanelPlan[]> {
  return (await fetchPanelPlans()).map((plan) => localizePlan(plan, locale))
}

export async function getPanelPlanGroups(locale: Locale = 'es'): Promise<PanelPlanGroup[]> {
  return groupPanelPlans(await getPanelPlans(locale), locale)
}
