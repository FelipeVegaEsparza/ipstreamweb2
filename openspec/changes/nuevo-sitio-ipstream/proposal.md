# Proposal

## Why

El sitio actual de ipstream.cl es un Astro compilado que convive con lógica PHP y un panel admin artesanal sobre MySQL, difícil de mantener y con una identidad visual genérica (Tailwind por defecto, `Inter`, degradados). Se necesita una versión nueva, autocontenida y moderna —Astro SSR con backend JavaScript y SQLite— que replique el contenido y las URLs, administre los planes y el contenido desde un panel interno, y tenga un diseño propio con carácter.

## What Changes

- Nuevo proyecto Astro SSR (`output: 'server'`, adapter `@astrojs/node` standalone) en `sitioweb`, sin PHP.
- Persistencia en SQLite con repositorios JavaScript: planes, categorías de planes, noticias, tutoriales, categorías de tutoriales, portafolio de clientes, radios de comunidad y ajustes/redes sociales.
- `/admin` con login (único admin por variables de entorno, sesión con cookie firmada) y CRUD de planes/categorías y de las secciones de contenido.
- Sitio público con paridad de contenido y estructura de URLs, rediseñado bajo el concepto "Al Aire" (estética de consola de broadcast, paleta derivada del logo actual).
- Migración/carga inicial de contenido desde las APIs públicas del sitio actual y scraping de las páginas renderizadas en servidor.
- Despliegue en Docker + Dokploy, con volúmenes para `app.db` y `/uploads`.
- **BREAKING**: se retiran del alcance los flujos de pago/Flow, checkout, `pago-*` y landing/leads; no se migran `orders`, `monthly_payments`, `payment_logs`, `landing_leads` ni `lead_logs`.

## Capabilities

### New Capabilities
- `content-store`: esquema SQLite de contenido y repositorios de acceso a datos.
- `public-site`: páginas del sitio público en Astro, renderizado (SSR/prerender) y SEO.
- `admin-panel`: autenticación del panel interno y CRUD de planes y contenido.
- `design-system`: sistema visual "Al Aire" —tokens, tipografía, componentes y movimiento.
- `content-migration`: extracción del contenido existente y carga inicial en SQLite.
- `deployment`: empaquetado Docker, volúmenes y configuración de entorno para Dokploy.

### Modified Capabilities
<!-- Sin capacidades existentes: el proyecto no tiene specs todavía. -->
- Ninguna.

## Impact

- Proyecto nuevo en `/home/fvegadev/PanelIpstream/sitioweb` (hoy vacío, solo `openspec/`).
- Dependencias nuevas: Astro, `@astrojs/node`, `better-sqlite3` (o Drizzle ORM), `sharp`, `zod`.
- Se descartan del proyecto las dependencias PHP/MySQL del sitio actual.
- `Dockerfile` + `docker-compose.yml` para Dokploy; volúmenes persistentes `app.db` y `/uploads`.
- Estructura de URLs públicas preservada (`/`, `/planes`, `/caracteristicas`, `/tutoriales`, `/noticias`, `/clientes`, `/comunidad`, `/soporte`, `/404`) por SEO.
- Datos de origen: APIs en vivo de ipstream.cl (`get-plans.php`, `news.php`, `get-tutorials.php`) más scraping de `/clientes`, `/comunidad` y assets de `/images` y `/uploads`.
