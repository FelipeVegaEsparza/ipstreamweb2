import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';

const WIDTHS = [400, 800, 1200];
const sourceDir = resolve('src/assets/players');
const outputDir = resolve(sourceDir, 'generated');

await mkdir(outputDir, { recursive: true });

for (const id of [1, 2, 3, 4, 5, 6]) {
  for (const width of WIDTHS) {
    await sharp(resolve(sourceDir, `${id}.png`))
      .resize({ width })
      .webp({ quality: 82 })
      .toFile(resolve(outputDir, `${id}-${width}.webp`));
  }
}

console.log(`WebP de reproductores generados en ${outputDir}`);
