# Spec Delta

## Purpose

Define el sitio público: las páginas de contenido de IPStream, su renderizado data-driven desde `content-store`, la paridad de URLs con el sitio actual, y el comportamiento SEO y de errores.

## ADDED Requirements

### Requirement: Páginas de contenido
El sitio SHALL exponer las páginas `/` (inicio), `/planes`, `/caracteristicas`, `/tutoriales`, `/noticias`, `/noticias/[slug]`, `/clientes`, `/comunidad`, `/soporte` y una página 404, conservando las mismas rutas que el sitio actual.

#### Scenario: Ruta existente
- **WHEN** un visitante solicita `/planes`
- **THEN** el sitio responde con la página de planes renderizada

#### Scenario: Ruta inexistente
- **WHEN** un visitante solicita una ruta que no existe
- **THEN** el sitio responde con la página 404 y su estado HTTP correspondiente

### Requirement: Inicio con contenido dinámico
La página de inicio SHALL mostrar las últimas noticias publicadas y las secciones de contenido disponibles del sitio.

#### Scenario: Noticias en el inicio
- **WHEN** existen noticias activas
- **THEN** el inicio muestra las más recientes según el orden público

#### Scenario: Sin noticias
- **WHEN** no existen noticias activas
- **THEN** el inicio omite la sección de noticias sin romper el resto de la página

### Requirement: Página de planes data-driven
La página `/planes` SHALL mostrar los planes activos agrupados por categoría, con nombre, descripción, precio mensual, precio anual, nota de facturación, lista de características, imagen y enlace de demo cuando existan.

#### Scenario: Planes agrupados por categoría
- **WHEN** hay planes activos en distintas categorías
- **THEN** la página los presenta agrupados por categoría según el orden público

#### Scenario: Plan sin imagen
- **WHEN** un plan no tiene imagen asociada
- **THEN** la tarjeta se renderiza sin imagen y sin espacios vacíos rotos

### Requirement: Noticias con listado y detalle
El sitio SHALL listar las noticias activas y SHALL exponer el detalle de cada noticia en `/noticias/[slug]`; una noticia inexistente o inactiva SHALL responder 404.

#### Scenario: Detalle de noticia
- **WHEN** un visitante solicita el slug de una noticia activa
- **THEN** se muestra su título, imagen, fecha y contenido completo

#### Scenario: Noticia inexistente
- **WHEN** un visitante solicita el slug de una noticia que no existe o está inactiva
- **THEN** el sitio responde 404

### Requirement: Portafolio y comunidad
El sitio SHALL mostrar el portafolio de clientes en `/clientes` y las radios de la comunidad en `/comunidad`, usando sus datos públicos (título/nombre, imagen o logo y enlace al proyecto o sitio) y omitiendo los registros inactivos.

#### Scenario: Tarjeta de cliente
- **WHEN** un registro de portafolio tiene título, imagen y enlace
- **THEN** la tarjeta enlaza al proyecto en una pestaña nueva

#### Scenario: Registro inactivo
- **WHEN** un registro de portafolio o comunidad está inactivo
- **THEN** no se muestra en el sitio público

### Requirement: Tutoriales
La página `/tutoriales` SHALL listar los tutoriales activos agrupados por categoría y SHALL mostrar un estado vacío explícito cuando no haya tutoriales cargados.

#### Scenario: Sin tutoriales
- **WHEN** no hay tutoriales activos
- **THEN** la página muestra un estado vacío claro en lugar de una lista en blanco

### Requirement: Páginas estáticas prerenderizadas
El sitio SHALL servir `/caracteristicas`, `/soporte`, `/robots.txt`, `/sitemap.xml` y la página 404 como contenido prerenderizado, sin acceso a base de datos en cada request.

#### Scenario: Respuesta estática
- **WHEN** un visitante solicita `/caracteristicas`
- **THEN** la respuesta se sirve desde el contenido prerenderizado

### Requirement: SEO y metadatos
El sitio SHALL incluir en cada página un título y descripción, URL canónica y metadatos Open Graph/Twitter; SHALL generar `sitemap.xml` con las rutas públicas y `robots.txt` que permita el rastreo del sitio público y excluya `/admin`.

#### Scenario: Metadatos de página
- **WHEN** un buscador o red social consume una página pública
- **THEN** recibe título, descripción, canónica e imagen Open Graph definidos

#### Scenario: Exclusión del admin
- **WHEN** un buscador solicita `robots.txt`
- **THEN** el archivo permite el sitio público e impide indexar `/admin`

### Requirement: Sin flujos comerciales
El sitio SHALL NOT exponer rutas de pago o checkout (`/checkout`, `/pago-*`) ni procesar pagos; los llamados a la acción comerciales SHALL dirigir a contacto o al panel externo.

#### Scenario: Acceso a ruta de pago
- **WHEN** un visitante solicita una ruta de pago del sitio anterior
- **THEN** no existe una página funcional de pago en el sitio nuevo

### Requirement: Adaptabilidad y accesibilidad
El sitio SHALL ser adaptable a móvil y escritorio, y SHALL ofrecer navegación por teclado, foco visible y textos alternativos en imágenes informativas.

#### Scenario: Navegación por teclado
- **WHEN** un usuario recorre la página con la tecla Tab
- **THEN** puede alcanzar los enlaces y controles con foco visible
