import { defineMiddleware } from 'astro:middleware';
import { getLocaleFromPath } from './lib/i18n';
import {
  CSRF_COOKIE,
  SESSION_COOKIE,
  createCsrfValue,
  createSessionToken,
  sessionCookieOptions,
  verifySessionToken,
} from './lib/auth';

const PUBLIC_ADMIN_PATHS = new Set(['/admin/login', '/admin/logout']);

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  const forcedLocale = context.request.headers.get('x-casterfly-locale');
  const localeInfo = forcedLocale === 'en'
    ? { locale: 'en' as const, path: pathname }
    : getLocaleFromPath(pathname);

  context.locals.locale = localeInfo.locale;
  context.locals.pathWithoutLocale = localeInfo.path;
  context.locals.originalPathname = pathname;

  if (localeInfo.locale === 'en' && forcedLocale !== 'en') {
    if (localeInfo.path.startsWith('/admin')) {
      return context.redirect(localeInfo.path, 302);
    }
    const url = new URL(context.url);
    url.pathname = localeInfo.path;
    const headers = new Headers(context.request.headers);
    headers.set('x-casterfly-locale', 'en');
    return context.rewrite(new Request(url, { method: context.request.method, headers }));
  }

  if (pathname === '/es' || pathname.startsWith('/es/')) {
    return context.redirect(localeInfo.path, 301);
  }

  if (!pathname.startsWith('/admin')) {
    return next();
  }

  const userAgent = context.request.headers.get('user-agent');
  const token = context.cookies.get(SESSION_COOKIE)?.value;
  const session = verifySessionToken(token, userAgent);

  if (session) {
    context.cookies.set(SESSION_COOKIE, createSessionToken(userAgent), sessionCookieOptions());
    if (!context.cookies.get(CSRF_COOKIE)?.value) {
      context.cookies.set(CSRF_COOKIE, createCsrfValue(), sessionCookieOptions());
    }
  } else if (!PUBLIC_ADMIN_PATHS.has(pathname)) {
    return context.redirect('/admin/login');
  }

  const response = await next();
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  response.headers.set('Cache-Control', 'no-store');
  return response;
});
