import { useState } from 'react';
import type { Palette } from '../data/types';
import { formatPaletteForCopy, copyToClipboard } from '../utils/clipboard';

interface Props {
  palette: Palette;
}

export function CopyButton({ palette }: Props) {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = async (format: 'hex' | 'rgb' | 'css') => {
    const text = formatPaletteForCopy(palette, format);
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(format);
      setTimeout(() => {
        setCopied(null);
        setShowMenu(false);
      }, 1000);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        className="p-1.5 rounded-md text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
        onClick={() => setShowMenu(!showMenu)}
        title="Copy palette"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </button>

      {showMenu && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
          <div className="absolute right-0 top-full mt-1 z-20 bg-white rounded-lg shadow-lg border border-stone-200 py-1 min-w-[120px]">
            {(['hex', 'rgb', 'css'] as const).map((format) => (
              <button
                key={format}
                type="button"
                className="w-full text-left px-3 py-1.5 text-xs font-mono text-stone-600 hover:bg-stone-50 transition-colors"
                onClick={() => handleCopy(format)}
              >
                {copied === format ? '✓ Copied!' : format.toUpperCase()}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
