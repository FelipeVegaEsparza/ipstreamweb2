# Design

## Context

Ver `proposal.md` — Why. El sitio es Astro SSR con contenido bilingüe en `src/lib/content.ts` / `src/lib/content.en.ts` y textos de interfaz en `src/lib/i18n/es.ts` / `en.ts`. La sección de inicio (`src/pages/index.astro`) y la de `/caracteristicas` (`src/pages/caracteristicas.astro`) comparten la estructura `.studio`, consumen `STUDIO_FEATURES` y hoy muestran la captura `public/images/estudio/1.png` con `ComingSoonBadge`.

La fuente de verdad de las capacidades es la consola del panel (`ipstream-sonicpanel`, `/dashboard/streaming/live`). No se modifica ese repo.

## Goals / Non-Goals

**Goals:**

- Reutilizar la estructura visual existente de `.studio` y la lista de canales para no introducir un patrón de diseño nuevo.
- Alinear el copy con capacidades verificables de la consola en vivo y eliminar la promesa de software de escritorio.
- Mantener paridad ES/EN y una única captura real reutilizada en inicio y características.

**Non-Goals:**

- No cambiar la consola del panel, sus rutas ni su lógica.
- No rediseñar el sistema visual del sitio ni la navegación.
- No crear una página nueva de producto ni un flujo de descarga.
- No modificar los planes que llegan desde el panel más allá de la auditoría de copy.

## Decisions

### Reutilizar `STUDIO_FEATURES` y las claves `home.studio.*` / `features.studio.*`

Se actualizan los valores existentes en vez de introducir un nuevo modelo de contenido. Las páginas ya iteran `STUDIO_FEATURES`; mantener el nombre evita tocar imports, estilos y loops, y conserva la marca CasterFly Studio como nombre de la consola integrada.

Alternativa considerada: renombrar a `LIVE_CONSOLE_FEATURES`. Se descarta por churn innecesario y porque el eyebrow de marca se conserva a pedido del usuario.

### Cuatro bloques de capacidades, agrupando la consola real

La lista de cuatro ítems se mantiene (el layout está pensado para cuatro canales), pero el contenido pasa a:

1. **Biblioteca y cola**: archivos/carpetas locales, búsqueda, agregar a cola, historial y reordenamiento; los audios no se suben al servidor.
2. **Micrófono y monitoreo**: ganancia, cue/monitor, medidor estéreo y confirmación de audífonos.
3. **Efectos y locuciones**: botonera de efectos, jingles, cápsulas, hora/clima y locutor IA.
4. **Salida al aire**: selección de slot/DJ, 192 kbps, reconexión, estado de sesión y oyentes conectados.

Así se comunica la profundidad del dashboard sin convertir la sección en un manual.

### Conservar el eyebrow `[ 03 / CASTERFLY STUDIO ]` en el inicio

El usuario pidió explícitamente conservarlo. Se interpreta "CasterFly Studio" como la marca de la consola web, no como el software retirado. En `/caracteristicas` el eyebrow pasa a `[ 04 / CONSOLA EN VIVO ]` y el encabezado deja de ser "CasterFly Studio" a secas para evitar la lectura de producto de escritorio; el cuerpo puede nombrar la marca.

### Captura real como asset estático

Se agrega `public/images/estudio/consola-en-vivo.png` (o `.webp` si la compresión lo justifica) tomada de `/dashboard/streaming/live` en un entorno demo. Se actualizan `src`, `alt`, `width` y `height` en ambas páginas y se elimina el `ComingSoonBadge` y su import. La captura se usa dentro del marco `.monitor`/`.studio-screen` existente para mantener la estética.

La captura debe mostrar un cliente demo sin datos personales, con títulos de tracks genéricos y sin nombres reales. Si no se puede lograr, se redactan los datos antes de publicar.

Alternativa considerada: reutilizar `dashboard1.png`. Se descarta porque no muestra la consola en vivo y no cumple el objetivo de comunicar la función real.

### Estrategia de copy y auditoría

- Inicio: título "Transmite en vivo desde tu panel"; descripción que explica que no hay que instalar nada.
- `/caracteristicas`: encabezado "Tu consola en vivo, en el navegador" (o equivalente EN) y la misma captura.
- FAQ: reemplazar "enlazas CasterFly Studio" por "transmites desde la consola en vivo del panel o desde tu software preferido".
- `features.metaDescription`: describir "consola en vivo (CasterFly Studio)" sin prometer software de escritorio.
- `panel-plans.ts` (EN): cambiar "Stream from Butt, RadioBoss or CasterFly Studio" por "Stream from the panel live console, Butt or RadioBoss".
- Bullets en español: se leen de `/api/public/plans` del panel. La auditoría encontró que la API aún devuelve "IpstreamStudio" en los planes de radio. Además de dejar la corrección de datos como seguimiento operativo, el sitio normaliza en lectura cualquier mención legada a `IpstreamStudio`/`CasterFly Studio` y la muestra como "la consola en vivo del panel" (o "the panel live console" en inglés), para no publicar un claim de software externo aunque el panel tarde en actualizarse.

### Verificación

- `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`.
- `grep -R "CasterFly Studio" src` para revisar que solo queden usos intencionales de marca (eyebrow, captions, nombre de consola), nunca "descargar", "instalar" o "enlazar".
- Test nuevo `tests/public-site-live-console.test.ts`: paridad de claves ES/EN usadas por la sección, `STUDIO_FEATURES` no vacío en ambos idiomas y ausencia de "Tu transmisor de audio profesional" / "professional audio transmitter" en el contenido público.

## Risks / Trade-offs

- **Captura con datos reales** → usar entorno demo, tracks genéricos y revisar la imagen antes de publicar.
- **Bullets de planes en español vienen del panel** → documentar la actualización en el admin de planes; si no se hace, el sitio seguirá mostrando "CasterFly Studio" en planes aunque las secciones ya estén corregidas.
- **Pérdida de SEO de la sección "CasterFly Studio"** → conservar el `id="casterfly-studio"` en `/caracteristicas` y el eyebrow de marca en el inicio para no romper anclas ni búsquedas de marca.
- **Imagen pesada** → comprimir y servir en un tamaño razonable; usar `width`/`height` para evitar layout shift.
- **Textos residuales en inglés** → el test de paridad y el grep final cubren claves y frases clave.

## Migration Plan

1. Actualizar contenido ES/EN y referencias de FAQ/planes/metadatos.
2. Capturar y optimizar la imagen; actualizar ambas páginas y quitar `ComingSoonBadge`.
3. Ejecutar lint, typecheck, tests y build; revisar visual en móvil y escritorio.
4. Desplegar el sitio y verificar inicio, `/caracteristicas`, `/en`, `/en/caracteristicas`.
5. Rollback: revertir el commit del sitio; la captura y los textos no afectan datos ni rutas.

## Open Questions

- Ninguna que cambie el alcance. El copy final exacto puede ajustarse en revisión sin alterar las capacidades ni la estructura.
