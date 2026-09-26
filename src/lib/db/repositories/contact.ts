import { desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import type { AppDatabase } from '../client';
import { contactMessages, type ContactMessage } from '../schema';

export interface ListOptions {
  unreadOnly?: boolean;
}

const contactInput = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio'),
  email: z.email('El correo no es válido'),
  phone: z.string().trim().nullish(),
  subject: z.string().trim().nullish(),
  message: z.string().trim().min(1, 'El mensaje es obligatorio'),
  isRead: z.boolean().default(false),
});

export type ContactInput = z.input<typeof contactInput>;

export function listContactMessages(db: AppDatabase, options: ListOptions = {}): ContactMessage[] {
  return db
    .select()
    .from(contactMessages)
    .where(options.unreadOnly ? eq(contactMessages.isRead, false) : undefined)
    .orderBy(desc(contactMessages.createdAt), desc(contactMessages.id))
    .all();
}

export function getContactMessageById(db: AppDatabase, id: number): ContactMessage | undefined {
  return db.select().from(contactMessages).where(eq(contactMessages.id, id)).get();
}

export function createContactMessage(db: AppDatabase, input: ContactInput): ContactMessage {
  const data = contactInput.parse(input);
  return db.insert(contactMessages).values(data).returning().get();
}

export function setContactMessageRead(db: AppDatabase, id: number, isRead: boolean): ContactMessage {
  return db.update(contactMessages).set({ isRead }).where(eq(contactMessages.id, id)).returning().get();
}

export function deleteContactMessage(db: AppDatabase, id: number): void {
  db.delete(contactMessages).where(eq(contactMessages.id, id)).run();
}
