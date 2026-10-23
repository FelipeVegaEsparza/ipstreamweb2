import { describe, expect, it } from 'vitest';
import * as contentEs from '../src/lib/content';
import { es } from '../src/lib/i18n/es';

const VOSEO = /(?<![\p{L}])(?:vos|activá|ajustás|armá|buscá|cargá|controlá|definís|dejá|dejás|dirigís|dispará|elegí|elegís|empezá|escribís|generá|hablá|medí|medís|operá|poné|programá|publicá|quedás|reordená|revisalos|publicalos|salí|seguí|seguís|seleccionás|sumá|transmití|usá|tenés|podés|querés|sabés|sos|hacés)(?![\p{L}])/iu;

function collectStrings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(collectStrings);
  if (value && typeof value === 'object') return Object.values(value).flatMap(collectStrings);
  return [];
}

describe('español neutral en el sitio público', () => {
  it('no usa voseo en el contenido público', () => {
    const copy = [...collectStrings(contentEs), ...Object.values(es)].join('\n');
    const match = copy.match(VOSEO);
    expect(match?.[0] ?? null, `voseo detectado: ${match?.[0] ?? ''}`).toBeNull();
  });
});
