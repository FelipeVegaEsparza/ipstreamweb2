import type { APIRoute } from 'astro';
import { createHmac } from 'node:crypto';
import { z } from 'zod';
import geoip from 'geoip-lite';
import { UAParser } from 'ua-parser-js';
import { getDatabase } from '../../../lib/db/client';
import {
  maybeRunAnalyticsMaintenance,
  recordEvent,
  recordPageLeave,
  recordPageview,
  recordSection,
} from '../../../lib/db/repositories/analytics';

export const prerender = false;

const bodySchema = z.object({
  type: z.enum(['pageview', 'pageleave', 'section', 'event']),
  sessionId: z.string().min(8).max(64),
  visitorId: z.string().min(8).max(64),
  pageviewId: z.string().min(8).max(64).optional(),
  path: z.string().min(1).max(500),
  title: z.string().max(200).optional(),
  referrer: z.string().max(500).optional(),
  locale: z.enum(['es', 'en']).optional(),
  screenWidth: z.number().int().min(0).max(10000).optional(),
  screenHeight: z.number().int().min(0).max(10000).optional(),
  utmSource: z.string().max(120).optional(),
  utmMedium: z.string().max(120).optional(),
  utmCampaign: z.string().max(120).optional(),
  durationMs: z.number().min(0).max(24 * 60 * 60 * 1000).optional(),
  maxScrollDepth: z.number().min(0).max(100).optional(),
  sectionKey: z.string().max(120).optional(),
  sectionLabel: z.string().max(200).optional(),
  maxVisibleRatio: z.number().min(0).max(1).optional(),
  name: z.string().max(64).optional(),
  label: z.string().max(200).optional(),
  value: z.number().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

const BOT_PATTERN =
  /bot|crawler|spider|slurp|bingpreview|facebookexternalhit|headlesschrome|python-requests|curl|wget|scrapy|semrush|ahrefs/i;

const rate = new Map<string, { count: number; resetAt: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rate.get(ip);
  if (!entry || now > entry.resetAt) {
    rate.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  entry.count += 1;
  return entry.count > 180;
}

function clientIp(request: Request): string {
  const cloudflare = request.headers.get('cf-connecting-ip');
  if (cloudflare) return cloudflare.trim();
  const forwarded = request.headers.get('x-forwarded-for');
  const firstHop = forwarded
    ?.split(',')
    .map((value) => value.trim())
    .filter(Boolean)[0];
  return firstHop || request.headers.get('x-real-ip') || '';
}

function normalizePath(value: string): string {
  try {
    const url = new URL(value, 'https://casterfly.com');
    return (url.pathname || '/').slice(0, 500);
  } catch {
    return '/';
  }
}

function normalizeReferrer(value: string | undefined, requestHost: string | null): string | null {
  if (!value) return null;
  try {
    const hostname = new URL(value).hostname.toLowerCase();
    const ownHost = (requestHost || '').split(':')[0].toLowerCase();
    const ownDomains = ['casterfly.com', 'ipstream.cl'];
    if (
      (ownHost && (hostname === ownHost || hostname === `www.${ownHost}`)) ||
      ownDomains.some((domain) => hostname === domain) ||
      hostname.endsWith('.casterfly.com') ||
      hostname.endsWith('.ipstream.cl')
    ) {
      return null;
    }
    return hostname.slice(0, 200) || null;
  } catch {
    return null;
  }
}

function clean(value: string | undefined, max: number): string | null {
  const trimmed = (value || '').trim();
  return trimmed ? trimmed.slice(0, max) : null;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    if (request.headers.get('dnt') === '1' || request.headers.get('sec-gpc') === '1') {
      return new Response(null, { status: 204 });
    }

    const ua = request.headers.get('user-agent') || '';
    if (!ua || BOT_PATTERN.test(ua)) {
      return new Response(null, { status: 204 });
    }

    const ip = clientIp(request);
    if (rateLimited(ip || 'unknown')) {
      return new Response(null, { status: 204 });
    }

    const contentLength = Number(request.headers.get('content-length') || 0);
    if (contentLength > 32_000) {
      return new Response(null, { status: 413 });
    }

    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return new Response(null, { status: 400 });
    }

    const body = parsed.data;
    const sessionId = body.sessionId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);
    const pageviewId = body.pageviewId?.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);
    if (!sessionId) return new Response(null, { status: 400 });

    const visitorHash = createHmac(
      'sha256',
      process.env.ANALYTICS_SALT || process.env.SESSION_SECRET || 'casterfly-analytics',
    )
      .update(body.visitorId)
      .digest('hex')
      .slice(0, 32);

    const path = normalizePath(body.path);
    const parser = new UAParser(ua).getResult();
    const geo = ip ? geoip.lookup(ip) : null;
    const language = request.headers.get('accept-language')?.split(',')[0]?.slice(0, 20) || null;
    const referrer = normalizeReferrer(body.referrer, request.headers.get('host'));

    const context = {
      sessionId,
      visitorHash,
      path,
      referrer,
      utmSource: clean(body.utmSource, 120),
      utmMedium: clean(body.utmMedium, 120),
      utmCampaign: clean(body.utmCampaign, 120),
      country: geo?.country || null,
      region: null,
      city: null,
      device: parser.device.type || 'desktop',
      browser: parser.browser.name || null,
      os: parser.os.name || null,
      language,
      screenWidth: body.screenWidth ?? null,
      screenHeight: body.screenHeight ?? null,
    };

    const db = getDatabase();

    if (body.type === 'pageview') {
      if (!pageviewId) return new Response(null, { status: 400 });
      recordPageview(db, {
        ...context,
        pageviewId,
        title: clean(body.title, 200),
        locale: body.locale || null,
      });
    } else if (body.type === 'pageleave') {
      if (!pageviewId) return new Response(null, { status: 400 });
      recordPageLeave(db, {
        pageviewId,
        sessionId,
        visitorHash,
        path,
        durationMs: body.durationMs ?? 0,
        maxScrollDepth: body.maxScrollDepth ?? 0,
      });
    } else if (body.type === 'section') {
      if (!pageviewId || !body.sectionKey) return new Response(null, { status: 400 });
      recordSection(db, {
        pageviewId,
        sessionId,
        visitorHash,
        path,
        sectionKey: body.sectionKey.slice(0, 120),
        sectionLabel: clean(body.sectionLabel, 200),
        durationMs: body.durationMs ?? 0,
        maxVisibleRatio: body.maxVisibleRatio ?? 0,
      });
    } else {
      if (!body.name) return new Response(null, { status: 400 });
      const metadata = body.metadata ? JSON.stringify(body.metadata) : null;
      recordEvent(db, {
        sessionId,
        visitorHash,
        pageviewId: pageviewId || null,
        path,
        name: body.name.slice(0, 64),
        label: clean(body.label, 200),
        value: body.value ?? null,
        metadata: metadata && metadata.length <= 2000 ? metadata : null,
      });
    }

    maybeRunAnalyticsMaintenance(db);

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('[analytics] collect error:', error);
    return new Response(null, { status: 204 });
  }
};

export const GET: APIRoute = () => new Response(null, { status: 405 });
