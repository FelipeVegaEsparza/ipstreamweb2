import type { Feature } from './content'

export const PILLARS: Feature[] = [
  {
    code: '01',
    title: 'Professional website',
    description:
      'Give your radio a professional presence: a modern, responsive, fast site with an integrated player. News, schedule, contact and much more in one place.',
    points: ['Responsive, modern design', 'Integrated player', 'Customizable sections'],
    image: '/images/banners/principal1.png',
    icon: 'globe',
  },
  {
    code: '02',
    title: 'Cross-platform PWA app',
    description:
      'Reach your audience’s pocket. The PWA works like a real mobile app without app stores. Compatible with Android, iPhone and PC, with mass push messaging from the panel.',
    points: ['Installable on mobile', 'Android, iPhone and PC', 'Works offline', 'Mass push from the panel'],
    image: '/images/banners/pwa1.png',
    icon: 'smartphone',
  },
  {
    code: '03',
    title: 'Professional panel with AI',
    description:
      'Control your station and let AI assist you: automatic presenter, capsules, news and time/weather voice-overs in your radio’s voice.',
    points: ['AI presenter', 'Professional analytics', 'Live console'],
    image: '/images/banners/dashboard1.png',
    icon: 'dashboard',
  },
]

export const HIGHLIGHTS: Feature[] = [
  {
    code: '01',
    title: 'Professional player',
    description:
      'Stream your online radio with a modern, fully customizable player that works on every device.',
    points: ['HTML5', 'Cross-browser', 'Customizable'],
    icon: 'play',
  },
  {
    code: '02',
    title: 'Smart scheduling',
    description:
      'Show your program schedule in real time. Make your station more professional and help your audience know what’s next.',
    points: ['Live schedule', 'Days and times', 'Easy to edit'],
    icon: 'calendar',
  },
  {
    code: '03',
    title: 'Integrated podcast',
    description:
      'Enable your podcast section and let listeners enjoy your best content whenever and wherever they want.',
    points: ['Season episodes', 'On-demand playback', 'Your own catalog'],
    icon: 'mic',
  },
  {
    code: '04',
    title: 'Advanced videocast',
    description:
      'Turn your radio into a multiplatform brand: publish video shows and grow your visual reach with direct YouTube links.',
    points: ['Live video', 'Direct link', 'More reach'],
    icon: 'video',
  },
  {
    code: '05',
    title: 'News portal',
    description:
      'Publish news directly from your panel. Ideal for community, news or editorial radio stations.',
    points: ['Simple editor', 'Categories', 'Share on social'],
    icon: 'news',
  },
  {
    code: '06',
    title: 'Professional analytics',
    description:
      'Measure live listeners, sessions, devices, location and peak hours to make data-driven decisions.',
    points: ['Live listeners', 'Sessions and retention', 'Geography and devices'],
    icon: 'ranking',
  },
  {
    code: '07',
    title: 'Mass push messaging',
    description:
      'Send mass messages from the control panel to every device that has your radio’s app installed. Ideal for announcing live shows, news, promotions and special events.',
    points: ['From the panel', 'Devices with the app', 'Announcements and promos'],
    icon: 'bell',
  },
  {
    code: '08',
    title: 'Live chat with your audience',
    description:
      'Open a live chat on your radio’s website and PWA. Listeners join with their name and email, staff replies from the panel, and new messages are announced instantly.',
    points: ['Website and PWA', 'Moderation and bans', 'New message alerts'],
    icon: 'chat',
  },
]

export const AI_FEATURES: Feature[] = [
  {
    code: '01',
    title: 'AI presenter',
    description:
      'An automatic presenter that announces the next track in your station’s voice. Choose the frequency, phrases and style.',
    points: ['Brand voice', 'Every N tracks', 'AutoDJ and live'],
    icon: 'mic',
  },
  {
    code: '02',
    title: 'Smart voice-overs',
    description:
      'Time, weather and messages are generated automatically, ducked under the music and cached to avoid repeated costs.',
    points: ['Time and weather', 'Automatic ducking', 'Voice cache'],
    icon: 'globe',
  },
  {
    code: '03',
    title: 'AI capsules',
    description:
      'Write a script and AI turns it into an audio capsule with background music, ready to air.',
    points: ['Script → audio', 'AI music', 'Schedulable'],
    icon: 'layers',
  },
  {
    code: '04',
    title: 'AI-powered news',
    description:
      'Generate news drafts for your audience, review them and publish from the same panel.',
    points: ['AI drafts', 'Categories', 'Editorial review'],
    icon: 'news',
  },
  {
    code: '05',
    title: 'AutoDJ that presents',
    description:
      'Music never stops: AutoDJ rotates, schedules and presents with AI, without mixing the voice into jingles.',
    points: ['Smart rotation', 'AI intros', '24/7 operation'],
    icon: 'radio',
  },
  {
    code: '06',
    title: 'Professional voice',
    description:
      'Choose ElevenLabs or Fish Audio, alternative voices and a local fallback so your radio never loses its voice.',
    points: ['ElevenLabs', 'Fish Audio', 'Piper fallback'],
    icon: 'mic',
  },
]

export const AI_STEPS = [
  {
    code: '01',
    title: 'Choose the voice',
    description: 'Select your station’s voice and provider: ElevenLabs, Fish Audio or the local backup voice.',
  },
  {
    code: '02',
    title: 'Define the script',
    description: 'Write phrases with variables like {{radio}}, {{title}} and {{artist}}, or let AI generate a capsule.',
  },
  {
    code: '03',
    title: 'AI voices it',
    description: 'The panel generates and caches the audio, then mixes it with the music while respecting the station’s timing.',
  },
  {
    code: '04',
    title: 'Measure and tune',
    description: 'Track character quota, frequency and results in the panel analytics.',
  },
]

export const STUDIO_FEATURES: Feature[] = [
  {
    code: '01',
    title: 'Library and queue',
    description: 'Load files or folders from your computer, search, add to the queue and reorder. Audio plays from your browser and is never uploaded to the server.',
    points: ['Local folder', 'Queue and history', 'No uploads'],
  },
  {
    code: '02',
    title: 'Mic and monitoring',
    description: 'Go live with gain, cue and stereo meters. The console asks you to confirm headphones before going on air.',
    points: ['Gain and cue', 'Stereo VU', 'Headphones'],
  },
  {
    code: '03',
    title: 'Effects and voice-overs',
    description: 'Fire sound effects, jingles and capsules, and add time, weather or an AI presenter in your station voice.',
    points: ['Sound pad', 'Jingles and capsules', 'Time/weather + AI'],
  },
  {
    code: '04',
    title: 'On-air output',
    description: 'Pick the slot or DJ, stream at 192 kbps and follow session status, reconnection and connected listeners.',
    points: ['Slots and DJ', '192 kbps', 'Status and listeners'],
  },
]

export const PLAYERS = [
  { title: 'Modern player', description: 'Elegant, minimalist interface with intuitive controls.', tags: ['Responsive', 'HTML5', 'Cross-browser'], image: '/images/players/1.png' },
  { title: 'Compact player', description: 'Minimalist design, perfect for embedding on any website.', tags: ['Lightweight', 'Fast', 'Embeddable'], image: '/images/players/2.png' },
  { title: 'Advanced player', description: 'Metadata, playback history and complete controls.', tags: ['Metadata', 'History', 'Premium'], image: '/images/players/3.png' },
  { title: 'Floating player', description: 'Stays visible while visitors browse your site.', tags: ['Floating', 'Sticky', 'Continuous'], image: '/images/players/4.png' },
  { title: 'Fullscreen player', description: 'Immersive experience with fullscreen mode.', tags: ['Fullscreen', 'Immersive', 'HD'], image: '/images/players/5.png' },
  { title: 'Custom player', description: 'Colors, styles and features adjustable to your brand.', tags: ['Custom', 'Branding', 'Flexible'], image: '/images/players/6.png' },
]

export const PRO_FEATURES = [
  { icon: 'dashboard', title: 'Professional analytics', text: 'Listeners, sessions, devices, location and peak hours.' },
  { icon: 'mic', title: 'Live console', text: 'Transport, playlists, effects and voice-overs from the browser.' },
  { icon: 'calendar', title: 'Schedule and AutoDJ', text: 'Time-slot programming, automatic rotation and jingles.' },
  { icon: 'smartphone', title: 'Website and PWA', text: 'Client website, player and installable app.' },
  { icon: 'video', title: 'Radio + TV', text: 'Audio and video on the same platform, with HLS and VOD2Live.' },
  { icon: 'layers', title: 'Multi-station', text: 'Run several radios or channels from a single panel.' },
]
