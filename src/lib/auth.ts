import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

export const SESSION_COOKIE = 'ipstream_admin';
export const CSRF_COOKIE = 'ipstream_csrf';
export const SESSION_MAX_AGE = 60 * 60 * 2;

export interface SessionPayload {
  sub: string;
  iat: number;
  fp: string;
}

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error('SESSION_SECRET no esta configurado');
  }
  return secret;
}

function sign(value: string): string {
  return createHmac('sha256', getSecret()).update(value).digest('base64url');
}

function safeEqual(a: string, b: string): boolean {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  if (bufferA.length !== bufferB.length) return false;
  return timingSafeEqual(bufferA, bufferB);
}

export function fingerprint(userAgent: string | null | undefined): string {
  return createHash('sha256').update(userAgent ?? 'unknown').digest('base64url').slice(0, 16);
}

export function createSessionToken(userAgent: string | null | undefined): string {
  const payload: SessionPayload = {
    sub: 'admin',
    iat: Math.floor(Date.now() / 1000),
    fp: fingerprint(userAgent),
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${encoded}.${sign(encoded)}`;
}

export function verifySessionToken(
  token: string | undefined | null,
  userAgent: string | null | undefined,
): SessionPayload | null {
  if (!token) return null;
  const [encoded, signature] = token.split('.');
  if (!encoded || !signature) return null;
  if (!safeEqual(signature, sign(encoded))) return null;
  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString()) as SessionPayload;
    if (payload.sub !== 'admin') return null;
    if (payload.fp !== fingerprint(userAgent)) return null;
    const age = Math.floor(Date.now() / 1000) - payload.iat;
    if (age < 0 || age > SESSION_MAX_AGE) return null;
    return payload;
  } catch {
    return null;
  }
}

export function sessionCookieOptions(maxAge = SESSION_MAX_AGE) {
  return {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge,
  };
}

export function createCsrfValue(): string {
  return randomBytes(32).toString('base64url');
}

export function verifyCsrfValue(expected: string | undefined, token: unknown): boolean {
  if (!expected || typeof token !== 'string' || token === '') return false;
  return safeEqual(token, expected);
}

export function credentialsConfigured(): boolean {
  return Boolean(process.env.ADMIN_USER && process.env.ADMIN_PASS);
}

export function checkCredentials(username: string, password: string): boolean {
  const expectedUser = process.env.ADMIN_USER;
  const expectedPass = process.env.ADMIN_PASS;
  if (!expectedUser || !expectedPass) return false;
  return safeEqual(username, expectedUser) && safeEqual(password, expectedPass);
}
