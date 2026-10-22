# Spec Delta

## Purpose

Define cómo se sirve y opera el sitio público de CasterFly en el VPS del panel, con su base de datos, uploads y dominio canónico.

## ADDED Requirements

### Requirement: Sitio público en la raíz de casterfly.com
El sitio público SHALL servirse en `https://casterfly.com/` y sus rutas públicas (`/planes`, `/caracteristicas`, `/tutoriales`, `/noticias`, `/clientes`, `/contacto`) SHALL responder desde ese host. El sitio NO SHALL depender de `ipstream.cl` para funcionar.

#### Scenario: Home pública
- **WHEN** un navegador solicita `https://casterfly.com/`
- **THEN** recibe el sitio público de CasterFly con `200` y el certificado TLS válido

#### Scenario: Página pública interna
- **WHEN** un navegador solicita `https://casterfly.com/planes`
- **THEN** recibe la página de planes del sitio público

#### Scenario: Host viejo
- **WHEN** un navegador solicita una página del sitio en `https://ipstream.cl/`
- **THEN** no se sirve como canónica; el host nuevo es el que responde el contenido oficial

### Requirement: Stack aislado con base de datos y uploads persistentes
El sitio público SHALL ejecutarse con su propia base SQLite (`/data/app.db`) y su propio volumen de uploads, separados de la base de datos y los uploads del panel. Los datos SHALL sobrevivir a reinicios y redeploys.

#### Scenario: Reinicio del stack
- **WHEN** se reinicia el contenedor del sitio
- **THEN** el contenido, los uploads y la configuración siguen disponibles

#### Scenario: Aislamiento respecto del panel
- **WHEN** el sitio público escribe en su base de datos
- **THEN** no modifica tablas del panel

### Requirement: Administración del sitio
El sitio público SHALL exponer su administración en `/admin`, protegida por credenciales configuradas por variables de entorno. El acceso NO SHALL quedar abierto sin autenticación.

#### Scenario: Acceso sin sesión
- **WHEN** un visitante sin sesión solicita `/admin`
- **THEN** recibe el login del sitio y no accede al panel de administración

#### Scenario: Acceso autenticado
- **WHEN** el administrador ingresa credenciales válidas
- **THEN** accede a la administración del sitio en el dominio nuevo

### Requirement: Formulario de contacto operativo
El sitio público SHALL permitir enviar consultas desde el formulario de contacto y SHALL guardarlas en su propia base de datos para que el administrador las consulte.

#### Scenario: Consulta válida
- **WHEN** un visitante completa y envía el formulario de contacto con datos válidos
- **THEN** la consulta queda registrada y el visitante recibe confirmación

#### Scenario: Consulta inválida
- **WHEN** el visitante omite campos obligatorios o envía datos inválidos
- **THEN** el sistema rechaza el envío y muestra el error correspondiente

### Requirement: Salud y disponibilidad del sitio
El sitio público SHALL responder correctamente a las rutas principales y a sus assets estáticos después de un despliegue. Un fallo del sitio NO SHALL afectar al panel ni a los sitios de clientes.

#### Scenario: Assets estáticos
- **WHEN** un navegador carga la home después de un despliegue
- **THEN** CSS, JS, imágenes y fuentes responden con `200`

#### Scenario: Fallo aislado
- **WHEN** el contenedor del sitio público no responde
- **THEN** el panel y los sitios de clientes siguen operativos
