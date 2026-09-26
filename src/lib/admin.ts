import type { APIContext } from 'astro';
import { CSRF_COOKIE, SESSION_COOKIE, verifySessionToken, type SessionPayload } from './auth';

export interface AdminContext {
  session: SessionPayload | null;
  csrf: string;
}

export function getAdminContext(context: APIContext): AdminContext {
  const token = context.cookies.get(SESSION_COOKIE)?.value;
  const session = verifySessionToken(token, context.request.headers.get('user-agent'));
  const csrf = context.cookies.get(CSRF_COOKIE)?.value ?? '';
  return { session, csrf };
}
