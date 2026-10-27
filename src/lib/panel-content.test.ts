import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

function response(content: unknown) {
  return new Response(JSON.stringify({ content }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

function stubFetch(docs: Record<string, unknown>) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL) => {
      const url = new URL(String(input))
      const locale = url.searchParams.get('locale') ?? 'es'
      return response(docs[locale])
    })
  )
}

describe('panel content client', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('aplica el contenido del panel sobre los defaults', async () => {
    stubFetch({
      es: {
        global: { siteName: 'CasterFly Editado' },
        i18n: { 'home.hero.title': 'Hero panel' },
        collections: { pillars: [{ title: 'Pilar panel' }] },
      },
      en: {
        global: { siteName: 'Edited CasterFly' },
        i18n: { 'home.hero.title': 'Panel hero' },
        collections: { pillars: [{ title: 'Panel pillar' }] },
      },
    })

    const { getSiteContent, createSiteTranslator } = await import('./panel-content')
    const es = await getSiteContent('es')
    const en = await getSiteContent('en')
    const tr = createSiteTranslator('es', es.i18n)

    expect(es.global.siteName).toBe('CasterFly Editado')
    expect(tr('home.hero.title')).toBe('Hero panel')
    expect(es.collections.pillars[0].title).toBe('Pilar panel')
    expect(es.collections.pillars[0].description).toBeTruthy()
    expect(en.global.siteName).toBe('Edited CasterFly')
    expect(en.i18n['home.hero.title']).toBe('Panel hero')
    expect(en.collections.pillars[0].title).toBe('Panel pillar')
  })

  it('usa el valor español cuando falta una traducción en inglés', async () => {
    stubFetch({
      es: {
        i18n: {
          'home.hero.title': 'Título ES',
          'home.hero.description': 'Descripción ES',
        },
      },
      en: { i18n: { 'home.hero.title': 'Title EN' } },
    })

    const { getSiteContent } = await import('./panel-content')
    const en = await getSiteContent('en')

    expect(en.i18n['home.hero.title']).toBe('Title EN')
    expect(en.i18n['home.hero.description']).toBe('Descripción ES')
  })

  it('vuelve al contenido estático si el panel falla', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(new Error('offline'))))

    const { getSiteContent } = await import('./panel-content')
    const es = await getSiteContent('es')

    expect(es.global.siteName).toBe('CasterFly')
    expect(es.i18n).toEqual({})
    expect(es.collections.pillars.length).toBeGreaterThan(0)
    expect(es.collections.faq.length).toBeGreaterThan(0)
  })

  it('interpola variables en overrides', async () => {
    const { createSiteTranslator } = await import('./panel-content')
    const tr = createSiteTranslator('es', {
      'home.plans.viewPlans': 'Ver {count} planes',
    })

    expect(tr('home.plans.viewPlans', { count: 3 })).toBe('Ver 3 planes')
    expect(tr('home.hero.ctaPlans')).toBe('Ver planes')
  })
})
