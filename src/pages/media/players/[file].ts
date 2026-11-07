import type { APIRoute } from 'astro';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

export const prerender = false;

const ALLOWED_FILE = /^[1-6]-(400|800|1200)\.webp$/;

export const GET: APIRoute = async ({ params }) => {
  const file = params.file ?? '';
  if (!ALLOWED_FILE.test(file)) {
    return new Response('Not found', { status: 404 });
  }

  try {
    const data = await readFile(resolve(process.cwd(), 'src/assets/players/generated', file));
    return new Response(data, {
      headers: {
        'Content-Type': 'image/webp',
        'Content-Length': String(data.byteLength),
        'Cache-Control': 'public, max-age=2592000, stale-while-revalidate=86400',
      },
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
};
