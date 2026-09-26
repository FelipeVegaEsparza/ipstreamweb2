import { asc, eq, sql } from 'drizzle-orm';
import type { AppDatabase } from '../client';
import { settings, type Setting } from '../schema';

export const SOCIAL_KEYS = [
  'social_facebook',
  'social_twitter',
  'social_instagram',
  'social_youtube',
  'social_tiktok',
] as const;

export type SocialKey = (typeof SOCIAL_KEYS)[number];

export function getSetting(db: AppDatabase, key: string, fallback: string | null = null): string | null {
  const row = db.select().from(settings).where(eq(settings.key, key)).get();
  return row?.value ?? fallback;
}

export function getAllSettings(db: AppDatabase): Setting[] {
  return db.select().from(settings).orderBy(asc(settings.key)).all();
}

export function setSetting(db: AppDatabase, key: string, value: string): Setting {
  return db
    .insert(settings)
    .values({ key, value })
    .onConflictDoUpdate({
      target: settings.key,
      set: { value, updatedAt: sql`CURRENT_TIMESTAMP` },
    })
    .returning()
    .get();
}

export function getSocialLinks(db: AppDatabase): Record<SocialKey, string> {
  return Object.fromEntries(
    SOCIAL_KEYS.map((key) => [key, getSetting(db, key, '') ?? '']),
  ) as Record<SocialKey, string>;
}

export function setSocialLinks(db: AppDatabase, links: Partial<Record<SocialKey, string>>): void {
  for (const key of SOCIAL_KEYS) {
    if (key in links) {
      setSetting(db, key, links[key] ?? '');
    }
  }
}
