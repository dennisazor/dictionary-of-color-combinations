import rawColors from './colors.json';
import type { ColorEntry, Palette } from './types';

/** All 159 unique colors from the book */
export const colors: ColorEntry[] = rawColors as ColorEntry[];

/**
 * Derive all 348 palettes from the color data.
 * Each color lists which combination IDs it belongs to.
 * We invert this to get: combination ID → list of colors.
 */
function derivePalettes(): Palette[] {
  const map = new Map<number, number[]>();

  colors.forEach((color, index) => {
    color.combinations.forEach((comboId) => {
      const existing = map.get(comboId);
      if (existing) {
        existing.push(index);
      } else {
        map.set(comboId, [index]);
      }
    });
  });

  return Array.from(map.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([id, indices]) => ({
      id,
      colors: indices.map((i) => colors[i]),
    }));
}

/** All 348 palettes, sorted by combination ID (1–348) */
export const palettes: Palette[] = derivePalettes();

/**
 * Get the dominant swatch chapter for a palette.
 * Uses the most frequent swatch value among its colors.
 */
export function getPaletteSwatch(palette: Palette): number {
  const counts = new Map<number, number>();
  palette.colors.forEach((c) => {
    counts.set(c.swatch, (counts.get(c.swatch) ?? 0) + 1);
  });
  let maxCount = 0;
  let maxSwatch = 0;
  counts.forEach((count, swatch) => {
    if (count > maxCount) {
      maxCount = count;
      maxSwatch = swatch;
    }
  });
  return maxSwatch;
}

/** Group palettes by their dominant swatch chapter */
export function getPalettesByChapter(): Map<number, Palette[]> {
  const grouped = new Map<number, Palette[]>();
  for (let i = 0; i < 6; i++) grouped.set(i, []);

  palettes.forEach((p) => {
    const swatch = getPaletteSwatch(p);
    grouped.get(swatch)!.push(p);
  });

  return grouped;
}
