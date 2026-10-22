# Tasks

## 1. Preparación y respaldo

- [x] 1.1 Verificar que el repo `ipstreamweb2` está limpio y en `main`; confirmar con `git status --short` que no hay cambios sin commitear.
- [x] 1.2 Acceder por SSH al servidor viejo `212.47.73.143` y documentar Dokploy, la app `sitioipstream-sitioipstream-2azyqw`, SQLite y los volúmenes; verificar con `docker ps` y `docker volume ls`.
- [x] 1.3 Copiar a `/tmp/opencode` un respaldo del `app.db`, del volumen `sitioipstream-sitioipstream-2azyqw_uploads_data` y del `.env` viejo; verificar tamaños y que el `.env` no queda en el repo.
- [x] 1.4 Crear el `.env` del stack nuevo en `/opt/casterfly-site/.env` con `SITE_URL`, admin, `SESSION_SECRET`, `DATABASE_PATH`, `UPLOADS_DIR` y `SOURCE_SITE`; verificar que no se commitea.

## 2. Stack del sitio en el VPS del panel

- [x] 2.1 Agregar `docker-compose.panel.yml` con el servicio `site`, volúmenes `site_data`/`site_uploads`, `PORT=80` y la red externa `ipstream-net`; verificar con `docker compose -f docker-compose.panel.yml config`.
- [x] 2.2 Verificar que solo `site` se conecta a `ipstream-net` y que no hay servicios de base de datos expuestos; revisar `docker network inspect ipstream-net`.
- [x] 2.3 Construir y levantar el stack en el VPS del panel; verificar con `curl -I http://127.0.0.1:<puerto>` o desde la red que `site` responde y que el healthcheck pasa.
- [x] 2.4 Reiniciar el stack y verificar que `site_data` y `site_uploads` persisten (la home sigue respondiendo y la DB conserva datos).

## 3. Datos y uploads

- [x] 3.1 Copiar el volumen de uploads viejo al nuevo `site_uploads`; verificar que `/uploads/news`, `/uploads/plans`, `/uploads/portfolio` y `/uploads/community` existen y que una imagen responde `200`.
- [x] 3.2 Verificar que las migraciones Drizzle se aplicaron y que existen las tablas base (`plans`, `news`, `tutorials`, `client_portfolio`, `community_radios`, `settings`).
- [x] 3.3 Confirmar que no se copió la SQLite vieja ni datos operativos; verificar que `orders`, `monthly_payments`, `payment_logs`, `landing_leads` y `lead_logs` están vacías o no existen.
- [x] 3.4 Copiar un snapshot consistente de la SQLite vieja (solo tablas de contenido), sanear marca/URLs y verificar planes/portafolio; el script `migrate:content` no aplica porque el sitio viejo es Astro/SQLite, no PHP.

## 4. Configuración y admin

- [x] 4.1 Configurar `SITE_URL=https://casterfly.com`, `ADMIN_USER`, `ADMIN_PASS` y `SESSION_SECRET` en el `.env`; verificar que `src/lib/site.ts` lee los valores y que no queda un fallback `ipstream.cl`.
- [x] 4.2 Verificar que `/admin` sin sesión redirige al login y que con las credenciales del `.env` se accede al panel del sitio.
- [x] 4.3 Verificar que el formulario de contacto guarda un lead en la SQLite nueva y que el admin lo lista.

## 5. Marca, enlaces y SEO

- [x] 5.1 Actualizar `src/lib/site.ts` (`name`, `url`, `panelUrl`, `email`) y `src/lib/seo.ts` a CasterFly; verificar que los CTAs usan `panel.casterfly.com`.
- [x] 5.2 Reemplazar en layouts, páginas, contenido y scripts la marca visible `IPStream` por `CasterFly` (y `IPStreamStudio` por `CasterFly Studio`); verificar con `grep -R "IPStream" src public` que solo queden identificadores internos intencionales.
- [x] 5.3 Reemplazar URLs `ipstream.cl`/`panelipstream.cl` y correos `@ipstream.cl` en `src`, `public` y `scripts`; verificar con `grep -R "panelipstream.cl\|@ipstream.cl"` que no quedan enlaces de usuario.
- [x] 5.4 Copiar los assets CasterFly (logo horizontal/oscuro, isotipo, favicon, apple-touch, OG) a `public/`; verificar que no hay imágenes rotas ni el logo viejo.
- [x] 5.5 Corregir canonical, Open Graph, `sitemap.xml` y `robots.txt` a `https://casterfly.com`; verificar con `curl -s https://casterfly.com/ | grep canonical` y con el sitemap.

## 6. Contenido editorial

- [x] 6.1 Verificar que los planes migrados tienen nombres, precios y claves que coinciden con el panel (`/planes/<slug>`); cada botón "Contratar" abre el plan correcto en `panel.casterfly.com`.
- [x] 6.2 Verificar que `/noticias` responde y muestra el estado vacío (el contenido viejo no tenía noticias).
- [x] 6.3 Verificar que `/tutoriales` responde y muestra el estado vacío (no había tutoriales en el contenido viejo).
- [x] 6.4 Verificar que el portafolio (19 clientes) aparece en la home y `/clientes`; comunidad queda sin datos.
- [x] 6.5 Saneamiento de contenido migrado: reemplazar IPStream por CasterFly en textos de noticias/tutoriales cuando corresponda; verificar visualmente.

## 7. Cutover y Caddy

- [x] 7.1 Verificar que Caddy sirve `casterfly.com` contra `site:80` y que la home responde `200` con TLS válido.
- [x] 7.2 Verificar que `www.casterfly.com` redirige al root y que el certificado es válido.
- [x] 7.3 Verificar que el sitio viejo en `ipstream.cl` sigue disponible como respaldo y que `*.ipstream.cl` de clientes no se toca.
- [x] 7.4 Cuando el nuevo esté verificado, evaluar redirigir `ipstream.cl` a `casterfly.com`; no retirar el respaldo hasta confirmar.

## 8. Verificación final y documentación

- [x] 8.1 Recorrer home, planes, características, tutoriales, noticias, clientes, contacto y admin en `https://casterfly.com`; verificar que no hay enlaces rotos a `ipstream.cl`.
- [x] 8.2 Probar el flujo de contratación desde el sitio hasta el panel nuevo: plan → `/planes/<slug>` en `panel.casterfly.com` → registro/login.
- [x] 8.3 Documentar en `README`/`DEPLOY` el stack, variables, volúmenes y runbook de cutover; verificar que un operador puede repetirlo.
- [x] 8.4 Ejecutar `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` y `openspec validate casterfly-public-site --strict`; revisar el diff y confirmar que no hay secretos ni dumps.
