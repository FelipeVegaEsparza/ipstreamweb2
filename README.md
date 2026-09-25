# IPStream — sitio web

Nueva versión del sitio de [ipstream.cl](https://ipstream.cl): Astro SSR con
backend JavaScript y SQLite, más un panel interno `/admin` para administrar
planes y contenido. Rediseño bajo el concepto **"Al Aire"** (estética de consola
de broadcast, paleta derivada del logo).

## Stack

- **Astro 7** en modo SSR (`output: 'server'`) con `@astrojs/node` standalone.
- **SQLite** vía `better-sqlite3` + **Drizzle ORM** (migraciones versionadas en `drizzle/`).
- **Astro Actions + Zod** para las mutaciones del panel.
- **sharp** para optimización de imágenes subidas (resize 1920px + WebP).
- **Vitest** y **oxlint** para pruebas y lint.

## Estructura

```
src/
  actions/            Astro Actions del panel (login + CRUD)
  components/         UI del sitio (Header, Footer, design system)
  layouts/            BaseLayout, SiteLayout, AdminLayout
  lib/
    db/               cliente SQLite, schema Drizzle, repositorios
    migration/        extracción de contenido del sitio actual
    auth.ts           sesión firmada y CSRF
    content.ts        contenido editorial (características, FAQ, etc.)
  middleware.ts       protegido de /admin
  pages/              sitio público + /admin + endpoint /api/health
scripts/
  migrate-content.ts  migración idempotente desde ipstream.cl
drizzle/              migraciones SQL (se aplican al arrancar)
```

## Desarrollo

```bash
cp .env.example .env
npm install
npm run dev
```

Comandos:

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción (servidor Node) |
| `npm run typecheck` | `astro check` |
| `npm run lint` | `oxlint` |
| `npm test` | Pruebas con Vitest |
| `npm run migrate:content` | Migra contenido desde `SOURCE_SITE` |

> El servidor de desarrollo se puede correr en segundo plano con
> `astro dev --background` y gestionar con `astro dev status` / `astro dev stop`.

## Panel `/admin`

- Acceso con `ADMIN_USER` / `ADMIN_PASS` (variables de entorno).
- Administra planes y categorías, noticias, tutoriales y sus categorías,
  portafolio de clientes, comunidad y enlaces de redes sociales.
- Sesión con cookie firmada (`httpOnly`, `Secure`, `SameSite=Lax`), expiración
  por inactividad, protección CSRF y `noindex`.

## Migración de contenido

```bash
SOURCE_SITE=https://ipstream.cl npm run migrate:content
```

Es idempotente (upsert por `plan_key`/`slug`) y reporta conteos por tipo. Las
imágenes se descargan a `UPLOADS_DIR`; una imagen no disponible no aborta el
proceso.

## Despliegue

Ver [`docs/deploy.md`](docs/deploy.md). La app corre en Docker con volúmenes
persistentes para `app.db` y `uploads`.
