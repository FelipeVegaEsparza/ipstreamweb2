# Design

## Context

Ver `proposal.md` para la motivación. El proyecto `sitioweb` está vacío (solo `openspec/`). El sitio de referencia `ipstream.cl` entrega su contenido desde APIs PHP públicas y desde páginas renderizadas en servidor sobre MySQL, con un admin PHP. La versión nueva no reutiliza nada de ese runtime: reconstruye contenido y URLs en un stack Astro SSR + JavaScript + SQLite.

Restricciones:
- El origen de datos disponible para migrar es en vivo (APIs y HTML), no la base de datos de producción. El dump local está incompleto.
- Clonar el sitio no es objetivo; la identidad visual se redefine con el concepto "Al Aire" anclado a los colores del logo.
- No hay pagos ni transacciones en el alcance.

## Goals / Non-Goals

**Goals:**
- App Astro SSR autocontenida en un contenedor, con SQLite en disco (sin DB externa).
- Panel `/admin` con login que administra planes/categorías y las secciones de contenido.
- Paridad de contenido, secciones y estructura de URLs con el sitio actual.
- Sistema visual propio ("Al Aire") documentado como tokens reutilizables.
- Proceso de migración de contenido reproducible e idempotente.

**Non-Goals:**
- No se implementan pagos/Flow, checkout, suscripciones ni leads.
- No se migran tablas `orders`, `monthly_payments`, `payment_logs`, `landing_leads`, `lead_logs`.
- No hay multiusuario ni roles (un solo admin por variables de entorno).
- No se edita ni replica el runner de migraciones PHP (`migrate.php`).

## Decisions

### Astro SSR con `@astrojs/node` (standalone) y renderizado híbrido
La app corre con `output: 'server'` y adapter Node standalone para convivir con SQLite y un proceso persistente en Docker. Las páginas dependientes de datos (`/`, `/planes`, `/noticias`, `/noticias/[slug]`, `/tutoriales`, `/clientes`, `/comunidad`, `/admin/*`) se renderizan en cada request. Las estáticas (`/caracteristicas`, `/soporte`, `/404`, `/robots.txt`, `/sitemap.xml`) se marcan `export const prerender = true`.
- Alternativas: `output: 'static'` con rebuild al guardar (más complejo de operar y no permite edición inmediata); SSR con adapter serverless (SQLite no persiste en serverless).

### SQLite con Drizzle ORM sobre `better-sqlite3`
Esquema declarado con Drizzle y migraciones versionadas; driver síncrono `better-sqlite3` (adecuado para el volumen de lecturas del sitio). Se activa WAL para permitir lecturas concurrentes y se serializan las escrituras del admin.
- Alternativas: `better-sqlite3` crudo con SQL a mano (menos tipado, más fácil de desincronizar); Prisma (binario pesado, overkill).

### Modelo de datos: 8 tablas de contenido
Se conservan las tablas de contenido del sitio actual, adaptadas a SQLite. `features` se guarda como JSON en columna `TEXT`. Los `id` son enteros autoincrementales; `plan_key` y los `slug` son únicos. Timestamps en ISO-8601 como `TEXT`.
```
plan_categories(id, name, slug UNIQUE, description, icon, display_order, is_active, created_at, updated_at)
plans(id, plan_key UNIQUE, plan_name, price, title, icon, image_url, description,
      features TEXT json, monthly_price, annual_price, billing_note, demo_url,
      category_id FK->plan_categories, is_active, created_at, updated_at)
news(id, title, slug UNIQUE, excerpt, content, image, author, published_at, is_active,
     created_at, updated_at)
tutorial_categories(id, name, slug UNIQUE, color, display_order, created_at, updated_at)
tutorials(id, category_id FK->tutorial_categories, title, slug UNIQUE, description,
          video_url, duration, difficulty, display_order, is_active, views,
          created_at, updated_at)
client_portfolio(id, title, slug, description, image_url, project_url, display_order,
                 is_active, created_at, updated_at)
community_radios(id, name, slug UNIQUE, description, logo_url, site_url, display_order,
                 is_active, created_at, updated_at)
settings(key PRIMARY KEY, value, updated_at)
```
- Alternativas: normalizar features a tabla hija (complejidad innecesaria para listas cortas ordenadas).

### Autenticación: admin único por entorno con sesión firmada
Credenciales en `ADMIN_USER`/`ADMIN_PASS` (Dokploy). El login valida y crea una cookie de sesión firmada (HMAC con `SESSION_SECRET`), `httpOnly`, `Secure`, `SameSite=Lax`, con expiración por inactividad. Un middleware de Astro protege `/admin/*` (salvo `/admin/login`). Toda mutación exige token CSRF.
- Alternativas: tabla de usuarios con hash (más trabajo, no pedido); Basic Auth del proxy (menos control sobre el flujo de login y logout).

### Mutaciones del admin con Astro Actions + Zod
Los formularios del admin envían a Astro Actions con validación Zod y revalidación de sesión/CSRF en servidor; degradan a HTML plano sin JavaScript. Las imágenes se suben por `multipart/form-data` en la misma acción.
- Alternativas: endpoints REST + `fetch` (más código de cliente y sin tipado compartido).

### Subida y optimización de imágenes con `sharp`
Las imágenes de planes, noticias, portafolio y comunidad se guardan en el volumen `/uploads` y se procesan con `sharp` (redimensionado a máx. 1920px y conversión a WebP), replicando la optimización del sitio actual. Nombres con hash para evitar colisiones; se guarda la ruta relativa en la fila.
- Alternativas: no optimizar (peor performance y assets pesados); servicio externo de imágenes (suma dependencia).

### Sistema visual "Al Aire"
Tokens como CSS custom properties (`--ink`, `--panel`, `--line`, `--paper`, `--signal`, `--blue`, `--steel`, `--text`), tipografías Archivo Expanded / Archivo / IBM Plex Mono, y una regla dura: el degradado cyan→azul es el único del sistema y solo se usa en elementos de señal (medidores, waveform, indicador on-air). Componentes base (botón tipo switch de consola, módulo con LED, waveform, badge `[ON AIR]`) se documentan y centralizan.
- Alternativas: Tailwind default (es lo que produce el look genérico a evitar); CSS a mano sin tokens (deriva visual).

### Migración de contenido offline e idempotente
Un script de Node de una sola ejecución lee `https://ipstream.cl/php/api/get-plans.php`, `https://ipstream.cl/api/news.php` y `https://ipstream.cl/php/api/get-tutorials.php`; scrapea `/clientes` y `/comunidad` con `cheerio`; descarga las imágenes referenciadas de `/images` y `/uploads` al volumen; y hace *upsert* por `plan_key`/`slug`. No es dependencia de runtime.
- Alternativas: migrar desde el dump local (incompleto); scrapear todo (frágil y con datos incompletos).

### SEO y URLs
Se conservan las rutas públicas. Se generan `sitemap.xml` y `robots.txt`, `canonical`, OG/Twitter y JSON-LD; `/admin` queda con `noindex`.

### Despliegue Docker + Dokploy
`Dockerfile` multi-stage (build con Node y `npm ci`, runtime slim con `sharp` y `better-sqlite3` ya compilados) y `docker-compose.yml` con un servicio `web` y volúmenes `app.db` y `/uploads`. Variables: `ADMIN_USER`, `ADMIN_PASS`, `SESSION_SECRET`, `SITE_URL`.
- Alternativas: VPS con systemd (menos reproducible); serverless (incompatible con SQLite en disco).

## Risks / Trade-offs

- [Concurrencia de escritura en SQLite] → WAL + escrituras serializadas del admin; el tráfico de escritura es mínimo y de un solo operador.
- [Fragilidad del scraping en la migración] → se ejecuta una vez, con validaciones y *upsert*; no afecta al runtime.
- [`sharp`/`better-sqlite3` en Alpine fallan al compilar] → usar imagen base `node:22-bookworm-slim` o instalar dependencias nativas; build multi-stage.
- [Regresión SEO en el cambio de dominio/servidor] → mismas URLs, `sitemap`, `canonical`, revisar redirecciones y validar antes del corte.
- [Seguridad de la sesión] → `SESSION_SECRET` fuerte en Dokploy, cookie `httpOnly`/`Secure`, CSRF y expiración por inactividad.
- [El rediseño derive en un look genérico] → tokens y componentes cerrados; revisión contra el checklist anti-genérico del concepto "Al Aire".
- [Pérdida de contenido por migración parcial] → verificar conteos contra la fuente (planes, noticias, portafolio, comunidad) tras el seed.

## Migration Plan

1. Construir la app, el esquema y el script de migración; correr el seed contra un volumen local y verificar conteos.
2. Empaquetar y desplegar en Dokploy sin tocar el DNS de producción (acceso por host temporal), con los volúmenes montados.
3. Validar contenido, SEO y admin; comparar páginas contra el sitio actual.
4. Corte de DNS a la nueva app. Rollback: revertir DNS al sitio anterior; los datos quedan en el volumen `app.db` (respaldo previo a cambios de esquema).
5. El sitio anterior permanece disponible como respaldo hasta confirmar estabilidad.

## Open Questions

- ¿La página `/tutoriales` debe mostrar un estado vacío explícito mientras no haya tutoriales cargados?
- ¿Se desea conservar el detalle de noticia en `/noticias/[slug]` con el mismo patrón de slug actual (sí por defecto, sujeto a validar slugs existentes)?
- ¿Marca del sitio en `SITE_URL` definitiva (ipstream.cl) o se probará primero en otro dominio?
