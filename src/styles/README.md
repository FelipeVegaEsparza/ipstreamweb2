# Sistema de diseño "Al Aire"

Estética de consola de broadcast: grafito, señal cyan, tipografía con carácter y
movimiento que comunica señal. La paleta deriva de los colores reales del logo
(`cyan #5FE0E0 -> azul #1050B0`, gris `#A0A0A0`).

## Tokens

Definidos en `tokens.css` como custom properties. No uses colores sueltos: toda
superficie, texto y acento sale de aquí.

| Token | Valor | Uso |
| --- | --- | --- |
| `--ink` | `#0f1114` | fondo base grafito |
| `--panel` / `--panel-2` | `#171c22` / `#1d232b` | módulos de consola |
| `--line` | `#262d35` | filetes y bordes |
| `--paper` | `#12171d` | superficie alterna oscura (ritmo de bandas) |
| `--signal` / `--signal-strong` | `#35d6d0` / `#5fe0e0` | acento único de marca |
| `--blue` | `#1a5fc8` | azul de marca (solo en el degradado de señal) |
| `--steel` | `#a0a6ad` | metadata |
| `--text` | `#e9ebed` | texto sobre oscuro |
| `--ink-text` | `#e9ebed` | texto sobre `--paper` |
| `--danger` / `--ok` | `#ff5b4a` / `#46d17f` | estados |

Escala espacial `--space-1..9` (base 4px), radios contenidos (`--radius-sm/--radius/--radius-lg`)
y focos accesibles (`--focus-ring`, `--focus-ring-paper`).

## Regla dura del degradado

`--signal-gradient` (cyan -> azul) es el **único** degradado del sistema y solo
se aplica a elementos de **señal**: `Waveform`, `LevelMeter` y el indicador
`OnAirBadge`. Nunca como fondo general ni en titulares.

## Tipografía

Tres roles, sin excepciones:

- **Display** — `Archivo Variable` con `font-stretch: 118%` (clase `.display`) para titulares.
- **Texto** — `Archivo Variable` (cuerpo).
- **Datos** — `IBM Plex Mono` (clase `.mono`) para precios, fechas, contadores y rótulos.

Prohibido usar `Inter`, `Poppins`, `Outfit` o `Space Grotesk` (la marca genérica
de los generadores). El test `tests/design-system.test.ts` lo verifica.

## Componentes base (`src/components/ui/`)

| Componente | Uso |
| --- | --- |
| `ConsoleButton` | acciones; variantes `primary`, `ghost`, `quiet`; estados hover/foco/deshabilitado |
| `Module` | módulo de contenido con franja de estado y LED (`signal`, `ok`, `off`) |
| `Waveform` | forma de onda de audio; `animated` para señales vivas |
| `OnAirBadge` | insignia `[ON AIR]` / `[REC]` con punto encendido |
| `FrequencyStrip` | tira de frecuencia/dial para cabeceras de sección |
| `LevelMeter` | medidor de nivel tipo VU |

## Composición y movimiento

- Banding horizontal entre `band--dark` y `band--paper` para dar ritmo.
- Grilla con descentrados intencionales; evitar bloques centrados simétricos.
- Movimiento atado al significado (aguja, nivel, waveform); respetar
  `prefers-reduced-motion` (ya cubierto en `global.css` y en cada componente).
- Sin emojis como iconografía ni ilustraciones genéricas.

## Página de referencia

`/estilo` muestra todos los componentes sobre las superficies oscuras del
sistema. Es `noindex` y no entra al sitemap; sirve para QA visual.
