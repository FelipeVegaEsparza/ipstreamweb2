export interface Feature {
  code: string;
  title: string;
  description: string;
  points: string[];
  image?: string;
  icon?: string;
}

export const PILLARS: Feature[] = [
  {
    code: '01',
    title: 'Sitio web profesional',
    description:
      'Tu radio con presencia profesional: página moderna, adaptable, rápida y con reproductor integrado. Noticias, programación, contacto y mucho más en un solo lugar.',
    points: ['Diseño responsive y moderno', 'Reproductor integrado', 'Secciones personalizables'],
    image: '/images/banners/principal1.png',
    icon: 'globe',
  },
  {
    code: '02',
    title: 'App PWA multiplataforma',
    description:
      'Llega directo al bolsillo de tu audiencia. La App PWA funciona como una app móvil real, sin pasar por tiendas. Compatible con Android, iPhone y PC.',
    points: ['Instalable en dispositivos móviles', 'Android, iPhone y PC', 'Funciona sin conexión'],
    image: '/images/banners/pwa1.png',
    icon: 'smartphone',
  },
  {
    code: '03',
    title: 'Panel admin intuitivo',
    description:
      'Control total sin complicaciones. Sube noticias, edita tu parrilla y administra tu contenido en tiempo real desde un panel fácil de usar.',
    points: ['Gestión de contenidos', 'Gestión de noticias', 'Programación de contenidos'],
    image: '/images/banners/dashboard1.png',
    icon: 'dashboard',
  },
];

export const HIGHLIGHTS: Feature[] = [
  {
    code: '01',
    title: 'Reproductor profesional',
    description:
      'Transmite tu radio online con un reproductor moderno, compatible con todos los dispositivos y 100% personalizable.',
    points: ['HTML5', 'Cross-browser', 'Personalizable'],
    icon: 'play',
  },
  {
    code: '02',
    title: 'Programación inteligente',
    description:
      'Muestra tu parrilla de programas en tiempo real. Profesionaliza tu emisora y facilita a tu audiencia saber qué se viene.',
    points: ['Parrilla en vivo', 'Días y horarios', 'Fácil de editar'],
    icon: 'calendar',
  },
  {
    code: '03',
    title: 'Podcast integrado',
    description:
      'Activa tu sección de podcasts y permite que tus oyentes revivan tus mejores contenidos, donde y cuando quieran.',
    points: ['Episodios por temporada', 'Reproducción on-demand', 'Catálogo propio'],
    icon: 'mic',
  },
  {
    code: '04',
    title: 'Videocast avanzado',
    description:
      'Convierte tu radio en multiplataforma: publica videoprogramas y aumenta tu alcance visual con enlace directo desde YouTube.',
    points: ['Video en vivo', 'Enlace directo', 'Más alcance'],
    icon: 'video',
  },
  {
    code: '05',
    title: 'Portal de noticias',
    description:
      'Publica noticias directamente desde tu panel. Ideal para radios comunitarias, informativas o con contenido editorial.',
    points: ['Redacción simple', 'Categorías', 'Compartir en redes'],
    icon: 'news',
  },
  {
    code: '06',
    title: 'Ranking musical en video',
    description:
      'Atrae y fideliza audiencia con un ranking musical en video, actualizado semanalmente y totalmente automatizado.',
    points: ['Actualización semanal', 'Automático', 'Fideliza audiencia'],
    icon: 'ranking',
  },
];

export const STUDIO_FEATURES: Feature[] = [
  {
    code: '01',
    title: 'Transmisión en vivo',
    description: 'Enlaza con los servidores de IPStream y transmite tu señal en tiempo real con máxima calidad.',
    points: ['Baja latencia', 'Alta calidad', 'Conexión estable'],
  },
  {
    code: '02',
    title: 'Locución de hora y temperatura',
    description: 'Configurable por ciudad. Tu radio dirá automáticamente la hora y temperatura actual sin intervención manual.',
    points: ['Por ciudad', 'Automático', 'Configurable'],
  },
  {
    code: '03',
    title: 'Gestión de playlist',
    description: 'Organiza tu programación musical con listas de reproducción inteligentes y programación automatizada.',
    points: ['Listas inteligentes', 'Programación', 'AutoDJ'],
  },
  {
    code: '04',
    title: 'Grabación y automatización',
    description: 'Graba tu transmisión, programa cuñas automáticas y mantén tu radio funcionando 24/7 sin supervisión.',
    points: ['Grabación', 'Cuñas', '24/7'],
  },
];

export const PLAYERS = [
  { title: 'Reproductor moderno', description: 'Interfaz elegante y minimalista con controles intuitivos.', tags: ['Responsive', 'HTML5', 'Cross-browser'], image: '/images/players/1.png' },
  { title: 'Reproductor compacto', description: 'Diseño minimalista perfecto para integrar en cualquier sitio web.', tags: ['Ligero', 'Rápido', 'Integrable'], image: '/images/players/2.png' },
  { title: 'Reproductor avanzado', description: 'Metadatos, historial de reproducción y controles completos.', tags: ['Metadatos', 'Historial', 'Premium'], image: '/images/players/3.png' },
  { title: 'Reproductor flotante', description: 'Permanece visible mientras navegas por el sitio.', tags: ['Flotante', 'Sticky', 'Continuo'], image: '/images/players/4.png' },
  { title: 'Reproductor full screen', description: 'Experiencia inmersiva con modo pantalla completa.', tags: ['Fullscreen', 'Inmersivo', 'HD'], image: '/images/players/5.png' },
  { title: 'Reproductor personalizable', description: 'Colores, estilos y funciones ajustables a tu marca.', tags: ['Custom', 'Branding', 'Flexible'], image: '/images/players/6.png' },
];

export const SUPPORT_CARDS = [
  {
    title: 'Contacto soporte',
    description: '¿Tienes dudas o necesitas ayuda? Nuestro equipo está listo para asistirte.',
    href: 'mailto:contacto@ipstream.cl',
    action: 'Escribir a soporte',
  },
  {
    title: 'Tutoriales del sistema',
    description: 'Aprende a usar todas las herramientas de tu plataforma con guías paso a paso y videos.',
    href: '/tutoriales',
    action: 'Ver tutoriales',
  },
  {
    title: 'Preguntas frecuentes',
    description: 'Respuestas a las dudas más comunes sobre planes, transmisión y configuración.',
    href: '#faq',
    action: 'Leer preguntas',
  },
];

export const FAQ = [
  {
    question: '¿Cómo empiezo a transmitir?',
    answer:
      'Contratas un plan, recibes tus credenciales de transmisión y enlazas IPStreamStudio o tu software preferido (ZaraRadio, RadioBoss, OBS) a nuestros servidores.',
  },
  {
    question: '¿Incluye sitio web y app?',
    answer:
      'Los planes Profesional incluyen sitio web con reproductor y App PWA instalable en Android, iPhone y PC. El plan Inicia incluye el perfil público y el reproductor.',
  },
  {
    question: '¿Puedo cambiar de plan?',
    answer:
      'Sí. Puedes subir de plan en cualquier momento y conservas tu configuración, tu contenido y tu audiencia.',
  },
  {
    question: '¿Qué medios de pago aceptan?',
    answer: 'Aceptamos tarjetas de crédito, débito y transferencia. La facturación es mensual, sin contratos de permanencia.',
  },
];
