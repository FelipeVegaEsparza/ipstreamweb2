# Proposal

## Why

El sitio público todavía presenta a CasterFly Studio como un software de transmisión de escritorio separado, con una captura de una versión que nunca se publicó (badge "Próximamente"). Eso desvía la atención de una capacidad real y ya disponible: transmitir en vivo desde la consola del panel, en el navegador. El sitio debe contar lo que el cliente puede usar hoy, no un producto futuro.

## What Changes

- Reemplazar la sección `[ 03 / CASTERFLY STUDIO ]` del inicio: se conserva el eyebrow de marca, pero el título, la descripción, las características y el visual pasan a describir la consola en vivo del panel.
- Presentar las capacidades reales del dashboard: biblioteca local de audio, cola e historial, transporte con seek, micrófono con monitoreo y VU, efectos de sonido, jingles, cápsulas, locuciones de hora/clima, locutor IA, selección de slot/DJ y salida al aire a 192 kbps.
- Reemplazar la sección "CasterFly Studio" de `/caracteristicas` con la misma propuesta de consola en vivo y una captura real del panel (sin badge "Próximamente").
- Quitar las referencias a CasterFly Studio como software de escritorio en el resto del sitio: FAQ, metadatos de `/caracteristicas`, planes en inglés y contenido localizado.
- Incorporar una captura real de `/dashboard/streaming/live` como asset del sitio, con `alt` descriptivo y sin depender de textos de marketing del producto retirado.
- Mantener paridad ES/EN y la numeración/estructura visual del sitio.

## Capabilities

### New Capabilities

- `public-site/live-console`: presentación pública de la consola en vivo del panel como capacidad central de CasterFly Studio, incluyendo copy, features, captura real y ausencia de claims de software de escritorio.

### Modified Capabilities

<!-- El repo aún no tiene specs principales; no hay capabilities existentes que modificar. -->

## Impact

- **Páginas**: `src/pages/index.astro`, `src/pages/caracteristicas.astro`.
- **Contenido/i18n**: `src/lib/content.ts`, `src/lib/content.en.ts`, `src/lib/i18n/es.ts`, `src/lib/i18n/en.ts`, `src/lib/panel-plans.ts`.
- **Assets**: nueva captura en `public/images/estudio/` (se deja de usar `1.png` y el `ComingSoonBadge`).
- **Datos del panel**: los bullets de planes en español provienen de `/api/public/plans`; si contienen "CasterFly Studio", se actualizan desde el admin de planes del panel (paso operativo, no código de este repo).
- **Calidad**: `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`; auditoría con `grep -R "CasterFly Studio" src` para dejar solo usos intencionales de marca.
- **Fuera de alcance**: no se modifica la consola en vivo del panel ni sus capacidades; solo se comunica lo que ya existe.
