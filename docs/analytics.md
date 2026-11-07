# Analítica propia del sitio

Medición first-party del sitio público, servida por el mismo Astro/SQLite. No usa
GA4, GTM ni cookies de terceros.

## Cómo funciona

- `src/layouts/SiteLayout.astro` inyecta el tracker solo en páginas públicas. El
  admin usa `AdminLayout`, así que `/admin` nunca se mide.
- El tracker envía un `pageview` al cargar, la salida con `sendBeacon`, el scroll
  máximo, las secciones visibles (`IntersectionObserver`) y eventos de clic
  (planes, CTAs, demo, formulario de contacto).
- `POST /api/analytics/collect` valida el cuerpo con Zod, descarta bots y
  peticiones limitadas por rate limit, y resuelve país con `geoip-lite` y
  dispositivo/navegador/SO con `ua-parser-js`.
- El panel vive en `/admin/analitica` (`?range=7`, `30`, `90` o `365`) y se
  alimenta de `src/lib/db/repositories/analytics.ts`.
- Incluye actividad diaria, comparación con el periodo anterior y exportación
  CSV (`/admin/analitica/export?range=30`).

## Privacidad

- La IP no se guarda: solo se usa en memoria para geolocalizar y limitar tasa.
- El visitante se identifica con un UUID aleatorio del navegador; el servidor
  guarda un HMAC-SHA256 (`ANALYTICS_SALT`, o `SESSION_SECRET` como fallback).
- Se respetan `DNT: 1`, `Sec-GPC: 1`, `navigator.doNotTrack`,
  `globalPrivacyControl` y `navigator.webdriver`. No se mide a bots por user-agent.
- No se guardan ciudad ni región; solo país.

## Datos

Tablas creadas por `drizzle/0005_analytics.sql`:

- `analytics_sessions`: sesión, landing/exit, referrer, UTM, país y device.
- `analytics_pageviews`: una fila por página vista, con duración y scroll.
- `analytics_section_views`: una fila por página + sección, con duración y
  proporción visible.
- `analytics_events`: clics y envíos (`plan_click`, `cta_registro`, etc.).

## Retención

Los datos crudos se conservan `ANALYTICS_RETENTION_DAYS` días (por defecto 400;
mínimo 90, máximo 3650). La limpieza corre como máximo una vez al día, de forma
perezosa, al recibir una visita o abrir el panel. Con el valor por defecto los
cuatro rangos del panel (7, 30, 90 y 365 días) tienen detalle completo.

## Variables

- `ANALYTICS_SALT` (opcional): sal del hash de visitante. Si falta, se usa
  `SESSION_SECRET`.
- `ANALYTICS_RETENTION_DAYS` (opcional): días de datos crudos, default 400.
- No hace falta tocar nodos ni el panel de clientes: es solo del sitio.
