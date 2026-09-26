import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const srcDir = resolve(here, '../src');

const bannedFonts = ['Inter', 'Poppins', 'Outfit', 'Space Grotesk'];

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const styleAndMarkup = walk(srcDir).filter((file) => /\.(css|astro|ts)$/.test(file));

describe('sistema de diseno', () => {
  it.each(bannedFonts)('no usa la tipografia prohibida %s', (font) => {
    const offenders = styleAndMarkup.filter((file) => {
      const content = readFileSync(file, 'utf8');
      return new RegExp(`font-family[^;]*['"]?${font}`, 'i').test(content);
    });
    expect(offenders, `Uso de ${font} encontrado en: ${offenders.join(', ')}`).toEqual([]);
  });

  it('define los tres roles tipograficos como tokens', () => {
    const tokens = readFileSync(resolve(srcDir, 'styles/tokens.css'), 'utf8');
    expect(tokens).toMatch(/--font-display:/);
    expect(tokens).toMatch(/--font-text:/);
    expect(tokens).toMatch(/--font-mono:\s*'IBM Plex Mono'/);
  });
});
