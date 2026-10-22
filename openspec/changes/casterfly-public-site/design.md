# Design

## Context

Ver `proposal.md`. El sitio vivo es la app Astro SSR de `ipstreamweb2`, desplegada hoy en Dokploy con SQLite (`/data/app.db`) y un volumen de uploads. El repo incluye migraciones Drizzle, admin en `/admin`, formulario de contacto y `scripts/migrate-content.ts` para recrear contenido desde `SOURCE_SITE`.

## Goals / Non-Goals

**Goals:**

- Servir el sitio en `casterfly.com` desde el VPS del panel.
- Conservar uploads y recrear el contenido con el script del repo.
- Dejar los enlaces al panel nuevo y la marca CasterFly.
- Poder repetir el despliegue y la carga de contenido sin duplicar.

**Non-Goals:**

- Copiar la base SQLite ni datos operativos del sitio viejo.
- Reescribir el sitio o cambiar su diseño.
- Tocar los sitios `*.ipstream.cl` de clientes.
- Cambiar la paleta o el sistema visual del panel.

## Decisions

### 1. Contenedor `site` con SQLite propio

Se despliega la app Astro con el `Dockerfile` del repo. El servicio se llama `site` para que Caddy lo alcance como `site:80`; escucha en `PORT=80` (el contenedor corre como root). Volúmenes:

- `site_data` → `/data` (`app.db` + WAL).
- `site_uploads` → `/app/uploads`.

Solo `site` se conecta a `ipstream-net` (la red de Caddy). No hay servicio MySQL: la app usa SQLite.

**Alternativa descartada:** reutilizar el MySQL del panel. El sitio no lo usa y mezclar esquemas no aporta nada.

### 2. Copiar uploads y recrear contenido

Se copia el volumen `sitioipstream-sitioipstream-2azyqw_uploads_data` al nuevo `site_uploads`. Para el contenido se copia un snapshot consistente de la SQLite vieja (solo tablas de contenido: planes, categorías, portafolio, noticias, tutoriales, comunidad) y se sanea la marca/URLs. No se copian datos operativos (`contact_messages` se deja vacía; no hay órdenes ni leads).

El script `npm run migrate:content` no aplica contra el sitio Astro/SQLite actual porque espera endpoints PHP; se conserva para el sitio anterior.

### 3. Reemplazos dirigidos

- `src/lib/site.ts`: nombre, URL, `panelUrl`, email.
- `src/lib/seo.ts`: `siteName`.
- Layouts y páginas: marca visible `IPStream` → `CasterFly`, `IPStreamStudio` → `CasterFly Studio`.
- URLs `ipstream.cl` → `casterfly.com`; `panelipstream.cl` → `panel.casterfly.com`.
- Correos `@ipstream.cl` → `@casterfly.com`.
- Canonical, sitemap, robots y OG al dominio nuevo.
- No se renombran identificadores internos de cookies (`ipstream_admin`, `ipstream_csrf`) ni variables de entorno.

### 4. Configuración por entorno

`.env` del stack:

- `SITE_URL=https://casterfly.com`
- `ADMIN_USER`, `ADMIN_PASS`, `SESSION_SECRET` (se conservan los del sitio viejo o se generan nuevos)
- `DATABASE_PATH=/data/app.db`
- `UPLOADS_DIR=/app/uploads`
- `SOURCE_SITE=https://ipstream.cl` (solo para la migración de contenido)

### 5. Caddy y TLS

El change `casterfly-domain-migration` ya dejó `casterfly.com` apuntando a `site:80` y `www` redirigiendo al root. Este change solo levanta el contenedor en `ipstream-net` y verifica.

### 6. Cutover directo

1. Backup de uploads, `.env` y SQLite viejo (respaldo, no migración).
2. Copiar uploads y levantar `site`.
3. Ejecutar `migrate:content`.
4. Verificar `casterfly.com` y el admin.
5. Dejar `ipstream.cl` como respaldo y evaluar su redirect después.

## Risks / Trade-offs

| Riesgo | Mitigación |
|---|---|
| El build de Astro/sharp/better-sqlite3 falla en el VPS | Probar `docker compose build` y revisar logs; el Dockerfile ya instala python3/make/g++. |
| El contenedor no puede bindear el puerto 80 | Corre como root en la imagen; se verifica con el healthcheck y Caddy. |
| `migrate:content` depende del sitio viejo | Ejecutarlo antes de retirar `ipstream.cl`; si falla, seed manual desde el admin. |
| Contenido viejo con marca IPStream | Revisar textos después del script y hacer un reemplazo dirigido en la DB o en el contenido. |
| Uploads no copiados | Copiar el volumen completo y verificar rutas/imágenes. |
| Secretos en el repo | `.env` no se commitea; se copia al VPS. |
| El sitio viejo sigue canónico | Dejar `ipstream.cl` como respaldo y redirigir cuando el nuevo esté verificado. |

## Migration Plan

1. **Backup**: uploads, `.env` y `app.db` viejos a `/tmp` (no al repo).
2. **Stack**: copiar el código a `/opt/casterfly-site`, crear `.env`, `docker compose up -d --build`.
3. **Uploads**: copiar el volumen viejo al nuevo.
4. **Contenido**: ejecutar `npm run migrate:content` dentro del contenedor.
5. **Marca**: reemplazos, assets, canonical y enlaces.
6. **Verificación**: home, planes, características, tutoriales, noticias, clientes, contacto, admin, imágenes.
7. **Retiro**: dejar `ipstream.cl` como respaldo y redirigir cuando se decida.

**Rollback**: mantener el sitio viejo en Dokploy; si el nuevo falla, Caddy puede volver a apuntar a otro upstream o se retira el contenedor. El volumen SQLite nuevo es independiente.

## Open Questions

- ¿Se conserva el login del admin viejo o se genera uno nuevo? Se conserva el usuario/clave del `.env` viejo para no perder acceso.
- ¿El contenido migrado debe reemplazar IPStream por CasterFly también en noticias? Se hará un saneamiento posterior sobre los textos.
