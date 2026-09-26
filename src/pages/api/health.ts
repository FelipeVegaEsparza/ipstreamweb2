import type { APIRoute } from 'astro';
import { getDatabase } from '../../lib/db/client';
import { settings } from '../../lib/db/schema';

export const prerender = false;

export const GET: APIRoute = () => {
  try {
    getDatabase().select().from(settings).limit(1).all();
    return new Response(JSON.stringify({ status: 'ok' }), {
      headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
    });
  } catch {
    return new Response(JSON.stringify({ status: 'error' }), {
      status: 503,
      headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
    });
  }
};
