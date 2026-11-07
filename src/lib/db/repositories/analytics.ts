import { and, avg, count, desc, eq, gte, lte, sql } from 'drizzle-orm';
import type { AppDatabase } from '../client';
import {
  analyticsEvents,
  analyticsPageviews,
  analyticsSectionViews,
  analyticsSessions,
} from '../schema';

export type AnalyticsRange = 7 | 30 | 90;

export interface AnalyticsContext {
  sessionId: string;
  visitorHash: string;
  path: string;
  referrer?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  country?: string | null;
  region?: string | null;
  city?: string | null;
  device?: string | null;
  browser?: string | null;
  os?: string | null;
  language?: string | null;
  screenWidth?: number | null;
  screenHeight?: number | null;
}

export interface PageviewInput extends AnalyticsContext {
  pageviewId: string;
  title?: string | null;
  locale?: string | null;
}

export interface SectionInput {
  pageviewId: string;
  sessionId: string;
  visitorHash: string;
  path: string;
  sectionKey: string;
  sectionLabel?: string | null;
  durationMs: number;
  maxVisibleRatio: number;
}

export interface EventInput {
  sessionId: string;
  visitorHash: string;
  pageviewId?: string | null;
  path: string;
  name: string;
  label?: string | null;
  value?: number | null;
  metadata?: string | null;
}

function utcNow(): string {
  return new Date().toISOString().slice(0, 19).replace('T', ' ');
}

function num(value: unknown): number {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function sinceFor(days: number): string {
  const date = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

function touchSession(
  db: AppDatabase,
  input: Pick<AnalyticsContext, 'sessionId' | 'visitorHash' | 'path'>,
): void {
  const now = utcNow();
  db.insert(analyticsSessions)
    .values({
      id: input.sessionId,
      visitorHash: input.visitorHash,
      startedAt: now,
      lastSeenAt: now,
      landingPath: input.path,
      exitPath: input.path,
    })
    .onConflictDoUpdate({
      target: analyticsSessions.id,
      set: {
        lastSeenAt: now,
        exitPath: input.path,
      },
    })
    .run();
}

export function recordPageview(db: AppDatabase, input: PageviewInput): void {
  const now = utcNow();
  db.transaction((tx) => {
    tx.insert(analyticsSessions)
      .values({
        id: input.sessionId,
        visitorHash: input.visitorHash,
        startedAt: now,
        lastSeenAt: now,
        landingPath: input.path,
        exitPath: input.path,
        pageviews: 1,
        referrer: input.referrer || null,
        utmSource: input.utmSource || null,
        utmMedium: input.utmMedium || null,
        utmCampaign: input.utmCampaign || null,
        country: input.country || null,
        region: input.region || null,
        city: input.city || null,
        device: input.device || null,
        browser: input.browser || null,
        os: input.os || null,
        language: input.language || null,
        screenWidth: input.screenWidth ?? null,
        screenHeight: input.screenHeight ?? null,
      })
      .onConflictDoUpdate({
        target: analyticsSessions.id,
        set: {
          lastSeenAt: now,
          exitPath: input.path,
          pageviews: sql`pageviews + 1`,
          referrer: sql`COALESCE(referrer, ${input.referrer || null})`,
          utmSource: sql`COALESCE(utm_source, ${input.utmSource || null})`,
          utmMedium: sql`COALESCE(utm_medium, ${input.utmMedium || null})`,
          utmCampaign: sql`COALESCE(utm_campaign, ${input.utmCampaign || null})`,
          country: sql`COALESCE(country, ${input.country || null})`,
          region: sql`COALESCE(region, ${input.region || null})`,
          city: sql`COALESCE(city, ${input.city || null})`,
          device: sql`COALESCE(device, ${input.device || null})`,
          browser: sql`COALESCE(browser, ${input.browser || null})`,
          os: sql`COALESCE(os, ${input.os || null})`,
          language: sql`COALESCE(language, ${input.language || null})`,
          screenWidth: sql`COALESCE(screen_width, ${input.screenWidth ?? null})`,
          screenHeight: sql`COALESCE(screen_height, ${input.screenHeight ?? null})`,
        },
      })
      .run();

    tx.insert(analyticsPageviews)
      .values({
        pageviewId: input.pageviewId,
        sessionId: input.sessionId,
        visitorHash: input.visitorHash,
        path: input.path,
        title: input.title || null,
        locale: input.locale || null,
        referrer: input.referrer || null,
        utmSource: input.utmSource || null,
        utmMedium: input.utmMedium || null,
        utmCampaign: input.utmCampaign || null,
        country: input.country || null,
        region: input.region || null,
        city: input.city || null,
        device: input.device || null,
        browser: input.browser || null,
        os: input.os || null,
        language: input.language || null,
        screenWidth: input.screenWidth ?? null,
        screenHeight: input.screenHeight ?? null,
        createdAt: now,
      })
      .run();
  });
}

export function recordPageLeave(
  db: AppDatabase,
  input: { pageviewId: string; sessionId: string; visitorHash: string; path: string; durationMs: number; maxScrollDepth: number },
): void {
  db.update(analyticsPageviews)
    .set({
      durationMs: Math.max(0, Math.round(input.durationMs)),
      maxScrollDepth: Math.min(100, Math.max(0, Math.round(input.maxScrollDepth))),
    })
    .where(eq(analyticsPageviews.pageviewId, input.pageviewId))
    .run();
  touchSession(db, input);
}

export function recordSection(db: AppDatabase, input: SectionInput): void {
  touchSession(db, input);
  const now = utcNow();
  db.insert(analyticsSectionViews)
    .values({
      pageviewId: input.pageviewId,
      sessionId: input.sessionId,
      visitorHash: input.visitorHash,
      path: input.path,
      sectionKey: input.sectionKey,
      sectionLabel: input.sectionLabel || null,
      durationMs: Math.max(0, Math.round(input.durationMs)),
      maxVisibleRatio: Math.min(1, Math.max(0, input.maxVisibleRatio)),
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [analyticsSectionViews.pageviewId, analyticsSectionViews.sectionKey],
      set: {
        sectionLabel: sql`COALESCE(${input.sectionLabel || null}, section_label)`,
        durationMs: sql`MAX(duration_ms, ${Math.max(0, Math.round(input.durationMs))})`,
        maxVisibleRatio: sql`MAX(max_visible_ratio, ${Math.min(1, Math.max(0, input.maxVisibleRatio))})`,
        updatedAt: now,
      },
    })
    .run();
}

export function recordEvent(db: AppDatabase, input: EventInput): void {
  touchSession(db, input);
  db.insert(analyticsEvents)
    .values({
      sessionId: input.sessionId,
      visitorHash: input.visitorHash,
      pageviewId: input.pageviewId || null,
      name: input.name,
      label: input.label || null,
      path: input.path,
      value: input.value ?? null,
      metadata: input.metadata || null,
      createdAt: utcNow(),
    })
    .run();
}

export interface AnalyticsKpis {
  pageviews: number;
  visitors: number;
  sessions: number;
  bounceRate: number;
  avgDuration: number;
  avgScroll: number;
}

export interface AnalyticsRow {
  label: string;
  views: number;
  visitors?: number;
  avgDuration?: number;
  avgScroll?: number;
}

export interface AnalyticsFunnelStep {
  label: string;
  value: number;
}

export interface AnalyticsOverview {
  days: AnalyticsRange;
  since: string;
  kpis: AnalyticsKpis;
  topPages: AnalyticsRow[];
  sections: AnalyticsRow[];
  referrers: AnalyticsRow[];
  devices: AnalyticsRow[];
  countries: AnalyticsRow[];
  events: AnalyticsRow[];
  plans: AnalyticsRow[];
  funnel: AnalyticsFunnelStep[];
}

export function parseAnalyticsRange(value: string | null | undefined): AnalyticsRange {
  const n = Number(value);
  return n === 7 || n === 90 ? n : 30;
}

export function getAnalyticsOverview(db: AppDatabase, requestedDays: number): AnalyticsOverview {
  const days = parseAnalyticsRange(String(requestedDays));
  const since = sinceFor(days);
  const inRange = gte(analyticsPageviews.createdAt, since);
  const sessionRange = gte(analyticsSessions.startedAt, since);

  const pageTotals = db
    .select({
      pageviews: count(),
      visitors: sql<number>`count(distinct ${analyticsPageviews.visitorHash})`,
      avgDuration: avg(analyticsPageviews.durationMs),
      avgScroll: avg(analyticsPageviews.maxScrollDepth),
    })
    .from(analyticsPageviews)
    .where(inRange)
    .get();

  const sessionTotals = db
    .select({
      sessions: count(),
      visitors: sql<number>`count(distinct ${analyticsSessions.visitorHash})`,
    })
    .from(analyticsSessions)
    .where(sessionRange)
    .get();

  const bounceTotals = db
    .select({ bounces: count() })
    .from(analyticsSessions)
    .where(and(sessionRange, lte(analyticsSessions.pageviews, 1)))
    .get();

  const sessions = num(sessionTotals?.sessions);
  const bounces = num(bounceTotals?.bounces);

  const topPages = db
    .select({
      label: analyticsPageviews.path,
      views: count(),
      visitors: sql<number>`count(distinct ${analyticsPageviews.visitorHash})`,
      avgDuration: avg(analyticsPageviews.durationMs),
      avgScroll: avg(analyticsPageviews.maxScrollDepth),
    })
    .from(analyticsPageviews)
    .where(inRange)
    .groupBy(analyticsPageviews.path)
    .orderBy(desc(count()))
    .limit(12)
    .all()
    .map((row) => ({
      label: row.label,
      views: num(row.views),
      visitors: num(row.visitors),
      avgDuration: num(row.avgDuration),
      avgScroll: num(row.avgScroll),
    }));

  const sections = db
    .select({
      label: sql<string>`COALESCE(max(section_label), section_key)`,
      views: count(),
      visitors: sql<number>`count(distinct ${analyticsSectionViews.visitorHash})`,
      avgDuration: avg(analyticsSectionViews.durationMs),
      avgScroll: sql<number>`avg(max_visible_ratio) * 100`,
    })
    .from(analyticsSectionViews)
    .where(gte(analyticsSectionViews.createdAt, since))
    .groupBy(analyticsSectionViews.sectionKey)
    .orderBy(desc(count()))
    .limit(16)
    .all()
    .map((row) => ({
      label: row.label,
      views: num(row.views),
      visitors: num(row.visitors),
      avgDuration: num(row.avgDuration),
      avgScroll: num(row.avgScroll),
    }));

  const referrers = db
    .select({ label: analyticsPageviews.referrer, views: count() })
    .from(analyticsPageviews)
    .where(inRange)
    .groupBy(analyticsPageviews.referrer)
    .orderBy(desc(count()))
    .limit(12)
    .all()
    .map((row) => ({ label: row.label || 'Directo', views: num(row.views) }));

  const devices = db
    .select({ label: analyticsPageviews.device, views: count() })
    .from(analyticsPageviews)
    .where(inRange)
    .groupBy(analyticsPageviews.device)
    .orderBy(desc(count()))
    .limit(8)
    .all()
    .map((row) => ({ label: row.label || 'Desconocido', views: num(row.views) }));

  const countries = db
    .select({ label: analyticsPageviews.country, views: count() })
    .from(analyticsPageviews)
    .where(inRange)
    .groupBy(analyticsPageviews.country)
    .orderBy(desc(count()))
    .limit(10)
    .all()
    .map((row) => ({ label: row.label || 'Desconocido', views: num(row.views) }));

  const events = db
    .select({ name: analyticsEvents.name, label: analyticsEvents.label, views: count() })
    .from(analyticsEvents)
    .where(gte(analyticsEvents.createdAt, since))
    .groupBy(analyticsEvents.name, analyticsEvents.label)
    .orderBy(desc(count()))
    .limit(20)
    .all()
    .map((row) => ({
      label: row.label ? `${row.name} · ${row.label}` : row.name,
      views: num(row.views),
    }));

  const plans = db
    .select({ label: analyticsEvents.label, views: count() })
    .from(analyticsEvents)
    .where(and(gte(analyticsEvents.createdAt, since), eq(analyticsEvents.name, 'plan_click')))
    .groupBy(analyticsEvents.label)
    .orderBy(desc(count()))
    .limit(12)
    .all()
    .map((row) => ({ label: row.label || 'Plan sin nombre', views: num(row.views) }));

  const countPages = (path: string) =>
    num(
      db
        .select({ total: count() })
        .from(analyticsPageviews)
        .where(and(inRange, eq(analyticsPageviews.path, path)))
        .get()?.total,
    );

  const countEvents = (name: string) =>
    num(
      db
        .select({ total: count() })
        .from(analyticsEvents)
        .where(and(gte(analyticsEvents.createdAt, since), eq(analyticsEvents.name, name)))
        .get()?.total,
    );

  const funnel = [
    { label: 'Visitas a la home', value: countPages('/') },
    { label: 'Vistas de planes', value: countPages('/planes') },
    { label: 'Clics en un plan', value: countEvents('plan_click') },
    { label: 'Clics en registro', value: countEvents('cta_registro') },
  ];

  return {
    days,
    since,
    kpis: {
      pageviews: num(pageTotals?.pageviews),
      visitors: Math.max(num(pageTotals?.visitors), num(sessionTotals?.visitors)),
      sessions,
      bounceRate: sessions > 0 ? Math.round((bounces / sessions) * 100) : 0,
      avgDuration: num(pageTotals?.avgDuration),
      avgScroll: num(pageTotals?.avgScroll),
    },
    topPages,
    sections,
    referrers,
    devices,
    countries,
    events,
    plans,
    funnel,
  };
}
