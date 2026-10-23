# Spec Delta

## Purpose

Define cómo el sitio público presenta CasterFly Studio como la consola de transmisión en vivo integrada en el panel, alineando el mensaje con las capacidades reales del producto y retirando la comunicación del software de escritorio no publicado.

## ADDED Requirements

### Requirement: Sección de inicio dedicada a la consola en vivo

La página de inicio SHALL conservar el eyebrow `[ 03 / CASTERFLY STUDIO ]` y reemplazar el contenido de la sección por la transmisión en vivo desde el panel. El título "Tu transmisor de audio profesional" y la descripción del software de escritorio MUST NOT mostrarse.

#### Scenario: Visitante llega al inicio

- **WHEN** un visitante carga la página de inicio
- **THEN** ve la sección `[ 03 / CASTERFLY STUDIO ]` con un título y una descripción que explican que puede transmitir en vivo desde el navegador, sin badge de "Próximamente"

#### Scenario: Características visibles en el inicio

- **WHEN** el visitante lee la lista de características de la sección
- **THEN** reconoce capacidades reales de la consola del panel: biblioteca local, cola e historial, transporte con seek, micrófono con monitoreo y medidores, efectos de sonido, jingles, cápsulas, locuciones de hora/clima e IA, y salida al aire con selección de slot/DJ

#### Scenario: Sin claims de producto de escritorio

- **WHEN** el visitante recorre la sección de inicio
- **THEN** no encuentra referencias a instalar, descargar o enlazar un software de escritorio CasterFly Studio

### Requirement: Sección de consola en vivo en Características

La página `/caracteristicas` SHALL presentar la misma capacidad de consola en vivo del panel y MUST NOT conservar el encabezado "CasterFly Studio" asociado al transmisor de escritorio ni el badge de "Próximamente".

#### Scenario: Visitante abre Características

- **WHEN** un visitante carga `/caracteristicas`
- **THEN** ve una sección de consola en vivo con copy coherente con el inicio y una captura real del panel, sin overlay de "Próximamente"

#### Scenario: Navegación entre inicio y características

- **WHEN** un visitante compara la sección del inicio con la de `/caracteristicas`
- **THEN** ambas describen la misma capacidad, evitan contradicciones sobre disponibilidad y mantienen la identidad visual del sitio

### Requirement: Referencias públicas sin software de escritorio

Todo el copy público del sitio SHALL dejar de presentar a CasterFly Studio como un software de transmisión externo o futuro. Las referencias restantes, si existen, MUST describir la consola en vivo dentro del panel.

#### Scenario: Preguntas frecuentes

- **WHEN** un visitante lee la pregunta sobre cómo empezar a transmitir
- **THEN** la respuesta menciona transmitir desde la consola en vivo del panel o desde software externo (ZaraRadio, RadioBoss, OBS), sin decir que enlaza CasterFly Studio como programa aparte

#### Scenario: Bullets de planes

- **WHEN** un visitante lee las características de los planes de radio
- **THEN** los bullets no ofrecen "CasterFly Studio" como software externo y, si se menciona la transmisión, se refiere a la consola web del panel o a software de terceros

#### Scenario: Metadatos de Características

- **WHEN** se indexa o comparte `/caracteristicas`
- **THEN** la meta descripción describe la consola en vivo del panel y no anuncia CasterFly Studio como software de escritorio

### Requirement: Captura real de la consola en vivo

El visual de la sección SHALL ser una captura real de la consola en vivo del panel (`/dashboard/streaming/live`) y MUST NOT ser una maqueta, un mockup o una imagen de un producto no publicado.

#### Scenario: Imagen de la sección

- **WHEN** un visitante ve el visual de la consola
- **THEN** reconoce la interfaz real del panel (biblioteca, lista, transporte y controles) con texto alternativo descriptivo

#### Scenario: Adaptación responsive

- **WHEN** el sitio se ve en pantallas pequeñas o grandes
- **THEN** la captura se mantiene legible, sin recortes que oculten los controles principales ni desbordes horizontales

### Requirement: Paridad de idioma

Los textos nuevos o modificados SHALL existir en español e inglés, con el mismo significado y sin claves faltantes ni texto residual del mensaje anterior.

#### Scenario: Cambio de idioma

- **WHEN** un visitante alterna entre español e inglés en el inicio o en `/caracteristicas`
- **THEN** la sección de consola en vivo se muestra completa en el idioma elegido y no queda ningún texto de "transmisor de audio profesional" ni de software de escritorio
