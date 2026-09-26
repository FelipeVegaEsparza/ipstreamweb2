# Spec Delta

## Purpose

Define el panel interno `/admin`: autenticación de un único administrador, protección de rutas y operaciones de alta, edición y baja de planes y de las secciones de contenido, incluyendo la subida de imágenes.

## ADDED Requirements

### Requirement: Inicio de sesión
El panel SHALL autenticar a un único administrador contra las credenciales definidas en variables de entorno (`ADMIN_USER`, `ADMIN_PASS`) y, al validar, SHALL crear una sesión mediante una cookie firmada `httpOnly`, `Secure` y `SameSite=Lax`.

#### Scenario: Credenciales válidas
- **WHEN** el administrador envía usuario y contraseña correctos
- **THEN** se crea la sesión y se redirige al panel

#### Scenario: Credenciales inválidas
- **WHEN** el administrador envía credenciales incorrectas
- **THEN** no se crea sesión y se muestra un error sin revelar cuál dato falló

#### Scenario: Credenciales no configuradas
- **WHEN** las variables de entorno del admin no están definidas
- **THEN** el login informa que el panel no está configurado y no permite el acceso

### Requirement: Protección de rutas y cierre de sesión
El sistema SHALL exigir sesión válida para todas las rutas bajo `/admin` salvo el login, y SHALL ofrecer un cierre de sesión que invalide la cookie.

#### Scenario: Acceso sin sesión
- **WHEN** un visitante sin sesión solicita una ruta del panel
- **THEN** es redirigido al login

#### Scenario: Cierre de sesión
- **WHEN** el administrador cierra sesión
- **THEN** la cookie de sesión deja de ser válida y el acceso al panel queda bloqueado

### Requirement: Expiración por inactividad
La sesión del panel SHALL expirar tras un período de inactividad y SHALL invalidarse si el contexto del cliente no corresponde al de la sesión emitida.

#### Scenario: Inactividad prolongada
- **WHEN** la sesión supera el tiempo de inactividad permitido
- **THEN** la siguiente solicitud exige iniciar sesión nuevamente

### Requirement: Protección CSRF en mutaciones
Toda operación que modifique datos desde el panel SHALL requerir un token válido asociado a la sesión, y SHALL rechazar la operación cuando el token falte o no coincida.

#### Scenario: Envío sin token
- **WHEN** llega una solicitud de mutación sin token CSRF válido
- **THEN** el sistema rechaza la operación sin modificar datos

### Requirement: Gestión de planes y categorías
El panel SHALL permitir crear, editar, activar/desactivar y eliminar planes y categorías de planes, incluyendo nombre, clave, precios mensual y anual, nota de facturación, descripción, características, imagen, enlace de demo y categoría.

#### Scenario: Crear un plan
- **WHEN** el administrador completa los datos válidos de un plan y guarda
- **THEN** el plan queda persistido y visible en el sitio público si está activo

#### Scenario: Editar un plan
- **WHEN** el administrador modifica precio o características de un plan
- **THEN** el cambio se refleja en el sitio público

#### Scenario: Eliminar una categoría con planes
- **WHEN** el administrador intenta eliminar una categoría que tiene planes asociados
- **THEN** el sistema evita dejar planes huérfanos (rechaza o reasigna según la regla definida)

### Requirement: Gestión de secciones de contenido
El panel SHALL permitir crear, editar, activar/desactivar y eliminar noticias, tutoriales y sus categorías, portafolio de clientes y radios de comunidad.

#### Scenario: Publicar una noticia
- **WHEN** el administrador guarda una noticia activa con título y contenido
- **THEN** la noticia aparece en el listado público y su detalle responde en `/noticias/[slug]`

#### Scenario: Desactivar contenido
- **WHEN** el administrador desactiva una noticia, proyecto o radio
- **THEN** el registro deja de mostrarse en el sitio público

### Requirement: Gestión de ajustes y redes sociales
El panel SHALL permitir editar los ajustes clave-valor, incluidos los enlaces de redes sociales usados en el pie del sitio.

#### Scenario: Actualizar redes sociales
- **WHEN** el administrador actualiza un enlace de red social
- **THEN** el enlace cambia en el pie del sitio público

### Requirement: Subida de imágenes
El panel SHALL permitir subir imágenes para planes, noticias, portafolio y comunidad, SHALL validar tipo y tamaño del archivo, y SHALL guardarlas en el almacenamiento persistente de uploads.

#### Scenario: Imagen válida
- **WHEN** el administrador sube una imagen permitida
- **THEN** el archivo se almacena y su ruta queda asociada al registro

#### Scenario: Archivo inválido
- **WHEN** el administrador sube un archivo con tipo o tamaño no permitido
- **THEN** el sistema rechaza la subida y muestra un error

### Requirement: Panel no indexable
El panel SHALL impedir la indexación por buscadores de todas las rutas bajo `/admin`.

#### Scenario: Rastreo del admin
- **WHEN** un buscador accede a una página del admin
- **THEN** la respuesta indica que no debe indexarse
