import type { APIRoute } from 'astro';
import { getDatabase } from '../lib/db/client';
import { getRobotsTxt } from '../lib/seo';
import { SITE } from '../lib/site';

export const prerender = false;

export const GET: APIRoute = () => {
  const text = getRobotsTxt(getDatabase(), SITE.url);
  return new Response(text, {
    headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' },
  });
};
