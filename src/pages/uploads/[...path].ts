import { readFile } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import type { APIRoute } from 'astro';

export const prerender = false;

const MIME: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
};

export const GET: APIRoute = async ({ params }) => {
  const relative = params.path ?? '';
  const uploadsDir = resolve(process.env.UPLOADS_DIR ?? './uploads');
  const target = resolve(uploadsDir, relative);

  if (!target.startsWith(uploadsDir) || relative.trim() === '') {
    return new Response('Not found', { status: 404 });
  }

  try {
    const data = await readFile(target);
    return new Response(new Uint8Array(data), {
      headers: {
        'content-type': MIME[extname(target).toLowerCase()] ?? 'application/octet-stream',
        'cache-control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
};
