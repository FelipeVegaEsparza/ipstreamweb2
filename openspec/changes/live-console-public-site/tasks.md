# Tasks

## 1. Contenido bilingüe y referencias

- [x] 1.1 Actualizar `STUDIO_FEATURES` en `src/lib/content.ts` con los cuatro bloques reales de la consola (biblioteca/cola, micrófono/monitoreo, efectos/locuciones, salida al aire) y verificar que cada descripción corresponda a una capacidad existente en `/dashboard/streaming/live`.
- [x] 1.2 Actualizar `STUDIO_FEATURES` en `src/lib/content.en.ts` con la misma información en inglés y verificar que ambos arrays tengan la misma cantidad de ítems y códigos.
- [x] 1.3 Actualizar las claves `home.studio.*` en `src/lib/i18n/es.ts` y `en.ts` (título, descripción, alt y captions de la consola) y verificar que no quede "Tu transmisor de audio profesional" / "Your professional audio transmitter".
- [x] 1.4 Actualizar `features.studio.eyebrow`, `features.studio.description` y `features.metaDescription` en ambos idiomas para describir la consola en vivo y verificar que `/caracteristicas` ya no anuncie software de escritorio.
- [x] 1.5 Actualizar la respuesta de FAQ en `src/lib/content.ts` y los features de planes en `src/lib/panel-plans.ts` para mencionar la consola del panel o software de terceros; verificar con `grep -R "CasterFly Studio" src/lib` que no queden referencias de "enlazar" o "instalar".
- [x] 1.6 Auditar los bullets de planes en español que llegan de `/api/public/plans`: la API devuelve "IpstreamStudio" en los planes de radio, así que se agregó normalización de lectura en `src/lib/panel-plans.ts` para mostrarlo como "la consola en vivo del panel"; queda como seguimiento operativo corregir el dato en el admin del panel.

## 2. Captura real y assets

- [x] 2.1 Capturar `/dashboard/streaming/live` en un entorno demo a 1600×1000 (o proporción equivalente), con tracks genéricos y sin datos personales, y verificar que se lean biblioteca, cola, transporte y controles principales.
- [x] 2.2 Optimizar la captura y guardarla como `public/images/estudio/consola-en-vivo.png` (o `.webp` si reduce peso sin perder legibilidad); verificar dimensiones, peso razonable y que la imagen abra correctamente.
- [x] 2.3 Confirmar que `public/images/estudio/1.png` deja de referenciarse en `src`; eliminarla o dejarla documentada como asset legado sin uso.

## 3. Páginas

- [x] 3.1 Actualizar `src/pages/index.astro`: conservar el eyebrow `[ 03 / CASTERFLY STUDIO ]`, usar los nuevos textos/features, reemplazar la imagen por la captura real, actualizar captions y quitar `ComingSoonBadge` (import y overlay); verificar que la sección compile y no muestre el badge.
- [x] 3.2 Actualizar `src/pages/caracteristicas.astro`: reemplazar el encabezado/descripción de CasterFly Studio por la consola en vivo, conservar `id="casterfly-studio"` para anclas, usar la misma captura y quitar `ComingSoonBadge`; verificar que la sección compile y no muestre el badge.
- [x] 3.3 Revisar la sección en móvil y escritorio (incluyendo `/en` y `/en/caracteristicas`) y verificar que la captura no se recorte ni genere scroll horizontal.

## 4. Pruebas y verificación

- [x] 4.1 Agregar `tests/public-site-live-console.test.ts` para verificar paridad de claves ES/EN usadas por la sección, `STUDIO_FEATURES` no vacío en ambos idiomas y ausencia de las frases "Tu transmisor de audio profesional" / "professional audio transmitter" en el contenido público; ejecutar `npm run test` y verificar que pase.
- [x] 4.2 Ejecutar `npm run lint`, `npm run typecheck` y `npm run build`; verificar que los tres terminen sin errores.
- [x] 4.3 Ejecutar `grep -R "CasterFly Studio" src` y revisar cada resultado: solo deben quedar usos intencionales de marca (eyebrow, nombre de la consola, captions), nunca descarga, instalación o enlace a software de escritorio.
- [x] 4.4 Hacer QA visual final del inicio y `/caracteristicas` en ES/EN, verificando jerarquía, legibilidad de la captura, alt text y ausencia de textos residuales.
