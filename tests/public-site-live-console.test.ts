import { describe, expect, it } from 'vitest';
import { STUDIO_FEATURES as STUDIO_ES } from '../src/lib/content';
import { STUDIO_FEATURES as STUDIO_EN } from '../src/lib/content.en';
import { es } from '../src/lib/i18n/es';
import { en } from '../src/lib/i18n/en';

const SECTION_KEYS = [
  'home.studio.eyebrow',
  'home.studio.title',
  'home.studio.description',
  'home.studio.alt',
  'home.studio.live',
  'home.studio.bitrate',
  'home.studio.effects',
  'home.studio.aiVoice',
  'features.studio.eyebrow',
  'features.studio.title',
  'features.studio.description',
  'features.metaDescription',
] as const;

const LEGACY_PHRASES = [
  'Tu transmisor de audio profesional',
  'Your professional audio transmitter',
  'software de transmisión',
  'broadcast software',
  'enlazas CasterFly Studio',
  'enlaza CasterFly Studio',
  'professional audio transmitter',
];

describe('consola en vivo en el sitio público', () => {
  it('mantiene la misma cantidad de features en español e inglés', () => {
    expect(STUDIO_ES.length).toBeGreaterThan(0);
    expect(STUDIO_EN.length).toBe(STUDIO_ES.length);
    expect(STUDIO_EN.map((feature) => feature.code)).toEqual(STUDIO_ES.map((feature) => feature.code));
  });

  it('conserva el eyebrow de marca en el inicio', () => {
    expect(es['home.studio.eyebrow']).toBe('[ 03 / CASTERFLY STUDIO ]');
    expect(en['home.studio.eyebrow']).toBe('[ 03 / CASTERFLY STUDIO ]');
  });

  it('define todas las claves de la sección en ambos idiomas', () => {
    for (const key of SECTION_KEYS) {
      expect(es[key], `falta ${key} en español`).toBeTruthy();
      expect(en[key], `falta ${key} en inglés`).toBeTruthy();
    }
  });

  it('no conserva el mensaje del transmisor de escritorio', () => {
    const publicCopy = [
      ...Object.values(es),
      ...Object.values(en),
      ...STUDIO_ES.flatMap((feature) => [feature.title, feature.description, ...feature.points]),
      ...STUDIO_EN.flatMap((feature) => [feature.title, feature.description, ...feature.points]),
    ].join('\n');

    for (const phrase of LEGACY_PHRASES) {
      expect(publicCopy.toLowerCase()).not.toContain(phrase.toLowerCase());
    }
  });
});
