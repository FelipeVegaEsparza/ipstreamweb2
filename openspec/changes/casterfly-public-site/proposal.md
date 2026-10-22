# Proposal

## Why

El sitio público de la plataforma sigue publicado como IPStream en `ipstream.cl`, en un servidor separado (Dokploy), con enlaces al panel viejo y contenido de marca anterior. El nombre definitivo es CasterFly y el sitio debe vivir en la raíz de `casterfly.com`, servido desde el mismo VPS que el panel.

## What Changes

- **Nuevo hosting**: desplegar la app Astro SSR + SQLite que hoy corre en Dokploy como contenedor `site` en el VPS del panel. Usa su propio volumen SQLite (`site_data`) y su volumen de uploads (`site_uploads`), separados del panel.
- **Puerto interno**: el contenedor escucha en `80` para que Caddy lo sirva como `site:80` (la app acepta `PORT` por entorno).
- **Datos y archivos**: copiar el volumen de `uploads` y recrear el contenido editorial con el script del repo (`npm run migrate:content`, `SOURCE_SITE=https://ipstream.cl`). No se copia la base SQLite ni datos operativos del sitio viejo.
- **Configuración**: `SITE_URL=https://casterfly.com`, admin del sitio y `SESSION_SECRET` por variables de entorno. Sin secretos hardcodeados en el repo.
- **Marca**: reemplazar IPStream por CasterFly en layouts, páginas, contenido, títulos, metadatos, canonical, sitemap, robots, logo y favicons.
- **Enlaces al panel**: `src/lib/site.ts` centraliza `panelUrl`; se actualiza a `https://panel.casterfly.com/` y se revisan los CTAs.
- **SEO**: canonical y Open Graph en `https://casterfly.com`.
- **Cutover**: como no hay clientes reales, se hace un corte directo. `ipstream.cl` queda como respaldo hasta verificar el sitio nuevo.
- **BREAKING**: el sitio y su admin cambian de dominio; las URLs viejas dejan de ser canónicas.

## Capabilities

### New Capabilities

- `public-site/hosting`: despliegue del sitio Astro/SQLite en el VPS del panel, volúmenes persistentes, salud y dominio canónico.
- `public-site/casterfly-branding`: identidad CasterFly, metadatos, canonical, contacto y enlaces al panel nuevo.
- `public-site/content-provisioning`: contenido editorial recreado, uploads conservados y sin datos operativos del sitio viejo.

### Modified Capabilities

<!-- El repo no tenía specs principales; el change anterior `nuevo-sitio-ipstream` está completo. -->

## Impact

- **Infraestructura**: contenedor `site` (Astro SSR), volúmenes `site_data`/`site_uploads`, red `ipstream-net` que ya usa Caddy.
- **Configuración**: `.env` del sitio (`SITE_URL`, `ADMIN_USER`, `ADMIN_PASS`, `SESSION_SECRET`, `DATABASE_PATH`, `UPLOADS_DIR`, `SOURCE_SITE`).
- **Código y contenido**: `src/lib/site.ts`, `src/lib/seo.ts`, layouts, páginas Astro, `src/lib/content.ts`, contenido editorial y assets de `public/`.
- **Datos**: SQLite nuevo + uploads copiados + `npm run migrate:content`.
- **DNS**: `casterfly.com` ya apunta al VPS del panel.
- **Coordinación**: el panel ya está operativo en `panel.casterfly.com`; Caddy ya tiene el bloque `casterfly.com → site:80`.
