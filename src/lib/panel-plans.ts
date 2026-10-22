import { getDatabase } from './db/client'
import { listPlansGroupedByCategory } from './db/repositories/plans'
import { SITE } from './site'

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

const GROUP_META: Record<PanelPlanGroup['key'], { label: string; description: string }> = {
  radio: {
    label: 'Radio',
    description: 'Streaming de audio, AutoDJ, sitio web y app PWA para tu emisora.',
  },
  tv: {
    label: 'TV',
    description: 'Canal de televisión online con AutoDJ de video y playlist.',
  },
  both: {
    label: 'Radio + TV',
    description: 'Audio y video en una sola plataforma.',
  },
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

export function groupPanelPlans(plans: PanelPlan[]): PanelPlanGroup[] {
  return GROUP_ORDER.map((key) => ({
    key,
    ...GROUP_META[key],
    plans: plans.filter((plan) => plan.services === key),
  })).filter((group) => group.plans.length > 0)
}

export async function getPanelPlanGroups(): Promise<PanelPlanGroup[]> {
  return groupPanelPlans(await fetchPanelPlans())
}
