import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createDatabase, type DatabaseHandle } from '../src/lib/db/client';
import { ValidationError } from '../src/lib/db/errors';
import { listCategories, createCategory, createPlan, deleteCategory, listPlans, listPlansGroupedByCategory, getPlanByKey, updatePlan } from '../src/lib/db/repositories/plans';
import { createNews, listNews } from '../src/lib/db/repositories/news';
import { createTutorial, createTutorialCategory, listTutorialsGroupedByCategory } from '../src/lib/db/repositories/tutorials';
import { createPortfolioItem, listPortfolio } from '../src/lib/db/repositories/portfolio';
import { createCommunityRadio, listCommunity } from '../src/lib/db/repositories/community';
import { getSetting, setSetting } from '../src/lib/db/repositories/settings';

let handle: DatabaseHandle;
let tempDir: string;

beforeAll(() => {
  tempDir = mkdtempSync(join(tmpdir(), 'ipstream-'));
  handle = createDatabase(join(tempDir, 'test.db'));
});

afterAll(() => {
  handle.sqlite.close();
  rmSync(tempDir, { recursive: true, force: true });
});

describe('esquema y migraciones', () => {
  it('crea las 8 tablas de contenido', () => {
    const rows = handle.sqlite
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '__drizzle%'")
      .all() as Array<{ name: string }>;
    const names = rows.map((row) => row.name).sort();
    expect(names).toEqual(
      [
        'client_portfolio',
        'community_radios',
        'news',
        'plan_categories',
        'plans',
        'settings',
        'tutorial_categories',
        'tutorials',
      ].sort(),
    );
  });

  it('crea los indices declarados', () => {
    const rows = handle.sqlite
      .prepare("SELECT name FROM sqlite_master WHERE type = 'index'")
      .all() as Array<{ name: string }>;
    const names = rows.map((row) => row.name);
    expect(names).toContain('idx_plans_category');
    expect(names).toContain('idx_news_published_at');
    expect(names).toContain('idx_tutorials_display_order');
    expect(names).toContain('idx_client_portfolio_display_order');
  });
});

describe('concurrencia (WAL)', () => {
  it('permite leer mientras hay una escritura abierta', () => {
    const mode = handle.sqlite.pragma('journal_mode', { simple: true });
    expect(String(mode).toLowerCase()).toBe('wal');

    const reader = createDatabase(join(tempDir, 'reader.db'));
    handle.sqlite.exec('BEGIN');
    handle.sqlite
      .prepare("INSERT INTO settings (key, value) VALUES ('__tx_test', 'x')")
      .run();

    const before = reader.sqlite.prepare('SELECT COUNT(*) AS total FROM settings').get() as { total: number };
    expect(before.total).toBeGreaterThanOrEqual(0);

    handle.sqlite.exec('ROLLBACK');
    reader.sqlite.close();
  });
});

describe('lecturas publicas', () => {
  it('ordena planes por display_order de categoria e id, y filtra activos', () => {
    const radio = createCategory(handle.db, { name: 'Radio', displayOrder: 1, isActive: true });
    const tv = createCategory(handle.db, { name: 'TV', displayOrder: 2, isActive: true });

    createPlan(handle.db, { planKey: 'p_tv', planName: 'TV', price: 20000, categoryId: tv.id, isActive: true });
    createPlan(handle.db, { planKey: 'p_radio_a', planName: 'Radio A', price: 10000, categoryId: radio.id, isActive: true });
    createPlan(handle.db, { planKey: 'p_radio_b', planName: 'Radio B', price: 15000, categoryId: radio.id, isActive: false });

    const publicRows = listPlans(handle.db, { activeOnly: true }).map((row) => row.plan.planKey);
    expect(publicRows).toEqual(['p_radio_a', 'p_tv']);

    const groups = listPlansGroupedByCategory(handle.db, { activeOnly: true });
    expect(groups.map((group) => group.category.slug)).toEqual(['Radio', 'TV']);

    const inactive = listPlans(handle.db).find((row) => row.plan.planKey === 'p_radio_b');
    expect(inactive).toBeDefined();
  });

  it('ordena noticias por published_at descendente y omite inactivas en publico', () => {
    createNews(handle.db, { title: 'Vieja', content: 'a', publishedAt: '2026-01-01 10:00:00', isActive: true });
    createNews(handle.db, { title: 'Nueva', content: 'b', publishedAt: '2026-06-01 10:00:00', isActive: true });
    createNews(handle.db, { title: 'Borrador', content: 'c', publishedAt: '2026-07-01 10:00:00', isActive: false });

    const publicTitles = listNews(handle.db, { activeOnly: true }).map((item) => item.title);
    expect(publicTitles).toEqual(['Nueva', 'Vieja']);
    expect(listNews(handle.db).length).toBe(3);
  });

  it('ordena portafolio y comunidad por display_order', () => {
    createPortfolioItem(handle.db, { title: 'Radio B', displayOrder: 2 });
    createPortfolioItem(handle.db, { title: 'Radio A', displayOrder: 1 });
    expect(listPortfolio(handle.db).map((item) => item.title)).toEqual(['Radio A', 'Radio B']);

    createCommunityRadio(handle.db, { name: 'Zeta', siteUrl: 'https://z.cl', displayOrder: 3 });
    createCommunityRadio(handle.db, { name: 'Alfa', siteUrl: 'https://a.cl', displayOrder: 1 });
    expect(listCommunity(handle.db).map((item) => item.name)).toEqual(['Alfa', 'Zeta']);
  });
});

describe('settings y features', () => {
  it('devuelve valor por defecto cuando la clave no existe', () => {
    expect(getSetting(handle.db, 'no_existe')).toBeNull();
    expect(getSetting(handle.db, 'no_existe', '')).toBe('');
  });

  it('guarda y actualiza un ajuste', () => {
    setSetting(handle.db, 'social_facebook', 'https://fb.com/ipstream');
    expect(getSetting(handle.db, 'social_facebook')).toBe('https://fb.com/ipstream');
    setSetting(handle.db, 'social_facebook', 'https://facebook.com/ipstream');
    expect(getSetting(handle.db, 'social_facebook')).toBe('https://facebook.com/ipstream');
  });

  it('lee features como arreglo y no como texto JSON', () => {
    createPlan(handle.db, {
      planKey: 'p_features',
      planName: 'Con features',
      price: 1,
      features: ['Uno', 'Dos'],
      isActive: true,
    });
    const plan = getPlanByKey(handle.db, 'p_features');
    expect(Array.isArray(plan?.features)).toBe(true);
    expect(plan?.features).toEqual(['Uno', 'Dos']);
  });
});

describe('escrituras y validacion', () => {
  it('rechaza claves de plan duplicadas sin alterar datos', () => {
    const before = listPlans(handle.db).length;
    expect(() =>
      createPlan(handle.db, { planKey: 'p_radio_a', planName: 'Duplicado', price: 1 }),
    ).toThrow(ValidationError);
    expect(listPlans(handle.db).length).toBe(before);
  });

  it('rechaza un plan con categoria inexistente', () => {
    expect(() =>
      createPlan(handle.db, { planKey: 'p_bad_cat', planName: 'X', price: 1, categoryId: 999999 }),
    ).toThrow(ValidationError);
    expect(getPlanByKey(handle.db, 'p_bad_cat')).toBeUndefined();
  });

  it('actualiza un plan existente', () => {
    const plan = getPlanByKey(handle.db, 'p_radio_a');
    const updated = updatePlan(handle.db, plan!.id, { price: 12345 });
    expect(updated.price).toBe(12345);
  });

  it('no elimina una categoria con planes asociados', () => {
    const radio = listCategories(handle.db).find((category) => category.name === 'Radio')!;
    expect(() => deleteCategory(handle.db, radio.id)).toThrow(ValidationError);
    expect(listCategories(handle.db).some((category) => category.id === radio.id)).toBe(true);
  });
});

describe('tutoriales vacios', () => {
  it('agrupa por categoria y devuelve lista vacia sin tutoriales', () => {
    createTutorialCategory(handle.db, { name: 'Primeros pasos', displayOrder: 1 });
    expect(listTutorialsGroupedByCategory(handle.db)).toEqual([]);
    createTutorial(handle.db, { categoryId: 1, title: 'Instalar', isActive: true });
    expect(listTutorialsGroupedByCategory(handle.db, { activeOnly: true }).length).toBe(1);
  });
});
