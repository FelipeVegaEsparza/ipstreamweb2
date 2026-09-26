import type { APIContext } from 'astro';
import { SESSION_COOKIE, csrfToken, verifySessionToken, type SessionPayload } from './auth';

export interface AdminContext {
  session: SessionPayload | null;
  csrf: string;
}

export function getAdminContext(context: APIContext): AdminContext {
  const token = context.cookies.get(SESSION_COOKIE)?.value;
  const session = verifySessionToken(token, context.request.headers.get('user-agent'));
  const csrf = session && token ? csrfToken(token) : '';
  return { session, csrf };
}
