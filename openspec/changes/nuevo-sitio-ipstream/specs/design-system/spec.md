# Spec Delta

## Purpose

Define el sistema visual "Al Aire": los tokens de color y tipografía, los componentes base con estética de consola de broadcast y las reglas que evitan un diseño genérico, de modo que todas las páginas y el panel compartan una identidad coherente.

## ADDED Requirements

### Requirement: Tokens de color
El sistema SHALL definir la paleta mediante tokens reutilizables: base grafito (`--ink`, `--panel`, `--line`), superficie clara (`--paper`), acento de señal cyan derivado del logo (`--signal`), azul de marca (`--blue`), gris de metadata (`--steel`) y color de texto (`--text`). Ninguna página SHALL introducir colores de marca fuera de estos tokens.

#### Scenario: Uso de tokens
- **WHEN** un componente necesita el acento de marca
- **THEN** usa el token `--signal` en lugar de un valor de color suelto

#### Scenario: Contraste de texto
- **WHEN** se compone texto sobre superficies oscuras o claras
- **THEN** la combinación mantiene un contraste legible conforme a las pautas de accesibilidad

### Requirement: Uso intencional del degradado
El sistema SHALL usar el degradado cyan→azul del logo como única gradiente de la identidad, y SHALL aplicarla solo a elementos de señal (medidores, waveform, indicador on-air), nunca como fondo general ni en titulares.

#### Scenario: Elemento de señal
- **WHEN** se representa un medidor o waveform
- **THEN** puede usar el degradado cyan→azul del sistema

#### Scenario: Fondo o titular
- **WHEN** se compone un fondo o un titular
- **THEN** se usa color plano y no el degradado

### Requirement: Tipografía por rol
El sistema SHALL usar tres roles tipográficos: una familia display de peso fuerte para titulares, una familia de texto legible para el cuerpo y una familia monoespaciada para datos y etiquetas (precios, oyentes, fechas, rótulos tipo `[ 01 / PLANES ]`). El sistema SHALL NOT usar `Inter`, `Poppins`, `Outfit` ni `Space Grotesk`.

#### Scenario: Dato numérico
- **WHEN** se muestra un precio, una fecha o un contador
- **THEN** se compone con la familia monoespaciada del sistema

#### Scenario: Titular
- **WHEN** se compone el título de una sección
- **THEN** se usa la familia display, no la de cuerpo ni una excluida

### Requirement: Componentes base de consola
El sistema SHALL proveer y centralizar componentes base con estética de consola: botón tipo interruptor, módulo con franja de estado y LED, waveform, insignia `[ON AIR]`, tira de frecuencia/dial y medidor de nivel.

#### Scenario: Botón principal
- **WHEN** una página necesita una acción principal
- **THEN** usa el componente de botón del sistema con sus estados normal, hover, foco y deshabilitado

#### Scenario: Insignia de transmisión
- **WHEN** se comunica el estado en vivo o "al aire"
- **THEN** se usa el componente de insignia con su indicador encendido

### Requirement: Movimiento con propósito
El sistema SHALL limitar las animaciones a las que comunican señal o cambio de estado (aguja, barras de nivel, waveform) y SHALL respetar `prefers-reduced-motion`, desactivando el movimiento no esencial.

#### Scenario: Preferencia de movimiento reducido
- **WHEN** el usuario tiene activada la reducción de movimiento
- **THEN** las animaciones no esenciales no se reproducen

#### Scenario: Animación decorativa generalizada
- **WHEN** se añade una sección nueva
- **THEN** no se aplican animaciones de aparición genéricas a todos los elementos

### Requirement: Composición no genérica
El sistema SHALL componer con banding horizontal entre superficies oscuras y claras, hero asimétrico y una grilla con descentrados intencionales; y SHALL NOT usar emojis como iconografía ni ilustraciones genéricas.

#### Scenario: Aparición de una sección
- **WHEN** se diseña una sección nueva
- **THEN** respeta el ritmo de bandas y la grilla del sistema en lugar de un bloque centrado simétrico

#### Scenario: Iconografía
- **WHEN** una sección requiere iconos
- **THEN** usa iconografía del sistema y no emojis
