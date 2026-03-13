import type { Palette } from '../data/types';

type CopyFormat = 'hex' | 'rgb' | 'css';

export function formatPaletteForCopy(palette: Palette, format: CopyFormat): string {
  switch (format) {
    case 'hex':
      return palette.colors.map((c) => c.hex).join(', ');
    case 'rgb':
      return palette.colors
        .map((c) => `rgb(${c.rgb[0]}, ${c.rgb[1]}, ${c.rgb[2]})`)
        .join('\n');
    case 'css':
      return palette.colors
        .map((c, i) => `--color-${i + 1}: ${c.hex};`)
        .join('\n');
  }
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
