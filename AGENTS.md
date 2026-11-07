# Guía para agentes

Proyecto Astro SSR (v7) + SQLite/Drizzle + Astro Actions. Panel interno en
`/admin`.

## Comandos

| Comando | Uso |
| --- | --- |
| `npm run dev` | Desarrollo (`astro dev --background` para segundo plano; `astro dev status` / `stop` / `logs`) |
| `npm run build` | Build de producción |
| `npm run typecheck` | `astro check` |
| `npm run lint` | `oxlint` |
| `npm test` | `vitest run` |
| `npm run migrate:content` | Migración de contenido desde `SOURCE_SITE` |

Antes de cerrar un cambio, correr `npm run typecheck && npm run lint && npm test && npm run build`.

## Convenciones

- **Diseño "Al Aire"**: usar SIEMPRE los tokens de `src/styles/tokens.css`.
  Nunca colores sueltos. El gradiente `--signal-gradient` (cyan→azul) es el
  único del sistema y solo se usa en elementos de señal (waveform, medidores,
  badge on-air). No usar `Inter`, `Poppins`, `Outfit` ni `Space Grotesk`
  (hay un test que lo verifica). Componentes base en `src/components/ui/`.
- **Datos**: todo acceso a SQLite pasa por `src/lib/db/repositories/*`. Los
  cambios de esquema se hacen en `src/lib/db/schema.ts` y se versionan con
  `npm run db:generate`. Las migraciones se aplican al arrancar la app.
- **Admin**: las mutaciones se implementan como Astro Actions en
  `src/actions/index.ts` con validación Zod, y llaman al guard de sesión/CSRF.
  Los formularios viven en `src/pages/admin/*` y usan clases de `src/styles/admin.css`.
- **Migración de contenido**: parsers en `src/lib/migration/source.ts` y upserts
  idempotentes en `src/lib/migration/upsert.ts`; no debe ser dependencia de runtime.
- **Sin comentarios innecesarios** en el código.

## Rutas

- Públicas: `/`, `/planes`, `/caracteristicas`, `/tutoriales`, `/noticias`,
  `/noticias/[slug]`, `/clientes`, `/comunidad`, `/soporte`, `/404`.
  `/caracteristicas`, `/soporte`, `/404`, `/robots.txt` y `/sitemap.xml` son
  `prerender`.
- Admin: `/admin` y subrutas, protegidas por `src/middleware.ts`.
- Health: `/api/health`.
- `/uploads/[...path]` sirve las imágenes del volumen de uploads.

## Analítica del sitio

- El tracker vive en `src/layouts/SiteLayout.astro` (solo páginas públicas;
  `/admin` usa `AdminLayout` y no se mide).
- Ingesta: `POST /api/analytics/collect`. Tablas `analytics_sessions`,
  `analytics_pageviews`, `analytics_section_views` y `analytics_events`.
- Panel: `/admin/analitica` (rangos 7/30/90/365) y CSV en
  `/admin/analitica/export?range=30`.
- Privacidad: no se guarda IP cruda, el visitante se hashea con HMAC, se
  respetan DNT/GPC y se filtran bots. Solo se guarda país.
- Retención: `ANALYTICS_RETENTION_DAYS` (default 400, mínimo 90). La limpieza
  corre como máximo una vez al día de forma perezosa.

## Imágenes de reproductores

- Las fuentes están en `src/assets/players/*.png`. Los WebP responsive se
  generan con `npm run optimize:players` en `src/assets/players/generated/`.
- `PlayerCard.astro` los sirve desde `/media/players/<id>-<ancho>.webp` con
  `srcset` 400/800/1200 y caché de 30 días.
- Al agregar o reemplazar una imagen, actualizar el mapeo `PLAYER_IDS`, correr
  `npm run optimize:players` y ajustar la regex de la ruta si cambia el rango
  de ids.
