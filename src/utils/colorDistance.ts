import type { ColorEntry } from '../data/types';

/**
 * CIE76 color distance in L*a*b* space.
 * Perceptually uniform — equal numerical differences ≈ equal perceived differences.
 * ΔE < 2.3 is considered "just noticeable difference" (JND).
 */
export function deltaE76(lab1: [number, number, number], lab2: [number, number, number]): number {
  const dL = lab1[0] - lab2[0];
  const da = lab1[1] - lab2[1];
  const db = lab1[2] - lab2[2];
  return Math.sqrt(dL * dL + da * da + db * db);
}

/**
 * Convert sRGB (0–255) to L*a*b* (D50 illuminant).
 * sRGB → linear RGB → XYZ (D65) → adapt to D50 → L*a*b*
 */
export function rgbToLab(r: number, g: number, b: number): [number, number, number] {
  // sRGB to linear
  let lr = r / 255;
  let lg = g / 255;
  let lb = b / 255;

  lr = lr > 0.04045 ? Math.pow((lr + 0.055) / 1.055, 2.4) : lr / 12.92;
  lg = lg > 0.04045 ? Math.pow((lg + 0.055) / 1.055, 2.4) : lg / 12.92;
  lb = lb > 0.04045 ? Math.pow((lb + 0.055) / 1.055, 2.4) : lb / 12.92;

  // Linear RGB to XYZ (D65)
  let x = lr * 0.4124564 + lg * 0.3575761 + lb * 0.1804375;
  let y = lr * 0.2126729 + lg * 0.7151522 + lb * 0.0721750;
  let z = lr * 0.0193339 + lg * 0.1191920 + lb * 0.9503041;

  // Chromatic adaptation D65 → D50 (Bradford)
  const xD50 = x * 1.0478112 + y * 0.0228866 + z * -0.0501270;
  const yD50 = x * 0.0295424 + y * 0.9904844 + z * -0.0170491;
  const zD50 = x * -0.0092345 + y * 0.0150436 + z * 0.7521316;

  // D50 reference white
  const xn = 0.96422;
  const yn = 1.00000;
  const zn = 0.82521;

  x = xD50 / xn;
  y = yD50 / yn;
  z = zD50 / zn;

  const epsilon = 0.008856;
  const kappa = 903.3;

  const fx = x > epsilon ? Math.cbrt(x) : (kappa * x + 16) / 116;
  const fy = y > epsilon ? Math.cbrt(y) : (kappa * y + 16) / 116;
  const fz = z > epsilon ? Math.cbrt(z) : (kappa * z + 16) / 116;

  const L = 116 * fy - 16;
  const a = 500 * (fx - fy);
  const bVal = 200 * (fy - fz);

  return [L, a, bVal];
}

/**
 * Find the N closest colors from the dataset to a given L*a*b* value.
 */
export function findClosestColors(
  targetLab: [number, number, number],
  allColors: ColorEntry[],
  count: number = 5
): { color: ColorEntry; distance: number }[] {
  return allColors
    .map((color) => ({
      color,
      distance: deltaE76(targetLab, color.lab),
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, count);
}

/**
 * Determine if a color is "light" (for choosing text contrast).
 * Uses relative luminance formula from WCAG.
 */
export function isLightColor(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  // Relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55;
}
