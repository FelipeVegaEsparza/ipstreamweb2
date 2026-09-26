import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

export interface ImageContext {
  site: string;
  uploadsDir: string;
}

export function uploadedPath(src: string | null | undefined): string | null {
  if (!src) return null;
  try {
    const url = new URL(src, 'https://placeholder.local');
    if (!url.pathname.startsWith('/uploads/')) return null;
    return url.pathname;
  } catch {
    return null;
  }
}

/**
 * Descarga una imagen referenciada en /uploads hacia el almacenamiento local.
 * Devuelve la ruta publica local, la URL original si no es localizable, o null
 * si la descarga falla (sin abortar la migracion).
 */
export async function downloadImage(src: string | null, context: ImageContext): Promise<string | null> {
  if (!src) return null;
  const publicPath = uploadedPath(src);
  if (!publicPath) {
    return src.startsWith('http') ? src : null;
  }
  try {
    const response = await fetch(new URL(publicPath, context.site));
    if (!response.ok) return null;
    const buffer = Buffer.from(await response.arrayBuffer());
    const relative = publicPath.replace(/^\/+/, '').replace(/^uploads\//, '');
    const destination = join(context.uploadsDir, relative);
    await mkdir(dirname(destination), { recursive: true });
    await writeFile(destination, buffer);
    return `/uploads/${relative}`;
  } catch {
    return null;
  }
}
