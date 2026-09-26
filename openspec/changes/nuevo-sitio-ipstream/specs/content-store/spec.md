# Spec Delta

## Purpose

Define el almacenamiento y acceso al contenido del sitio (planes, categorías, noticias, tutoriales, portafolio, comunidad y ajustes) sobre una base SQLite local, con reglas de integridad, ordenamiento y separación entre lecturas públicas y escrituras del panel.

## ADDED Requirements

### Requirement: Esquema de contenido persistido
El sistema SHALL persistir el contenido en una base SQLite local con las tablas `plan_categories`, `plans`, `news`, `tutorial_categories`, `tutorials`, `client_portfolio`, `community_radios` y `settings`, donde la lista de características de un plan (`features`) se almacena como JSON en una columna de texto.

#### Scenario: Base inicializada
- **WHEN** la aplicación arranca por primera vez sin base existente
- **THEN** se crea el archivo de base con todas las tablas y columnas del esquema de contenido

#### Scenario: Características de un plan
- **WHEN** se lee un plan con características cargadas
- **THEN** el repositorio devuelve la lista de características como arreglo, no como texto JSON

### Requirement: Integridad y unicidad
El sistema SHALL garantizar identificadores únicos para `plan_key`, `slug` y las claves de `settings`, y SHALL impedir que existan filas con categoría inexistente.

#### Scenario: Clave duplicada
- **WHEN** se intenta crear un plan con un `plan_key` ya existente
- **THEN** la operación falla con un error de validación y no altera la fila existente

#### Scenario: Categoría inexistente
- **WHEN** se intenta asignar a un plan una categoría que no existe
- **THEN** la operación falla y no se persiste el plan

### Requirement: Consultas públicas ordenadas
El sistema SHALL exponer consultas de solo lectura con ordenamiento consistente: planes por `display_order` de su categoría y luego por `id`; noticias por `published_at` descendente; portafolio y comunidad por `display_order`; tutoriales por `display_order`; y SHALL excluir los registros con `is_active` en falso de las lecturas públicas.

#### Scenario: Listado público de planes
- **WHEN** se solicitan los planes activos
- **THEN** se devuelven agrupables por categoría y en el orden definido, sin incluir planes inactivos

#### Scenario: Plan inactivo
- **WHEN** un plan tiene `is_active` en falso
- **THEN** no aparece en el sitio público pero permanece consultable desde el admin

### Requirement: Ajustes clave-valor
El sistema SHALL almacenar la configuración editable (por ejemplo, enlaces de redes sociales) en una tabla `settings` de pares clave-valor con fecha de actualización, y SHALL devolver un valor por defecto cuando la clave no exista.

#### Scenario: Clave ausente
- **WHEN** se consulta un ajuste que no está definido
- **THEN** el sistema devuelve un valor vacío o nulo sin lanzar error

### Requirement: Lecturas concurrentes con escrituras
El sistema SHALL permitir que las lecturas del sitio público no queden bloqueadas por las escrituras del panel.

#### Scenario: Lectura durante una edición
- **WHEN** el admin guarda un cambio mientras un visitante carga una página
- **THEN** el visitante obtiene una respuesta consistente, sin error de bloqueo de base de datos
