import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createDatabase, type DatabaseHandle } from '../src/lib/db/client';
import {
  getAnalyticsOverview,
  parseAnalyticsRange,
  pruneAnalytics,
  recordEvent,
  recordPageLeave,
  recordPageview,
  recordSection,
} from '../src/lib/db/repositories/analytics';

let handle: DatabaseHandle;
let tempDir: string;

beforeAll(() => {
  tempDir = mkdtempSync(join(tmpdir(), 'ipstream-analytics-'));
  handle = createDatabase(join(tempDir, 'test.db'));
});

afterAll(() => {
  handle.sqlite.close();
  rmSync(tempDir, { recursive: true, force: true });
});

describe('analytics', () => {
  it('registra una visita completa y la resume en el panel', () => {
    const context = {
      sessionId: 'session-1',
      visitorHash: 'visitor-1',
      path: '/',
      referrer: 'google.com',
      country: 'CL',
      device: 'desktop',
    };

    recordPageview(handle.db, { ...context, pageviewId: 'pageview-1', title: 'Inicio' });
    recordSection(handle.db, {
      pageviewId: 'pageview-1',
      sessionId: context.sessionId,
      visitorHash: context.visitorHash,
      path: '/',
      sectionKey: 'hero',
      sectionLabel: 'Hero',
      durationMs: 4000,
      maxVisibleRatio: 1,
    });
    recordEvent(handle.db, {
      sessionId: context.sessionId,
      visitorHash: context.visitorHash,
      pageviewId: 'pageview-1',
      path: '/',
      name: 'plan_click',
      label: 'Plan Básico',
    });
    recordPageLeave(handle.db, {
      pageviewId: 'pageview-1',
      sessionId: context.sessionId,
      visitorHash: context.visitorHash,
      path: '/',
      durationMs: 8000,
      maxScrollDepth: 75,
    });
    recordPageview(handle.db, {
      ...context,
      pageviewId: 'pageview-1b',
      path: '/planes',
    });

    const overview = getAnalyticsOverview(handle.db, 30);

    expect(overview.kpis.pageviews).toBe(2);
    expect(overview.kpis.visitors).toBe(1);
    expect(overview.kpis.sessions).toBe(1);
    expect(overview.kpis.bounceRate).toBe(0);
    expect(overview.topPages.map((page) => page.label)).toContain('/');
    expect(overview.topPages.map((page) => page.label)).toContain('/planes');
    expect(overview.sections[0]?.label).toBe('Hero');
    expect(overview.events[0]?.label).toBe('plan_click · Plan Básico');
    expect(overview.plans[0]?.label).toBe('Plan Básico');
  });

  it('cuenta el rebote cuando la sesión tiene una sola página', () => {
    recordPageview(handle.db, {
      sessionId: 'session-2',
      visitorHash: 'visitor-2',
      path: '/contacto',
      pageviewId: 'pageview-2',
    });

    const overview = getAnalyticsOverview(handle.db, 7);
    expect(overview.kpis.sessions).toBe(2);
    expect(overview.kpis.bounceRate).toBe(50);
  });

  it('normaliza el rango solicitado', () => {
    expect(parseAnalyticsRange(null)).toBe(30);
    expect(parseAnalyticsRange('7')).toBe(7);
    expect(parseAnalyticsRange('90')).toBe(90);
    expect(parseAnalyticsRange('365')).toBe(365);
    expect(parseAnalyticsRange('3650')).toBe(30);
  });

  it('genera la serie diaria completa del rango', () => {
    const overview = getAnalyticsOverview(handle.db, 7);
    expect(overview.daily).toHaveLength(7);
    expect(overview.daily.at(-1)?.pageviews).toBe(3);
    expect(overview.daily.at(-1)?.sessions).toBe(2);
    expect(overview.daily.at(-1)?.date).toBe(new Date().toISOString().slice(0, 10));
  });

  it('compara con el periodo anterior', () => {
    handle.sqlite
      .prepare("UPDATE analytics_pageviews SET created_at = datetime('now', '-8 days') WHERE pageview_id = 'pageview-2'")
      .run();

    const overview = getAnalyticsOverview(handle.db, 7);
    expect(overview.kpis.pageviews).toBe(2);
    expect(overview.previous.pageviews).toBe(1);
    expect(overview.previous.sessions).toBe(0);
  });

  it('purga los datos fuera de la retención', () => {
    recordPageview(handle.db, {
      sessionId: 'session-old',
      visitorHash: 'visitor-old',
      path: '/viejo',
      pageviewId: 'pageview-old',
    });
    handle.sqlite
      .prepare("UPDATE analytics_pageviews SET created_at = datetime('now', '-40 days') WHERE pageview_id = 'pageview-old'")
      .run();

    const result = pruneAnalytics(handle.db, 30);
    expect(result.pageviews).toBeGreaterThanOrEqual(1);

    const old = handle.sqlite
      .prepare("SELECT count(*) AS total FROM analytics_pageviews WHERE path = '/viejo'")
      .get() as { total: number };
    const recent = handle.sqlite
      .prepare("SELECT count(*) AS total FROM analytics_pageviews WHERE path != '/viejo'")
      .get() as { total: number };
    expect(old.total).toBe(0);
    expect(recent.total).toBeGreaterThan(0);
  });
});
