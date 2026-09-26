# Spec Delta

## Purpose

Define cómo se extrae el contenido existente de ipstream.cl y se carga en el almacenamiento local: fuentes de origen, descarga de assets, idempotencia y verificación, como paso previo a la puesta en marcha del sitio nuevo.

## ADDED Requirements

### Requirement: Fuentes de contenido de origen
El proceso de migración SHALL obtener planes y categorías desde `https://ipstream.cl/php/api/get-plans.php`, noticias desde `https://ipstream.cl/api/news.php`, categorías de tutoriales desde `https://ipstream.cl/php/api/get-tutorials.php`, y SHALL extraer el portafolio de clientes y las radios de comunidad desde las páginas `/clientes` y `/comunidad` del sitio actual.

#### Scenario: Planes desde la API
- **WHEN** se ejecuta la migración
- **THEN** se importan los planes y sus categorías con precios, características, imágenes y enlaces de demo

#### Scenario: Portafolio y comunidad desde HTML
- **WHEN** se ejecuta la migración
- **THEN** se extraen los registros de clientes y de radios de comunidad con su nombre, imagen/logo y enlace

### Requirement: Descarga de assets
La migración SHALL descargar al almacenamiento de uploads las imágenes referenciadas por los registros migrados y SHALL reescribir las rutas almacenadas para apuntar a los archivos locales.

#### Scenario: Imagen de un plan
- **WHEN** un plan referencia una imagen remota
- **THEN** el archivo se descarga a uploads y la fila guarda la ruta local

#### Scenario: Imagen no disponible
- **WHEN** una imagen remota no puede descargarse
- **THEN** el registro se conserva sin imagen y la migración reporta la incidencia sin abortar el resto

### Requirement: Idempotencia
La migración SHALL ser idempotente: al ejecutarse más de una vez SHALL actualizar los registros existentes en lugar de duplicarlos, identificándolos por `plan_key` o por `slug`.

#### Scenario: Segunda ejecución
- **WHEN** la migración se ejecuta sobre una base ya migrada
- **THEN** no se crean duplicados y los registros se actualizan

#### Scenario: Registro nuevo detectado después
- **WHEN** la fuente contiene un registro que no existía en una ejecución previa
- **THEN** la migración lo inserta

### Requirement: Verificación de cobertura
La migración SHALL reportar al finalizar los conteos importados por tipo de contenido y SHALL permitir compararlos con la fuente para detectar pérdidas.

#### Scenario: Reporte final
- **WHEN** la migración termina
- **THEN** muestra cuántos planes, noticias, tutoriales, registros de portafolio y radios de comunidad se importaron o actualizaron

### Requirement: Independencia del runtime
La migración SHALL ejecutarse como un proceso puntual y SHALL NOT ser requerida por la aplicación en tiempo de ejecución del sitio público ni del panel.

#### Scenario: Arranque del sitio sin migración
- **WHEN** la aplicación se inicia sin volver a ejecutar la migración
- **THEN** opera normalmente con los datos ya cargados

### Requirement: Manejo de fuente inaccesible
Cuando una fuente de origen no esté disponible, la migración SHALL informar el fallo y SHALL NOT dejar el almacenamiento en un estado parcial inconsistente.

#### Scenario: API caída
- **WHEN** una API de origen responde con error o no responde
- **THEN** la migración reporta el error y no corrompe los datos ya migrados
