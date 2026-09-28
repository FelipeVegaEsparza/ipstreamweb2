import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const css = readFileSync(resolve(here, '../src/styles/tokens.css'), 'utf8');

function token(name: string): string {
  const match = css.match(new RegExp(`--${name}\\s*:\\s*(#[0-9a-fA-F]{6})`));
  if (!match) throw new Error(`Token --${name} no encontrado en tokens.css`);
  return match[1];
}

function channel(value: number): number {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const value = hex.replace('#', '');
  const r = channel(parseInt(value.slice(0, 2), 16));
  const g = channel(parseInt(value.slice(2, 4), 16));
  const b = channel(parseInt(value.slice(4, 6), 16));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  const [light, dark] = la >= lb ? [la, lb] : [lb, la];
  return (light + 0.05) / (dark + 0.05);
}

const pairs: Array<[string, string]> = [
  ['text', 'ink'],
  ['text', 'panel'],
  ['steel', 'panel'],
  ['signal', 'ink'],
  ['signal-strong', 'ink'],
  ['signal', 'paper'],
  ['ink-text', 'paper'],
  ['muted-on-paper', 'paper'],
  ['danger', 'ink'],
  ['ok', 'ink'],
];

describe('contraste de tokens (WCAG AA)', () => {
  it.each(pairs)('%s sobre %s alcanza 4.5:1', (fg, bg) => {
    const ratio = contrast(token(fg), token(bg));
    expect(ratio, `${fg} sobre ${bg} = ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5);
  });
});

describe('gradiente de señal', () => {
  it('define el gradiente unico cyan->azul', () => {
    expect(css).toMatch(/--signal-gradient:\s*linear-gradient\(90deg,\s*var\(--signal-strong\),\s*var\(--blue\)\)/);
  });
});
