import { and, avg, count, desc, eq, gte, lt, lte, sql, type SQL } from 'drizzle-orm';
import type { AppDatabase } from '../client';
import { getSetting, setSetting } from './settings';
import {
  analyticsEvents,
  analyticsPageviews,
  analyticsSectionViews,
  analyticsSessions,
} from '../schema';

export type AnalyticsRange = 7 | 30 | 90 | 365;

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

function startOfUtcDay(daysAgo: number): string {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() - daysAgo);
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

function sinceFor(days: number): string {
  return startOfUtcDay(days - 1);
}

function previousSinceFor(days: number): string {
  return startOfUtcDay(days * 2 - 1);
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

export interface AnalyticsDailyPoint {
  date: string;
  pageviews: number;
  visitors: number;
  sessions: number;
  bounces: number;
  durationTotal: number;
  scrollTotal: number;
}

export interface AnalyticsOverview {
  days: AnalyticsRange;
  since: string;
  kpis: AnalyticsKpis;
  previous: AnalyticsKpis;
  daily: AnalyticsDailyPoint[];
  topPages: AnalyticsRow[];
  sections: AnalyticsRow[];
  referrers: AnalyticsRow[];
  devices: AnalyticsRow[];
  countries: AnalyticsRow[];
  events: AnalyticsRow[];
  plans: AnalyticsRow[];
  funnel: AnalyticsFunnelStep[];
  retentionDays: number;
}

export function parseAnalyticsRange(value: string | null | undefined): AnalyticsRange {
  const n = Number(value);
  return n === 7 || n === 90 || n === 365 ? n : 30;
}

export function analyticsRetentionDays(): number {
  const raw = Number(process.env.ANALYTICS_RETENTION_DAYS);
  if (!Number.isFinite(raw)) return 400;
  return Math.min(3650, Math.max(90, Math.round(raw)));
}

interface KpiWhere {
  pageWhere: SQL;
  sessionWhere: SQL;
}

function kpiWhere(since: string, until?: string): KpiWhere {
  if (!until) {
    return {
      pageWhere: gte(analyticsPageviews.createdAt, since),
      sessionWhere: gte(analyticsSessions.startedAt, since),
    };
  }
  return {
    pageWhere: and(gte(analyticsPageviews.createdAt, since), lt(analyticsPageviews.createdAt, until)) as SQL,
    sessionWhere: and(gte(analyticsSessions.startedAt, since), lt(analyticsSessions.startedAt, until)) as SQL,
  };
}

function readKpis(db: AppDatabase, since: string, until?: string): AnalyticsKpis {
  const { pageWhere, sessionWhere } = kpiWhere(since, until);

  const pageTotals = db
    .select({
      pageviews: count(),
      visitors: sql<number>`count(distinct ${analyticsPageviews.visitorHash})`,
      avgDuration: avg(analyticsPageviews.durationMs),
      avgScroll: avg(analyticsPageviews.maxScrollDepth),
    })
    .from(analyticsPageviews)
    .where(pageWhere)
    .get();

  const sessionTotals = db
    .select({
      sessions: count(),
      visitors: sql<number>`count(distinct ${analyticsSessions.visitorHash})`,
    })
    .from(analyticsSessions)
    .where(sessionWhere)
    .get();

  const bounceTotals = db
    .select({ bounces: count() })
    .from(analyticsSessions)
    .where(and(sessionWhere, lte(analyticsSessions.pageviews, 1)))
    .get();

  const sessions = num(sessionTotals?.sessions);
  const bounces = num(bounceTotals?.bounces);

  return {
    pageviews: num(pageTotals?.pageviews),
    visitors: Math.max(num(pageTotals?.visitors), num(sessionTotals?.visitors)),
    sessions,
    bounceRate: sessions > 0 ? Math.round((bounces / sessions) * 100) : 0,
    avgDuration: num(pageTotals?.avgDuration),
    avgScroll: num(pageTotals?.avgScroll),
  };
}

export function getAnalyticsDaily(db: AppDatabase, requestedDays: number): AnalyticsDailyPoint[] {
  const days = parseAnalyticsRange(String(requestedDays));
  const since = sinceFor(days);

  const pageRows = db
    .select({
      date: sql<string>`date(${analyticsPageviews.createdAt})`,
      pageviews: count(),
      visitors: sql<number>`count(distinct ${analyticsPageviews.visitorHash})`,
      durationTotal: sql<number>`coalesce(sum(${analyticsPageviews.durationMs}), 0)`,
      scrollTotal: sql<number>`coalesce(sum(${analyticsPageviews.maxScrollDepth}), 0)`,
    })
    .from(analyticsPageviews)
    .where(gte(analyticsPageviews.createdAt, since))
    .groupBy(sql`date(${analyticsPageviews.createdAt})`)
    .all();

  const sessionRows = db
    .select({
      date: sql<string>`date(${analyticsSessions.startedAt})`,
      sessions: count(),
      bounces: sql<number>`coalesce(sum(case when ${analyticsSessions.pageviews} <= 1 then 1 else 0 end), 0)`,
    })
    .from(analyticsSessions)
    .where(gte(analyticsSessions.startedAt, since))
    .groupBy(sql`date(${analyticsSessions.startedAt})`)
    .all();

  const pageByDate = new Map(pageRows.map((row) => [row.date, row]));
  const sessionByDate = new Map(sessionRows.map((row) => [row.date, row]));

  const cursor = new Date(`${since.slice(0, 10)}T00:00:00Z`);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const points: AnalyticsDailyPoint[] = [];
  while (cursor <= today) {
    const date = cursor.toISOString().slice(0, 10);
    const page = pageByDate.get(date);
    const session = sessionByDate.get(date);
    points.push({
      date,
      pageviews: num(page?.pageviews),
      visitors: num(page?.visitors),
      sessions: num(session?.sessions),
      bounces: num(session?.bounces),
      durationTotal: num(page?.durationTotal),
      scrollTotal: num(page?.scrollTotal),
    });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return points;
}

export interface PruneResult {
  cutoff: string;
  pageviews: number;
  sections: number;
  events: number;
  sessions: number;
}

export function pruneAnalytics(db: AppDatabase, retentionDays: number): PruneResult {
  const cutoff = startOfUtcDay(retentionDays);
  const pageviews = db
    .delete(analyticsPageviews)
    .where(lt(analyticsPageviews.createdAt, cutoff))
    .run().changes;
  const sections = db
    .delete(analyticsSectionViews)
    .where(lt(analyticsSectionViews.createdAt, cutoff))
    .run().changes;
  const events = db
    .delete(analyticsEvents)
    .where(lt(analyticsEvents.createdAt, cutoff))
    .run().changes;
  const sessions = db
    .delete(analyticsSessions)
    .where(lt(analyticsSessions.lastSeenAt, cutoff))
    .run().changes;
  return { cutoff, pageviews, sections, events, sessions };
}

const MAINTENANCE_CHECK_INTERVAL = 6 * 60 * 60 * 1000;
const PRUNE_INTERVAL = 24 * 60 * 60 * 1000;
let lastMaintenanceCheck = 0;

export function maybeRunAnalyticsMaintenance(
  db: AppDatabase,
  now = Date.now(),
): PruneResult | null {
  if (now - lastMaintenanceCheck < MAINTENANCE_CHECK_INTERVAL) return null;
  lastMaintenanceCheck = now;

  const previous = Number(getSetting(db, 'analytics_last_prune', '0'));
  if (Number.isFinite(previous) && previous > 0 && now - previous < PRUNE_INTERVAL) {
    return null;
  }

  try {
    const result = pruneAnalytics(db, analyticsRetentionDays());
    setSetting(db, 'analytics_last_prune', String(now));
    return result;
  } catch (error) {
    console.error('[analytics] maintenance error:', error);
    return null;
  }
}

export function getAnalyticsOverview(db: AppDatabase, requestedDays: number): AnalyticsOverview {
  maybeRunAnalyticsMaintenance(db);

  const days = parseAnalyticsRange(String(requestedDays));
  const since = sinceFor(days);
  const previousSince = previousSinceFor(days);
  const inRange = gte(analyticsPageviews.createdAt, since);
  const kpis = readKpis(db, since);
  const previous = readKpis(db, previousSince, since);

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
    .select({ label: analyticsSessions.referrer, views: count() })
    .from(analyticsSessions)
    .where(gte(analyticsSessions.startedAt, since))
    .groupBy(analyticsSessions.referrer)
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

  const daily = getAnalyticsDaily(db, days);
  const retentionDays = analyticsRetentionDays();

  return {
    days,
    since,
    kpis,
    previous,
    daily,
    topPages,
    sections,
    referrers,
    devices,
    countries,
    events,
    plans,
    funnel,
    retentionDays,
  };
}
