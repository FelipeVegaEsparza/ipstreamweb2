# Despliegue

La aplicación es un Astro SSR (`@astrojs/node` en modo standalone) con SQLite
embebida. No requiere base de datos externa ni PHP.

## Variables de entorno

| Variable | Descripción |
| --- | --- |
| `ADMIN_USER` | Usuario del panel `/admin` |
| `ADMIN_PASS` | Contraseña del panel `/admin` |
| `SESSION_SECRET` | Secreto para firmar la cookie de sesión (genera con `openssl rand -hex 32`) |
| `SITE_URL` | URL pública del sitio (canónicas, sitemap) |
| `DATABASE_PATH` | Ruta del archivo SQLite (en contenedor: `/data/app.db`) |
| `UPLOADS_DIR` | Directorio de imágenes subidas (en contenedor: `/app/uploads`) |
| `PORT` / `HOST` | Puerto y host del servidor Node (`4321` / `0.0.0.0`) |

Copia `.env.example` como `.env` para desarrollo.

## Docker

Construcción y arranque local:

```bash
docker build -t ipstream-sitio .
docker run --rm -p 4321:4321 \
  -e ADMIN_USER=admin@ipstream.cl \
  -e ADMIN_PASS=cambia_esto \
  -e SESSION_SECRET=cambia_esto \
  -v ipstream_data:/data \
  -v ipstream_uploads:/app/uploads \
  ipstream-sitio
```

La imagen incluye `HEALTHCHECK` contra `GET /api/health`, que verifica la
conexión a SQLite.

## Docker Compose (Dokploy)

```bash
cp .env.example .env   # define ADMIN_USER, ADMIN_PASS, SESSION_SECRET
docker compose up -d --build
```

Para Dokploy, define las variables en la pestaña **Environment** de la
aplicación (interpoladas por `docker-compose.yml`) y monta los volúmenes
`app_data` y `uploads_data`. El servicio expone el puerto `4321` para que el
proxy lo enrute.

## Base de datos y uploads

- La base se crea sola en `DATABASE_PATH` y aplica las migraciones de `drizzle/`
  al primer arranque.
- Los volúmenes `app_data` (base) y `uploads_data` (imágenes) deben persistir
  entre redeploys.

## Migración de contenido

Con la app detenida y acceso a red hacia el sitio de origen:

```bash
SOURCE_SITE=https://ipstream.cl \
DATABASE_PATH=./data/app.db \
UPLOADS_DIR=./uploads \
npm run migrate:content
```

El proceso es idempotente y reporta conteos por tipo.

## Rollback

1. Revertir a la imagen/tag anterior con `docker compose up -d`.
2. Si el cambio incluyó migraciones de esquema, restaurar el respaldo previo de
   `app.db` sobre el volumen `app_data`.
3. Ante un corte de DNS, volver a apuntar el dominio al servicio anterior
   mientras se corrige.
