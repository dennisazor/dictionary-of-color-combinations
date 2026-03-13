import { useState, useCallback } from 'react';
import { palettes } from '../data/palettes';
import { PaletteCard } from './PaletteCard';
import { colors } from '../data/palettes';
import type { Palette, ColorEntry } from '../data/types';

export function Randomizer() {
  const [current, setCurrent] = useState<Palette>(() =>
    palettes[Math.floor(Math.random() * palettes.length)]
  );
  const [lockedColor, setLockedColor] = useState<ColorEntry | null>(null);
  const [colorCount, setColorCount] = useState<2 | 3 | 4 | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [history, setHistory] = useState<Palette[]>([]);

  const getFilteredPalettes = useCallback(() => {
    let pool = palettes;
    if (colorCount) {
      pool = pool.filter((p) => p.colors.length === colorCount);
    }
    if (lockedColor) {
      pool = pool.filter((p) =>
        p.colors.some((c) => c.hex === lockedColor.hex)
      );
    }
    return pool;
  }, [lockedColor, colorCount]);

  const randomize = useCallback(() => {
    const pool = getFilteredPalettes();
    if (pool.length === 0) return;

    // If only one palette in pool and it's already showing, nothing to do
    if (pool.length === 1 && pool[0].id === current.id) return;

    setIsAnimating(true);
    setHistory((prev) => [...prev.slice(-19), current]); // Keep last 20

    let next: Palette;
    if (pool.length === 1) {
      next = pool[0];
    } else {
      do {
        next = pool[Math.floor(Math.random() * pool.length)];
      } while (next.id === current.id);
    }

    setCurrent(next);
    setTimeout(() => setIsAnimating(false), 300);
  }, [current, getFilteredPalettes]);

  const goBack = useCallback(() => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setCurrent(prev);
  }, [history]);

  const filteredCount = getFilteredPalettes().length;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-serif font-semibold text-stone-800 mb-2">
          Palette Randomizer
        </h2>
        <p className="text-sm text-stone-500">
          Discover curated color combinations from the book
        </p>
      </div>

      {/* Current palette */}
      <div
        className={`transition-all duration-300 ${
          isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
      >
        <PaletteCard palette={current} size="lg" />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 mt-6">
        <button
          type="button"
          className="px-3 py-2 rounded-lg text-sm font-medium text-stone-500 hover:bg-stone-200 transition-colors disabled:opacity-30"
          onClick={goBack}
          disabled={history.length === 0}
          title="Previous"
        >
          ← Back
        </button>
        <button
          type="button"
          className="px-6 py-3 rounded-xl bg-stone-900 text-white text-sm font-semibold hover:bg-stone-800 active:scale-95 transition-all shadow-sm"
          onClick={randomize}
        >
          Randomize ⟳
        </button>
        <span className="text-xs text-stone-400 ml-2">
          {filteredCount} of {palettes.length}
        </span>
      </div>

      {/* Color count filter */}
      <div className="flex items-center justify-center gap-2 mt-5">
        <span className="text-xs text-stone-400 mr-1">Colors:</span>
        {([null, 2, 3, 4] as const).map((n) => (
          <button
            key={`count-${n}`}
            type="button"
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              colorCount === n
                ? 'border-stone-900 bg-stone-900 text-white'
                : 'border-stone-200 bg-white text-stone-500 hover:border-stone-300'
            }`}
            onClick={() => setColorCount(n)}
          >
            {n === null ? 'All' : n}
          </button>
        ))}
      </div>

      {/* Lock a color */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-stone-500 font-medium uppercase tracking-wider">
            Lock a color to filter
          </p>
          {lockedColor && (
            <button
              type="button"
              className="text-xs text-stone-400 hover:text-stone-600 transition-colors"
              onClick={() => setLockedColor(null)}
            >
              Clear lock
            </button>
          )}
        </div>

        {/* Current palette colors as lockable buttons */}
        <div className="flex gap-2 flex-wrap">
          {current.colors.map((color, i) => {
            const isLocked = lockedColor?.hex === color.hex;
            return (
              <button
                key={`lock-${i}`}
                type="button"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                  isLocked
                    ? 'border-stone-900 bg-stone-900 text-white shadow-md scale-105'
                    : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:shadow-sm'
                }`}
                onClick={() => setLockedColor(isLocked ? null : color)}
              >
                <span
                  className="w-4 h-4 rounded-full border border-black/10"
                  style={{ backgroundColor: color.hex }}
                />
                {color.name}
                {isLocked && ' 🔒'}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick browse: all colors as small circles */}
      <div className="mt-10">
        <p className="text-xs text-stone-500 font-medium uppercase tracking-wider mb-3">
          All 159 colors — click to lock & filter
        </p>
        <div className="flex flex-wrap gap-2">
          {colors.map((color, i) => {
            const isLocked = lockedColor?.hex === color.hex;
            return (
              <button
                key={`all-${i}`}
                type="button"
                className={`w-8 h-8 sm:w-7 sm:h-7 rounded-full border-2 transition-all hover:scale-125 ${
                  isLocked ? 'border-stone-900 scale-125 ring-2 ring-stone-900/30' : 'border-transparent'
                }`}
                style={{ backgroundColor: color.hex }}
                onClick={() => setLockedColor(isLocked ? null : color)}
                title={`${color.name} (${color.hex}) — ${color.combinations.length} combos`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
