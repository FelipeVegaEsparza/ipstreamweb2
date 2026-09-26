# Spec Delta

## Purpose

Define cómo se empaqueta y ejecuta la aplicación en producción: imagen Docker reproducible, ausencia de base de datos externa, persistencia de datos y assets mediante volúmenes, y configuración por variables de entorno para Dokploy.

## ADDED Requirements

### Requirement: Imagen Docker reproducible
El sistema SHALL incluir un `Dockerfile` multi-stage que construya la aplicación Astro y produzca una imagen de runtime que ejecute el servidor Node standalone en un puerto expuesto.

#### Scenario: Construcción de la imagen
- **WHEN** se construye la imagen a partir del repositorio limpio
- **THEN** la imagen se genera sin depender de artefactos locales previos y arranca el servidor

#### Scenario: Runtime sin herramientas de build
- **WHEN** la imagen de runtime se ejecuta
- **THEN** solo contiene las dependencias necesarias para servir la aplicación

### Requirement: Sin base de datos externa
La aplicación SHALL operar con su base SQLite embebida y SHALL NOT requerir conexión a un motor de base de datos externo para funcionar.

#### Scenario: Arranque sin DB externa
- **WHEN** el contenedor se inicia sin ninguna base externa configurada
- **THEN** la aplicación arranca y responde correctamente

### Requirement: Persistencia de datos y assets
El despliegue SHALL montar volúmenes para el archivo de base SQLite y para el directorio de uploads, de modo que ambos sobrevivan a reinicios y redeploys.

#### Scenario: Redeploy
- **WHEN** se despliega una nueva versión del contenedor
- **THEN** los datos de la base y las imágenes subidas se conservan

### Requirement: Configuración por variables de entorno
El despliegue SHALL configurarse mediante variables de entorno: `ADMIN_USER`, `ADMIN_PASS`, `SESSION_SECRET` y `SITE_URL`; y SHALL usar el secreto de sesión para firmar las cookies del panel.

#### Scenario: Cambio de credenciales
- **WHEN** se actualizan `ADMIN_USER`/`ADMIN_PASS` en el entorno y se redespliega
- **THEN** el login acepta las credenciales nuevas

#### Scenario: Secretos no versionados
- **WHEN** el repositorio se inspecciona
- **THEN** no contiene credenciales ni el secreto de sesión en el código o en archivos versionados

### Requirement: Compatibilidad con Dokploy
El despliegue SHALL incluir un `docker-compose.yml` apto para Dokploy con el servicio web y sus volúmenes, sin servicios de base de datos ni de administración de base.

#### Scenario: Despliegue en Dokploy
- **WHEN** Dokploy despliega el servicio
- **THEN** el contenedor web queda accesible por la red del proxy y reporta estado saludable

### Requirement: Salud del servicio
El despliegue SHALL exponer una verificación de salud que permita a la plataforma determinar si la aplicación está operativa.

#### Scenario: Servicio saludable
- **WHEN** la aplicación está en ejecución y puede responder
- **THEN** la verificación de salud reporta estado correcto
