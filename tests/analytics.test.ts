import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createDatabase, type DatabaseHandle } from '../src/lib/db/client';
import {
  getAnalyticsOverview,
  parseAnalyticsRange,
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
    expect(parseAnalyticsRange('365')).toBe(30);
  });
});
