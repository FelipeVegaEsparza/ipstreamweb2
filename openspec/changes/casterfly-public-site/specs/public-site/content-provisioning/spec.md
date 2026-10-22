# Spec Delta

## Purpose

Define qué contenido del sitio público se conserva y cuál se recrea al migrar a CasterFly, sin arrastrar datos operativos del sitio anterior.

## ADDED Requirements

### Requirement: Conservar uploads
El sitio nuevo SHALL conservar las imágenes y archivos públicos que hoy se sirven desde `/uploads` (noticias, planes, portafolio, comunidad) para que las páginas no queden con imágenes rotas.

#### Scenario: Imagen de noticia
- **WHEN** una noticia recreada referencia una imagen que existía en el sitio viejo
- **THEN** la imagen se sirve desde `/uploads` en el sitio nuevo

#### Scenario: Imagen faltante
- **WHEN** una página referencia una imagen que no se copió
- **THEN** el sitio no rompe el layout y muestra un fallback o la omite

### Requirement: Recrear contenido editorial
El contenido editorial (planes, noticias, tutoriales, portafolio de clientes y comunidad) SHALL recrearse en la base nueva usando un snapshot de contenido saneado, el script de migración cuando el origen lo soporte, o el admin del sitio. El contenido NO SHALL depender de la base SQLite vieja para funcionar.

#### Scenario: Planes publicados
- **WHEN** un visitante abre `/planes`
- **THEN** ve los planes activos cargados en la base nueva y sus botones de contratación funcionan

#### Scenario: Noticia publicada
- **WHEN** el administrador publica una noticia en el admin nuevo
- **THEN** la noticia aparece en `/noticias` y en su detalle

#### Scenario: Tutorial publicado
- **WHEN** el administrador publica un tutorial
- **THEN** el tutorial aparece en `/tutoriales`

### Requirement: No migrar datos operativos del sitio viejo
La migración NO SHALL copiar clientes, leads, órdenes ni pagos del sitio viejo. La base nueva SHALL comenzar sin esos registros.

#### Scenario: Base nueva sin clientes
- **WHEN** se consulta la administración del sitio nuevo
- **THEN** no aparecen clientes, leads ni órdenes del sitio anterior

#### Scenario: Nuevo lead
- **WHEN** un visitante envía el formulario de contacto en el sitio nuevo
- **THEN** el lead se guarda en la base nueva y es visible en el admin nuevo

### Requirement: Contenido coherente con el panel
Los planes y enlaces de contratación del sitio público SHALL corresponder a los planes activos del panel y a sus slugs (`/planes/<slug>`). El sitio NO SHALL publicar un plan que no exista o esté inactivo en el panel.

#### Scenario: Plan activo
- **WHEN** el sitio muestra un plan y el visitante pulsa contratar
- **THEN** el panel abre la página del plan con el slug correcto

#### Scenario: Plan retirado
- **WHEN** un plan deja de estar activo en el panel
- **THEN** el sitio no lo presenta como contratable

### Requirement: Migración reproducible
La carga de contenido y la copia de uploads SHALL poder repetirse sin duplicar registros ni archivos. La migración SHALL dejar constancia de qué se copió y qué se recreó.

#### Scenario: Repetir la copia de uploads
- **WHEN** se vuelve a ejecutar la copia de uploads
- **THEN** los archivos existentes se mantienen y no se generan duplicados

#### Scenario: Repetir la carga de contenido
- **WHEN** se vuelve a ejecutar la carga semilla
- **THEN** no se duplican planes, noticias ni tutoriales
