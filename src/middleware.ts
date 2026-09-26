import { defineMiddleware } from 'astro:middleware';
import { SESSION_COOKIE, createSessionToken, sessionCookieOptions, verifySessionToken } from './lib/auth';

const PUBLIC_ADMIN_PATHS = new Set(['/admin/login', '/admin/logout']);

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  if (!pathname.startsWith('/admin')) {
    return next();
  }

  const userAgent = context.request.headers.get('user-agent');
  const token = context.cookies.get(SESSION_COOKIE)?.value;
  const session = verifySessionToken(token, userAgent);

  if (session) {
    context.cookies.set(SESSION_COOKIE, createSessionToken(userAgent), sessionCookieOptions());
  } else if (!PUBLIC_ADMIN_PATHS.has(pathname)) {
    return context.redirect('/admin/login');
  }

  const response = await next();
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  response.headers.set('Cache-Control', 'no-store');
  return response;
});
