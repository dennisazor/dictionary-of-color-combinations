import { useState, useRef, useCallback, useEffect } from 'react';
import { getPalettesByChapter, palettes } from '../data/palettes';
import { SWATCH_NAMES, SWATCH_COLORS } from '../data/types';
import { PaletteCard } from './PaletteCard';

const chapterPalettes = getPalettesByChapter();

export function BookView() {
  const [activeChapter, setActiveChapter] = useState<number | null>(null);
  const chapterRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);

  const setChapterRef = useCallback((chapter: number) => (el: HTMLDivElement | null) => {
    if (el) {
      chapterRefs.current.set(chapter, el);
    }
  }, []);

  // Track which chapter is currently in view
  // Use a small delay to ensure refs are populated after first render
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const chapter = Number(entry.target.getAttribute('data-chapter'));
            if (!isNaN(chapter)) setActiveChapter(chapter);
          }
        });
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );
    observerRef.current = observer;

    // Defer observation to next frame so refs are populated
    const frameId = requestAnimationFrame(() => {
      chapterRefs.current.forEach((el) => {
        observer.observe(el);
      });
    });

    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, []);

  const scrollToChapter = (chapter: number) => {
    const el = chapterRefs.current.get(chapter);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const totalPalettes = palettes.length;

  return (
    <div className="flex flex-col h-full">
      {/* Chapter navigation strip */}
      <div className="sticky top-0 z-30 bg-stone-50/95 backdrop-blur-sm border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-4 py-2 flex items-center gap-2 overflow-x-auto">
          <span className="text-xs text-stone-400 font-sans mr-1 shrink-0">Chapters:</span>
          {[0, 1, 2, 3, 4, 5].map((ch) => (
            <button
              key={ch}
              type="button"
              className="chapter-pill shrink-0 flex items-center gap-1.5"
              style={{
                backgroundColor: activeChapter === ch ? SWATCH_COLORS[ch] + '20' : undefined,
                color: activeChapter === ch ? SWATCH_COLORS[ch] : undefined,
                borderWidth: 1,
                borderColor: activeChapter === ch ? SWATCH_COLORS[ch] + '40' : '#e7e5e4',
              }}
              onClick={() => scrollToChapter(ch)}
            >
              <span
                className="w-2.5 h-2.5 rounded-full inline-block"
                style={{ backgroundColor: SWATCH_COLORS[ch] }}
              />
              {SWATCH_NAMES[ch]}
            </button>
          ))}
          <span className="text-xs text-stone-400 ml-auto shrink-0">
            {totalPalettes} palettes
          </span>
        </div>
      </div>

      {/* Palettes grid, grouped by chapter */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-3 sm:px-4 py-4 sm:py-6">
        {[0, 1, 2, 3, 4, 5].map((chapter) => {
          const cp = chapterPalettes.get(chapter) ?? [];
          if (cp.length === 0) return null;

          return (
            <div
              key={chapter}
              ref={setChapterRef(chapter)}
              data-chapter={chapter}
              className="mb-12"
            >
              {/* Chapter header */}
              <div className="flex items-center gap-3 mb-6 pb-3 border-b border-stone-200">
                <span
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: SWATCH_COLORS[chapter] }}
                />
                <h2 className="text-xl font-serif font-semibold text-stone-800">
                  {SWATCH_NAMES[chapter]}
                </h2>
                <span className="text-sm text-stone-400">
                  {cp.length} combinations
                </span>
              </div>

              {/* Palette cards */}
              <div className="grid gap-4 sm:gap-6 md:grid-cols-1 lg:grid-cols-1">
                {cp.map((palette) => (
                  <PaletteCard key={palette.id} palette={palette} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
