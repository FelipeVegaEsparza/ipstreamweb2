import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { sql } from 'drizzle-orm';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { createDatabase, type DatabaseHandle } from '../src/lib/db/client';
import { news, plans, clientPortfolio, communityRadios } from '../src/lib/db/schema';
import { downloadImage, uploadedPath } from '../src/lib/migration/images';
import {
  parseCommunityHtml,
  parseNews,
  parseNewsDetailHtml,
  parsePlans,
  parsePortfolioHtml,
  parseTutorialCategories,
} from '../src/lib/migration/source';
import { upsertPlanCategory, upsertPlan, upsertNews, upsertPortfolio, upsertCommunity } from '../src/lib/migration/upsert';

const plansPayload = {
  success: true,
  categories: [{ id: 8, name: 'Radio Online', slug: 'radio', description: 'd', icon: '', display_order: 1 }],
  plans: [
    {
      id: 28,
      plan_key: 'radio_avanza',
      plan_name: 'Radio Inicia',
      price: 14990,
      title: 'Radio Inicia',
      icon: '',
      image_url: '/uploads/plans/a.png',
      description: 'desc',
      features: ['Uno', 'Dos'],
      monthly_price: 14990,
      annual_price: 120000,
      billing_note: 'nota',
      demo_url: 'https://demo.cl',
      category_id: 8,
      category_slug: 'radio',
      is_active: 1,
    },
  ],
};

const newsPayload = {
  success: true,
  data: [
    { id: 5, title: 'Titulo', slug: 'titulo', excerpt: 'resumen', image: '/uploads/news/n.png', author: 'IPStream', published_at: '2026-06-17 15:54:00' },
  ],
};

const portfolioHtml = `<section><a href="https://a.cl" target="_blank"><div><img src="/uploads/portfolio/p1.png" alt="Radio A"><p>desc a</p></div></a></section>`;
const communityHtml = `<div><img src="/uploads/community/c1.webp" alt="Radio C"><p>desc c</p><a href="https://c.cl">Visitar sitio</a></div>`;

describe('extraccion de fuentes', () => {
  it('parsea planes y categorias de la API', () => {
    const { categories, plans: parsed } = parsePlans(plansPayload);
    expect(categories[0]).toMatchObject({ slug: 'radio', displayOrder: 1 });
    expect(parsed[0]).toMatchObject({ planKey: 'radio_avanza', features: ['Uno', 'Dos'], categorySlug: 'radio', isActive: true });
  });

  it('parsea noticias de la API', () => {
    const parsed = parseNews(newsPayload);
    expect(parsed[0]).toMatchObject({ slug: 'titulo', excerpt: 'resumen', content: 'resumen' });
  });

  it('parsea categorias de tutoriales', () => {
    const parsed = parseTutorialCategories({ success: true, categories: [{ id: 1, name: 'Primeros Pasos', slug: 'primeros-pasos', color: 'blue', display_order: 1 }] });
    expect(parsed[0]).toMatchObject({ slug: 'primeros-pasos', displayOrder: 1 });
  });

  it('extrae el contenido del detalle de noticia', () => {
    const html = '<article><div class="prose prose-lg max-w-none">Contenido <b>rico</b></div></article>';
    expect(parseNewsDetailHtml(html)).toBe('Contenido <b>rico</b>');
  });

  it('scrapea portafolio con titulo, imagen y enlace', () => {
    const parsed = parsePortfolioHtml(portfolioHtml);
    expect(parsed).toEqual([{ title: 'Radio A', imageUrl: '/uploads/portfolio/p1.png', projectUrl: 'https://a.cl', description: 'desc a' }]);
  });

  it('scrapea comunidad con nombre, logo, sitio y descripcion', () => {
    const parsed = parseCommunityHtml(communityHtml);
    expect(parsed).toEqual([{ name: 'Radio C', logoUrl: '/uploads/community/c1.webp', siteUrl: 'https://c.cl', description: 'desc c' }]);
  });
});

describe('descarga de imagenes', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('identifica solo rutas locales de uploads', () => {
    expect(uploadedPath('/uploads/plans/a.png')).toBe('/uploads/plans/a.png');
    expect(uploadedPath('https://otro.cl/x.png')).toBeNull();
    expect(uploadedPath(null)).toBeNull();
  });

  it('no aborta cuando la imagen no esta disponible', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('', { status: 404 })));
    const temp = mkdtempSync(join(tmpdir(), 'ipstream-img-'));
    const result = await downloadImage('/uploads/plans/missing.png', { site: 'https://ipstream.cl', uploadsDir: temp });
    expect(result).toBeNull();
    rmSync(temp, { recursive: true, force: true });
  });

  it('descarga y reescribe la ruta local', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(new Uint8Array([1, 2, 3]), { status: 200 })));
    const temp = mkdtempSync(join(tmpdir(), 'ipstream-img-'));
    const result = await downloadImage('/uploads/news/foto.png', { site: 'https://ipstream.cl', uploadsDir: temp });
    expect(result).toBe('/uploads/news/foto.png');
    expect(existsSync(join(temp, 'news/foto.png'))).toBe(true);
    const bytes = readFileSync(join(temp, 'news/foto.png'));
    expect(bytes.length).toBe(3);
    rmSync(temp, { recursive: true, force: true });
  });
});

describe('upsert idempotente', () => {
  let handle: DatabaseHandle;
  let tempDir: string;

  beforeAll(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'ipstream-upsert-'));
    handle = createDatabase(join(tempDir, 'test.db'));
  });

  afterAll(() => {
    handle.sqlite.close();
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('no duplica registros en una segunda ejecucion', () => {
    const run = () => {
      const { row: category } = upsertPlanCategory(handle.db, { slug: 'radio', name: 'Radio', description: null, icon: null, displayOrder: 1 });
      upsertPlan(
        handle.db,
        {
          planKey: 'radio_avanza',
          planName: 'Radio Inicia',
          price: 14990,
          title: null,
          icon: null,
          imageUrl: '/uploads/plans/a.png',
          description: null,
          features: ['Uno'],
          monthlyPrice: 14990,
          annualPrice: 120000,
          billingNote: null,
          demoUrl: null,
          categorySlug: 'radio',
          isActive: true,
        },
        category.id,
        '/uploads/plans/a.png',
      );
      upsertNews(handle.db, { title: 'T', slug: 't', excerpt: 'e', content: 'c', image: null, author: 'IPStream', publishedAt: '2026-06-01 10:00:00', isActive: true }, null);
      upsertPortfolio(handle.db, { title: 'Radio A', imageUrl: null, projectUrl: 'https://a.cl', description: null }, null);
      upsertCommunity(handle.db, { name: 'Radio C', logoUrl: null, siteUrl: 'https://c.cl', description: null }, null);
    };

    run();
    run();

    expect(handle.db.select({ n: sql<number>`count(*)` }).from(plans).get()?.n).toBe(1);
    expect(handle.db.select({ n: sql<number>`count(*)` }).from(news).get()?.n).toBe(1);
    expect(handle.db.select({ n: sql<number>`count(*)` }).from(clientPortfolio).get()?.n).toBe(1);
    expect(handle.db.select({ n: sql<number>`count(*)` }).from(communityRadios).get()?.n).toBe(1);
  });
});
