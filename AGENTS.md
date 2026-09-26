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
