import { useState, useRef, useCallback, useEffect } from 'react';
import { colors, palettes } from '../data/palettes';
import type { ColorEntry, Palette } from '../data/types';
import { findClosestColors, rgbToLab } from '../utils/colorDistance';
import { extractColorsFromImage, getPixelColor } from '../utils/imageColors';
import { PaletteCard } from './PaletteCard';

type PickerMode = 'manual' | 'camera' | 'upload';

interface MatchResult {
  pickedRgb: [number, number, number];
  closestColors: { color: ColorEntry; distance: number }[];
  matchingPalettes: Palette[];
}

export function ColorPicker() {
  const [mode, setMode] = useState<PickerMode>('manual');
  const [manualColor, setManualColor] = useState('#cc1236');
  const [results, setResults] = useState<MatchResult | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [canvasHasImage, setCanvasHasImage] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const findMatches = useCallback((rgb: [number, number, number]): MatchResult => {
    const lab = rgbToLab(rgb[0], rgb[1], rgb[2]);
    const closest = findClosestColors(lab, colors, 6);

    // Find palettes containing any of the top 3 closest colors
    const topColorHexes = new Set(closest.slice(0, 3).map((c) => c.color.hex));
    const matchingPalettes = palettes.filter((p) =>
      p.colors.some((c) => topColorHexes.has(c.hex))
    );

    return {
      pickedRgb: rgb,
      closestColors: closest,
      matchingPalettes: matchingPalettes.slice(0, 12),
    };
  }, []);

  // Manual color input
  const handleManualSubmit = () => {
    const hex = manualColor.replace('#', '');
    if (!/^[0-9a-f]{6}$/i.test(hex)) return;
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    setResults(findMatches([r, g, b]));
  };

  // EyeDropper API (Chromium only)
  const handleEyeDropper = async () => {
    if (!('EyeDropper' in window)) return;
    try {
      // @ts-expect-error EyeDropper is not in all TS lib typings
      const dropper = new window.EyeDropper();
      const result = await dropper.open();
      const hex = result.sRGBHex.replace('#', '');
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      setManualColor(result.sRGBHex);
      setResults(findMatches([r, g, b]));
    } catch {
      // User cancelled
    }
  };

  // Camera
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err) {
      setCameraError('Camera access denied or not available.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const captureFromCamera = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    processCanvasImage(canvas);
  };

  // Image upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;

    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      processCanvasImage(canvas);
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);
  };

  // Click on canvas to pick a specific pixel
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);
    const rgb = getPixelColor(canvas, x, y);
    if (rgb) {
      setResults(findMatches(rgb));
    }
  };

  const processCanvasImage = (canvas: HTMLCanvasElement) => {
    const dominantColors = extractColorsFromImage(canvas, 5);
    if (dominantColors.length > 0) {
      setCanvasHasImage(true);
      setResults(findMatches(dominantColors[0]));
    }
  };

  const hasEyeDropper = typeof window !== 'undefined' && 'EyeDropper' in window;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-serif font-semibold text-stone-800 mb-2">
          Color Picker
        </h2>
        <p className="text-sm text-stone-500">
          Pick a color, snap a photo, or upload an image to find matching palettes
        </p>
      </div>

      {/* Mode tabs */}
      <div className="flex justify-center gap-2 mb-8">
        {(['manual', 'camera', 'upload'] as const).map((m) => (
          <button
            key={m}
            type="button"
            className={`nav-tab ${mode === m ? 'nav-tab-active' : 'nav-tab-inactive'}`}
            onClick={() => {
              setMode(m);
              if (m !== 'camera') stopCamera();
            }}
          >
            {m === 'manual' && '🎨 Pick Color'}
            {m === 'camera' && '📷 Camera'}
            {m === 'upload' && '📁 Upload'}
          </button>
        ))}
      </div>

      {/* Mode content */}
      <div className="mb-8">
        {mode === 'manual' && (
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={manualColor}
                onChange={(e) => setManualColor(e.target.value)}
                className="w-16 h-16 rounded-lg cursor-pointer border-2 border-stone-200"
              />
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={manualColor}
                    onChange={(e) => setManualColor(e.target.value)}
                    className="px-3 py-2 border border-stone-300 rounded-lg text-sm font-mono w-28 focus:outline-none focus:ring-2 focus:ring-stone-400"
                    placeholder="#000000"
                    maxLength={7}
                  />
                  <button
                    type="button"
                    className="px-4 py-2 bg-stone-900 text-white text-sm font-medium rounded-lg hover:bg-stone-800 transition-colors"
                    onClick={handleManualSubmit}
                  >
                    Find Match
                  </button>
                </div>
                {hasEyeDropper && (
                  <button
                    type="button"
                    className="text-xs text-stone-500 hover:text-stone-700 transition-colors text-left"
                    onClick={handleEyeDropper}
                  >
                    💉 Pick from screen (EyeDropper)
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {mode === 'camera' && (
          <div className="flex flex-col items-center gap-4">
            {!cameraActive ? (
              <div className="text-center">
                <button
                  type="button"
                  className="px-6 py-3 bg-stone-900 text-white text-sm font-medium rounded-lg hover:bg-stone-800 transition-colors"
                  onClick={startCamera}
                >
                  Start Camera
                </button>
                {cameraError && (
                  <p className="text-red-500 text-sm mt-2">{cameraError}</p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <video
                  ref={videoRef}
                  className="rounded-lg max-w-full shadow-md"
                  style={{ maxHeight: 400 }}
                  playsInline
                  muted
                />
                <div className="flex gap-2 justify-center">
                  <button
                    type="button"
                    className="px-4 py-2 bg-stone-900 text-white text-sm font-medium rounded-lg hover:bg-stone-800 transition-colors"
                    onClick={captureFromCamera}
                  >
                    📸 Capture & Analyze
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 bg-stone-200 text-stone-700 text-sm font-medium rounded-lg hover:bg-stone-300 transition-colors"
                    onClick={stopCamera}
                  >
                    Stop Camera
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {mode === 'upload' && (
          <div className="flex flex-col items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              className="px-6 py-8 border-2 border-dashed border-stone-300 rounded-xl text-stone-500 hover:border-stone-400 hover:text-stone-600 transition-colors cursor-pointer w-full max-w-md"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="text-3xl mb-2">📁</div>
              <div className="text-sm font-medium">Click to upload an image</div>
              <div className="text-xs text-stone-400 mt-1">JPG, PNG, WebP</div>
            </button>
          </div>
        )}
      </div>

      {/* Hidden canvas for processing */}
      <canvas
        ref={canvasRef}
        className={`rounded-lg max-w-full mx-auto shadow-md cursor-crosshair ${
          mode !== 'manual' && canvasHasImage ? 'block mb-4' : 'hidden'
        }`}
        style={{ maxHeight: 400 }}
        onClick={handleCanvasClick}
      />

      {/* Results */}
      {results && (
        <div className="space-y-8">
          {/* Picked color */}
          <div className="text-center">
            <p className="text-xs text-stone-400 uppercase tracking-wider mb-3">Your color</p>
            <div className="inline-flex items-center gap-4 bg-white rounded-xl px-5 py-3 shadow-sm border border-stone-200">
              <div
                className="w-12 h-12 rounded-lg border border-black/10"
                style={{
                  backgroundColor: `rgb(${results.pickedRgb[0]}, ${results.pickedRgb[1]}, ${results.pickedRgb[2]})`,
                }}
              />
              <div className="text-left">
                <p className="text-sm font-mono text-stone-800">
                  rgb({results.pickedRgb[0]}, {results.pickedRgb[1]}, {results.pickedRgb[2]})
                </p>
                <p className="text-xs text-stone-400 font-mono">
                  #{results.pickedRgb.map((v) => v.toString(16).padStart(2, '0')).join('')}
                </p>
              </div>
            </div>
          </div>

          {/* Closest colors */}
          <div>
            <p className="text-xs text-stone-400 uppercase tracking-wider mb-3">
              Closest colors from the book
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              {results.closestColors.map(({ color, distance }, i) => (
                <div
                  key={`match-${i}`}
                  className="bg-white rounded-lg p-3 shadow-sm border border-stone-200 flex items-center gap-3 min-w-[200px]"
                >
                  <div
                    className="w-10 h-10 rounded-md border border-black/10 shrink-0"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div>
                    <p className="text-sm font-medium text-stone-800">{color.name}</p>
                    <p className="text-xs font-mono text-stone-500">{color.hex}</p>
                    <p className="text-[10px] text-stone-400">ΔE {distance.toFixed(1)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Matching palettes */}
          {results.matchingPalettes.length > 0 && (
            <div>
              <p className="text-xs text-stone-400 uppercase tracking-wider mb-3">
                Palettes containing these colors ({results.matchingPalettes.length})
              </p>
              <div className="space-y-4">
                {results.matchingPalettes.map((p) => (
                  <PaletteCard key={p.id} palette={p} size="md" />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
