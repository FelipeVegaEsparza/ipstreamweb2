import type { APIRoute } from 'astro';
import { getDatabase } from '../../../lib/db/client';
import {
  getAnalyticsDaily,
  parseAnalyticsRange,
} from '../../../lib/db/repositories/analytics';

export const prerender = false;

const HEADER = [
  'fecha',
  'paginas_vistas',
  'visitantes_dia',
  'sesiones',
  'rebotes',
  'tasa_rebote_pct',
  'tiempo_medio_ms',
  'scroll_medio_pct',
];

function round(value: number): number {
  return Number.isFinite(value) ? Math.round(value) : 0;
}

function escapeCsv(value: string | number): string {
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export const GET: APIRoute = ({ url }) => {
  const days = parseAnalyticsRange(url.searchParams.get('range'));
  const daily = getAnalyticsDaily(getDatabase(), days);

  const rows = daily.map((point) => {
    const avgDuration = point.pageviews > 0 ? round(point.durationTotal / point.pageviews) : 0;
    const avgScroll = point.pageviews > 0 ? round(point.scrollTotal / point.pageviews) : 0;
    const bounceRate = point.sessions > 0 ? round((point.bounces / point.sessions) * 100) : 0;
    return [
      point.date,
      point.pageviews,
      point.visitors,
      point.sessions,
      point.bounces,
      bounceRate,
      avgDuration,
      avgScroll,
    ];
  });

  const totals = daily.reduce(
    (acc, point) => ({
      pageviews: acc.pageviews + point.pageviews,
      sessions: acc.sessions + point.sessions,
      bounces: acc.bounces + point.bounces,
      durationTotal: acc.durationTotal + point.durationTotal,
      scrollTotal: acc.scrollTotal + point.scrollTotal,
    }),
    { pageviews: 0, sessions: 0, bounces: 0, durationTotal: 0, scrollTotal: 0 },
  );

  rows.push([
    'TOTAL',
    totals.pageviews,
    '',
    totals.sessions,
    totals.bounces,
    totals.sessions > 0 ? round((totals.bounces / totals.sessions) * 100) : 0,
    totals.pageviews > 0 ? round(totals.durationTotal / totals.pageviews) : 0,
    totals.pageviews > 0 ? round(totals.scrollTotal / totals.pageviews) : 0,
  ]);

  const csv = `\ufeff${[HEADER, ...rows]
    .map((row) => row.map(escapeCsv).join(','))
    .join('\r\n')}\r\n`;

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="casterfly-analitica-${days}d.csv"`,
      'Cache-Control': 'no-store',
    },
  });
};
