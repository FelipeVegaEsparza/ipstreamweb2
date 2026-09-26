# Tasks

## 1. Proyecto y tooling

- [x] 1.1 Inicializar el proyecto Astro con TypeScript en `sitioweb` y verificar que `npm run dev` levanta el sitio base
- [x] 1.2 Configurar `output: 'server'` con el adapter `@astrojs/node` en modo standalone y verificar que `npm run build` genera el servidor de Node
- [x] 1.3 Instalar dependencias de datos y utilidades (`better-sqlite3`, `drizzle-orm`, `drizzle-kit`, `sharp`, `zod`) y verificar que `npm run build` sigue pasando
- [x] 1.4 Instalar `vitest` y configurar los scripts `lint`, `typecheck`, `test` y `build`; verificar que los cuatro corren sin error en un proyecto vacío
- [x] 1.5 Crear `.env.example` con `ADMIN_USER`, `ADMIN_PASS`, `SESSION_SECRET` y `SITE_URL`, y verificar que `.gitignore` excluye `.env`, `*.db` y `uploads/`

## 2. Sistema de diseño "Al Aire"

- [x] 2.1 Definir los tokens de color y espaciado como CSS custom properties y verificar que el contraste de las combinaciones de texto cumple las pautas de accesibilidad
- [x] 2.2 Cargar las tipografías display, texto y monoespaciada y verificar por inspección que no se usan `Inter`, `Poppins`, `Outfit` ni `Space Grotesk`
- [x] 2.3 Implementar los componentes base (botón de consola, módulo con LED, waveform, insignia `[ON AIR]`, tira de frecuencia, medidor de nivel) y verificar sus estados normal, hover, foco y deshabilitado
- [x] 2.4 Documentar el uso del sistema (tokens, regla del degradado único, componentes) en `src/styles/README.md` y verificar que una página de ejemplo los consume sin colores sueltos

## 3. content-store

- [x] 3.1 Declarar el esquema SQLite con Drizzle para las 8 tablas de contenido y verificar que la migración crea todas las columnas e índices
- [x] 3.2 Implementar la conexión a SQLite con modo WAL y verificar que lecturas concurrentes no fallan durante una escritura
- [x] 3.3 Implementar los repositorios de solo lectura de planes, categorías, noticias, tutoriales, portafolio y comunidad con sus ordenamientos y filtros `is_active`, y verificar con tests unitarios sobre una base temporal
- [x] 3.4 Implementar el repositorio de `settings` con valor por defecto ante clave ausente y verificar que `features` se lee como arreglo y no como texto JSON
- [x] 3.5 Implementar las operaciones de escritura (alta, edición, baja, activación) con validación de unicidad e integridad referencial, y verificar con tests que una clave duplicada o una categoría inexistente fallan sin alterar datos

## 4. Migración de contenido

- [x] 4.1 Implementar el cliente de las APIs de origen (`get-plans.php`, `news.php`, `get-tutorials.php`) y verificar la extracción de planes, categorías, noticias y categorías de tutoriales
- [x] 4.2 Implementar el scraping de `/clientes` y `/comunidad` con `cheerio` y verificar que se extraen nombre, imagen y enlace de cada registro
- [x] 4.3 Implementar la descarga de imágenes a uploads y la reescritura de rutas, y verificar que una imagen no disponible no aborta la migración
- [x] 4.4 Implementar el *upsert* idempotente por `plan_key`/`slug` y verificar con un test que dos ejecuciones no duplican registros
- [x] 4.5 Implementar el reporte final de conteos por tipo y verificar que coincide con los registros efectivamente almacenados

## 5. Sitio público

- [x] 5.1 Implementar el layout base con navegación, pie, metadatos (título, descripción, canónica, OG/Twitter) y verificar que se aplica a todas las páginas
- [x] 5.2 Implementar la página de inicio con últimas noticias y secciones dinámicas, verificando que sin noticias la sección se omite sin romper la página
- [x] 5.3 Implementar `/planes` agrupada por categoría con precios, características, imagen y demo, verificando que un plan sin imagen se renderiza correctamente
- [x] 5.4 Implementar `/noticias` y `/noticias/[slug]` verificando que un slug inexistente responde 404
- [x] 5.5 Implementar `/clientes` y `/comunidad` verificando que los registros inactivos no se muestran y los enlaces abren en pestaña nueva
- [x] 5.6 Implementar `/tutoriales` con agrupación por categoría y estado vacío explícito, verificando ambos casos
- [x] 5.7 Implementar `/caracteristicas`, `/soporte` y la página 404 como contenido prerenderizado, y verificar en el build que se generan sin acceso a base de datos
- [x] 5.8 Implementar `sitemap.xml` y `robots.txt` prerenderizados, verificando que el sitemap incluye las rutas públicas y `robots.txt` excluye `/admin`
- [x] 5.9 Verificar adaptabilidad y accesibilidad con navegación por teclado, foco visible y textos alternativos en las páginas principales

## 6. admin-panel

- [x] 6.1 Implementar el login y logout con cookie firmada (`httpOnly`, `Secure`, `SameSite=Lax`) y verificar los casos de credenciales válidas, inválidas y no configuradas
- [x] 6.2 Implementar el middleware que protege `/admin/*` salvo el login y aplica `noindex`, verificando el acceso sin sesión y la expiración por inactividad
- [x] 6.3 Implementar la protección CSRF en todas las mutaciones y verificar que una solicitud sin token válido es rechazada sin modificar datos
- [x] 6.4 Implementar el CRUD de planes y categorías con Astro Actions y Zod y verificar crear, editar, activar/desactivar y eliminar con sus casos de error
- [x] 6.5 Implementar el CRUD de noticias, tutoriales y sus categorías, portafolio y comunidad, verificando que publicar y desactivar se refleja en el sitio público
- [x] 6.6 Implementar la edición de ajustes y redes sociales y verificar el cambio en el pie del sitio
- [x] 6.7 Implementar la subida de imágenes con validación de tipo/tamaño y optimización con `sharp`, verificando los casos de imagen válida y archivo inválido

## 7. deployment

- [x] 7.1 Escribir el `Dockerfile` multi-stage y verificar que la imagen construye y arranca el servidor en el puerto expuesto
- [x] 7.2 Escribir el `docker-compose.yml` para Dokploy con volúmenes para `app.db` y `uploads`, y verificar que un redeploy conserva datos e imágenes
- [x] 7.3 Configurar el arranque con `ADMIN_USER`, `ADMIN_PASS`, `SESSION_SECRET` y `SITE_URL` y verificar que cambiar las credenciales del entorno cambia el login
- [x] 7.4 Añadir la verificación de salud y verificar que reporta estado correcto con la aplicación en ejecución
- [x] 7.5 Documentar el despliegue y el rollback en `docs/deploy.md` y verificar que los comandos documentados funcionan como están escritos

## 8. Integración y verificación final

- [x] 8.1 Ejecutar la migración completa contra una base limpia y verificar el reporte de conteos frente a las fuentes de origen
- [x] 8.2 Ejecutar un smoke test de todas las rutas públicas y del flujo de login/CRUD en el contenedor y verificar respuestas correctas
- [x] 8.3 Validar SEO del sitio desplegado (canónicas, sitemap, robots, noindex del admin) y verificar la paridad de URLs con el sitio actual
- [x] 8.4 Revisar las páginas contra la lista anti-genérica del sistema y verificar tokens, tipografías y regla del degradado en cada sección
- [x] 8.5 Escribir el `README.md` y `AGENTS.md` con stack, comandos de desarrollo, pruebas y despliegue, y verificar que los comandos documentados corren
