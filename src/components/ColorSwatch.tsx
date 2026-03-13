import { useState } from 'react';
import type { ColorEntry } from '../data/types';
import { isLightColor } from '../utils/colorDistance';

interface Props {
  color: ColorEntry;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

export function ColorSwatch({ color, size = 'md', showDetails = true }: Props) {
  const [copied, setCopied] = useState(false);

  const sizeClasses = {
    sm: 'h-12',
    md: 'h-24',
    lg: 'h-36',
  };

  const textColor = isLightColor(color.hex) ? 'text-stone-900' : 'text-white';

  const handleCopyHex = async () => {
    try {
      await navigator.clipboard.writeText(color.hex);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // Clipboard API not available
    }
  };

  return (
    <div className="group flex-1 min-w-0">
      <button
        type="button"
        className={`w-full ${sizeClasses[size]} rounded-md cursor-pointer transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98] flex items-end justify-end p-2 border-0`}
        style={{ backgroundColor: color.hex }}
        onClick={handleCopyHex}
        title={`Copy ${color.hex}`}
      >
        <span className={`text-xs font-mono opacity-0 group-hover:opacity-70 transition-opacity ${textColor}`}>
          {copied ? '✓' : color.hex}
        </span>
      </button>
      {showDetails && (
        <div className="mt-2 px-0.5">
          <p className="text-xs font-medium text-stone-800 truncate" title={color.name}>
            {color.name}
          </p>
          <p className="text-[10px] text-stone-500 font-mono mt-0.5">
            {color.hex.toUpperCase()}
          </p>
          <p className="text-[10px] text-stone-400 font-mono">
            {color.rgb[0]}, {color.rgb[1]}, {color.rgb[2]}
          </p>
        </div>
      )}
    </div>
  );
}
