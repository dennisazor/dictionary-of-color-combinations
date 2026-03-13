import { useState } from 'react';
import type { Palette } from '../data/types';
import { SWATCH_NAMES } from '../data/types';
import { getPaletteSwatch } from '../data/palettes';
import { isLightColor } from '../utils/colorDistance';
import { CopyButton } from './CopyButton';

interface Props {
  palette: Palette;
  size?: 'sm' | 'md' | 'lg';
}

export function PaletteCard({ palette, size = 'lg' }: Props) {
  const chapter = getPaletteSwatch(palette);
  const count = palette.colors.length;
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleCopy = async (hex: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(hex);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 1200);
    } catch { /* noop */ }
  };

  const heights = {
    sm: 'h-20',
    md: 'h-32',
    lg: 'h-44 sm:h-56',
  };
  const swatchHeight = heights[size];

  // Book-style layout: 2 colors = 2 tall columns, 3 = 3 columns, 4 = 2×2 grid
  const renderSwatches = () => {
    if (count === 4) {
      // 2×2 grid like the book
      return (
        <div className="grid grid-cols-2">
          {palette.colors.map((color, i) => (
            <button
              key={`${palette.id}-${i}`}
              type="button"
              className={`${swatchHeight} cursor-pointer transition-opacity relative group border-0`}
              style={{ backgroundColor: color.hex }}
              onClick={() => handleCopy(color.hex, i)}
              title={`${color.name} — ${color.hex}`}
            >
              <span className={`absolute bottom-2 right-2 text-[10px] font-mono opacity-0 group-hover:opacity-80 transition-opacity ${isLightColor(color.hex) ? 'text-stone-900/70' : 'text-white/70'}`}>
                {copiedIdx === i ? '✓ copied' : color.hex}
              </span>
            </button>
          ))}
        </div>
      );
    }

    // 2 or 3 colors: tall columns side by side
    return (
      <div className="flex">
        {palette.colors.map((color, i) => (
          <button
            key={`${palette.id}-${i}`}
            type="button"
            className={`flex-1 ${swatchHeight} cursor-pointer transition-opacity relative group border-0`}
            style={{ backgroundColor: color.hex }}
            onClick={() => handleCopy(color.hex, i)}
            title={`${color.name} — ${color.hex}`}
          >
            <span className={`absolute bottom-2 right-2 text-[10px] font-mono opacity-0 group-hover:opacity-80 transition-opacity ${isLightColor(color.hex) ? 'text-stone-900/70' : 'text-white/70'}`}>
              {copiedIdx === i ? '✓ copied' : color.hex}
            </span>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="palette-card">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-stone-100">
        <div className="flex items-center gap-3">
          <span className="text-lg font-serif font-semibold text-stone-800">
            No. {palette.id}
          </span>
          <span className="text-xs text-stone-400 font-sans">
            {count} colors
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-stone-400 uppercase tracking-wider hidden sm:inline">
            {SWATCH_NAMES[chapter]}
          </span>
          <CopyButton palette={palette} />
        </div>
      </div>

      {/* Color swatches — book layout */}
      {renderSwatches()}

      {/* Color details row */}
      <div className="px-4 py-3">
        <div className={count === 4 ? 'grid grid-cols-2 gap-x-4 gap-y-2' : 'flex gap-3'}>
          {palette.colors.map((color, i) => (
            <div key={`info-${palette.id}-${i}`} className="flex items-center gap-2 min-w-0 flex-1">
              <span
                className="w-3 h-3 rounded-sm shrink-0 border border-black/10"
                style={{ backgroundColor: color.hex }}
              />
              <div className="min-w-0">
                <p className="text-xs font-medium text-stone-700 truncate leading-tight" title={color.name}>
                  {color.name}
                </p>
                <p className="text-[10px] text-stone-400 font-mono leading-tight">
                  {color.hex.toUpperCase()} · C{color.cmyk[0]} M{color.cmyk[1]} Y{color.cmyk[2]} K{color.cmyk[3]}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
