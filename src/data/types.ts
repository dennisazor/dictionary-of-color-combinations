export interface ColorEntry {
  name: string;
  combinations: number[];
  swatch: number;
  cmyk: [number, number, number, number];
  lab: [number, number, number];
  rgb: [number, number, number];
  hex: string;
}

export interface Palette {
  id: number;
  colors: ColorEntry[];
}

/** Swatch chapter names from the book */
export const SWATCH_NAMES: Record<number, string> = {
  0: 'Reds & Pinks',
  1: 'Yellows & Browns',
  2: 'Greens',
  3: 'Blues',
  4: 'Purples & Violets',
  5: 'Neutrals',
};

export const SWATCH_COLORS: Record<number, string> = {
  0: '#cc1236',
  1: '#fcb315',
  2: '#00b49b',
  3: '#006eb8',
  4: '#4f4086',
  5: '#b6bfc1',
};
