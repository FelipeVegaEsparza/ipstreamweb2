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
      'Llega directo al bolsillo de tu audiencia. La App PWA funciona como una app móvil real, sin pasar por tiendas. Compatible con Android, iPhone y PC, con mensajería push masiva desde el panel.',
    points: ['Instalable en dispositivos móviles', 'Android, iPhone y PC', 'Funciona sin conexión', 'Push masivo desde el panel'],
    image: '/images/banners/pwa1.png',
    icon: 'smartphone',
  },
  {
    code: '03',
    title: 'Panel profesional con IA',
    description:
      'Controla tu emisora y deja que la IA te asista: locutor automático, cápsulas, noticias y locuciones de hora/clima con la voz de tu radio.',
    points: ['Locutor IA', 'Analítica profesional', 'Consola en vivo'],
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
    title: 'Analítica profesional',
    description:
      'Mide oyentes en vivo, sesiones, dispositivos, ubicación y horas pico para tomar decisiones con datos.',
    points: ['Oyentes en vivo', 'Sesiones y retención', 'Geografía y dispositivos'],
    icon: 'ranking',
  },
  {
    code: '07',
    title: 'Mensajería push masiva',
    description:
      'Envía mensajes masivos desde el panel de control a todos los dispositivos que tengan instalada la app de tu radio. Ideal para anunciar programas en vivo, noticias, promociones y eventos especiales.',
    points: ['Desde el panel', 'Dispositivos con la app', 'Anuncios y promociones'],
    icon: 'bell',
  },
];

export const AI_FEATURES: Feature[] = [
  {
    code: '01',
    title: 'Locutor IA',
    description:
      'Un presentador automático que anuncia el próximo tema con la voz de tu emisora. Eliges la frecuencia, las frases y el estilo.',
    points: ['Voz de marca', 'Cada N temas', 'AutoDJ y vivo'],
    icon: 'mic',
  },
  {
    code: '02',
    title: 'Locuciones inteligentes',
    description:
      'Hora, clima y mensajes se generan solos, se mezclan con ducking y se cachean para no repetir costos.',
    points: ['Hora y clima', 'Ducking automático', 'Cache de voz'],
    icon: 'globe',
  },
  {
    code: '03',
    title: 'Cápsulas IA',
    description:
      'Escribes un guion y la IA lo convierte en una cápsula de audio con música de fondo, lista para emitir.',
    points: ['Guion → audio', 'Música IA', 'Programable'],
    icon: 'layers',
  },
  {
    code: '04',
    title: 'Noticias con IA',
    description:
      'Genera borradores de noticias para tu audiencia, revísalos y publícalos desde el mismo panel.',
    points: ['Borradores IA', 'Categorías', 'Revisión editorial'],
    icon: 'news',
  },
  {
    code: '05',
    title: 'AutoDJ que presenta',
    description:
      'La música no se detiene: el AutoDJ rota, programa y presenta con IA, sin mezclar la voz con los jingles.',
    points: ['Rotación inteligente', 'Intros IA', 'Operación 24/7'],
    icon: 'radio',
  },
  {
    code: '06',
    title: 'Voz profesional',
    description:
      'Elige ElevenLabs o Fish Audio, voces alternativas y un fallback local para que la radio nunca se quede sin voz.',
    points: ['ElevenLabs', 'Fish Audio', 'Fallback Piper'],
    icon: 'mic',
  },
];

export const AI_STEPS = [
  {
    code: '01',
    title: 'Eliges la voz',
    description: 'Seleccionas la voz de la emisora y el proveedor: ElevenLabs, Fish Audio o la voz local de respaldo.',
  },
  {
    code: '02',
    title: 'Defines el guion',
    description: 'Escribes frases con variables como {{radio}}, {{titulo}} y {{artista}}, o dejas que la IA genere una cápsula.',
  },
  {
    code: '03',
    title: 'La IA locuta',
    description: 'El panel genera el audio, lo cachea y lo mezcla con la música respetando los tiempos de la radio.',
  },
  {
    code: '04',
    title: 'Mides y ajustas',
    description: 'Sigues la cuota de caracteres, la frecuencia y el resultado en la analítica del panel.',
  },
];

export const STUDIO_FEATURES: Feature[] = [
  {
    code: '01',
    title: 'Biblioteca y cola',
    description: 'Carga archivos o carpetas de tu equipo, busca, agrega a la cola y reordena. La música se reproduce desde tu navegador: no se sube al servidor.',
    points: ['Carpeta local', 'Cola e historial', 'Sin subir archivos'],
  },
  {
    code: '02',
    title: 'Micrófono y monitoreo',
    description: 'Habla en vivo con ganancia, cue y medidores estéreo. La consola te pide confirmar audífonos antes de salir al aire.',
    points: ['Ganancia y cue', 'VU estéreo', 'Audífonos'],
  },
  {
    code: '03',
    title: 'Efectos y locuciones',
    description: 'Dispara efectos, jingles y cápsulas, y agrega hora, clima o locutor IA con la voz de tu emisora.',
    points: ['Botonera', 'Jingles y cápsulas', 'Hora/clima + IA'],
  },
  {
    code: '04',
    title: 'Salida al aire',
    description: 'Elige el slot o DJ, transmite a 192 kbps y sigue el estado de la sesión, la reconexión y los oyentes conectados.',
    points: ['Slots y DJ', '192 kbps', 'Estado y oyentes'],
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
    href: 'mailto:contacto@casterfly.com',
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
      'Contratas un plan, recibes tus credenciales de transmisión y transmites desde la consola en vivo del panel o desde tu software preferido (ZaraRadio, RadioBoss, OBS).',
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

export const PRO_FEATURES = [
  { icon: 'dashboard', title: 'Analítica profesional', text: 'Oyentes, sesiones, dispositivos, ubicación y horas pico.' },
  { icon: 'mic', title: 'Consola en vivo', text: 'Transporte, playlists, efectos y locuciones desde el navegador.' },
  { icon: 'calendar', title: 'Parrilla y AutoDJ', text: 'Programación por franjas, rotación automática y jingles.' },
  { icon: 'smartphone', title: 'Sitio y PWA', text: 'Sitio del cliente, reproductor y app instalable.' },
  { icon: 'video', title: 'Radio + TV', text: 'Audio y video en la misma plataforma, con HLS y VOD2Live.' },
  { icon: 'layers', title: 'Multi-emisora', text: 'Opera varias radios o canales desde un solo panel.' },
]
