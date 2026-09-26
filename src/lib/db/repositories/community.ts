import { asc, eq } from 'drizzle-orm';
import { z } from 'zod';
import type { AppDatabase } from '../client';
import { communityRadios, type CommunityRadio } from '../schema';

export interface ListOptions {
  activeOnly?: boolean;
}

const communityInput = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  slug: z.string().nullish(),
  description: z.string().nullish(),
  logoUrl: z.string().nullish(),
  siteUrl: z.string().min(1, 'El sitio es obligatorio'),
  displayOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export type CommunityInput = z.input<typeof communityInput>;

export function listCommunity(db: AppDatabase, options: ListOptions = {}): CommunityRadio[] {
  return db
    .select()
    .from(communityRadios)
    .where(options.activeOnly ? eq(communityRadios.isActive, true) : undefined)
    .orderBy(asc(communityRadios.displayOrder), asc(communityRadios.id))
    .all();
}

export function getCommunityById(db: AppDatabase, id: number): CommunityRadio | undefined {
  return db.select().from(communityRadios).where(eq(communityRadios.id, id)).get();
}

export function createCommunityRadio(db: AppDatabase, input: CommunityInput): CommunityRadio {
  const data = communityInput.parse(input);
  return db.insert(communityRadios).values(data).returning().get();
}

export function updateCommunityRadio(
  db: AppDatabase,
  id: number,
  input: Partial<CommunityInput>,
): CommunityRadio {
  const data = communityInput.partial().parse(input);
  return db.update(communityRadios).set(data).where(eq(communityRadios.id, id)).returning().get();
}

export function setCommunityActive(db: AppDatabase, id: number, isActive: boolean): CommunityRadio {
  return db.update(communityRadios).set({ isActive }).where(eq(communityRadios.id, id)).returning().get();
}

export function deleteCommunityRadio(db: AppDatabase, id: number): void {
  db.delete(communityRadios).where(eq(communityRadios.id, id)).run();
}
