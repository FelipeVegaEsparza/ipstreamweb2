# Spec Delta

## Purpose

Define la identidad visible CasterFly en el sitio público y su relación con el panel nuevo.

## ADDED Requirements

### Requirement: Marca CasterFly en todas las páginas públicas
Las páginas públicas SHALL mostrar el nombre **CasterFly** y el logo CasterFly en header, footer, títulos y metadatos. NO SHALL mostrar IPStream como marca principal.

#### Scenario: Header de la home
- **WHEN** un visitante abre `https://casterfly.com/`
- **THEN** el header muestra el logo CasterFly y el nombre CasterFly

#### Scenario: Título y metadatos
- **WHEN** un navegador o crawler lee la home
- **THEN** el `<title>`, la descripción y Open Graph usan CasterFly

#### Scenario: Footer
- **WHEN** un visitante llega al footer
- **THEN** el copyright y los enlaces usan CasterFly, no IPStream

### Requirement: Enlaces al panel nuevo
Todos los enlaces del sitio público al panel SHALL apuntar a `https://panel.casterfly.com`. Los enlaces a `/registro`, `/planes/<slug>` y `/auth/login` NO SHALL apuntar a `panelipstream.cl`.

#### Scenario: Botón de contratación
- **WHEN** un visitante pulsa "Contratar" en la página de planes
- **THEN** llega a `https://panel.casterfly.com/planes/<slug>` o a `/registro` en el panel nuevo

#### Scenario: Botón de ingreso
- **WHEN** un visitante pulsa "Ingresar"
- **THEN** llega al login del panel en `https://panel.casterfly.com`

#### Scenario: Enlace de registro
- **WHEN** un visitante pulsa cualquier CTA de registro
- **THEN** la URL de destino usa `panel.casterfly.com`

### Requirement: Canonical y SEO en el dominio nuevo
El sitio público SHALL declarar `https://casterfly.com` como URL canónica y SHALL actualizar `sitemap.xml` y `robots.txt` al dominio nuevo. Las URLs canónicas NO SHALL usar `http://ipstream.cl`.

#### Scenario: Canonical de la home
- **WHEN** un crawler lee la home
- **THEN** el canonical es `https://casterfly.com/`

#### Scenario: Sitemap
- **WHEN** un crawler solicita `https://casterfly.com/sitemap.xml`
- **THEN** las URLs listadas usan `casterfly.com`

### Requirement: Datos de contacto CasterFly
Los correos y enlaces de contacto visibles SHALL usar el dominio `casterfly.com`. Los formularios y mensajes NO SHALL mostrar `@ipstream.cl` como contacto principal.

#### Scenario: Contacto en el footer
- **WHEN** un visitante abre el footer o la sección de contacto
- **THEN** el correo visible usa `@casterfly.com`

#### Scenario: Correo de respuesta
- **WHEN** el sitio envía un correo al visitante o al administrador
- **THEN** el remitente y los enlaces usan `casterfly.com`

### Requirement: Assets de marca consistentes
El sitio SHALL usar los assets CasterFly (logo horizontal, isotipo, favicon y Open Graph) en todas las páginas y SHALL mantener la paleta y el estilo visual existentes del sitio.

#### Scenario: Favicon
- **WHEN** el navegador solicita el favicon del sitio
- **THEN** recibe el isotipo de CasterFly

#### Scenario: Open Graph
- **WHEN** se comparte una página en una red social
- **THEN** la imagen y el nombre corresponden a CasterFly
