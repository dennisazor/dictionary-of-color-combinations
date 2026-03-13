# Claude Session Notes

## Project: A Dictionary of Color Combinations — Web App

### Key Decisions
1. **Do NOT parse the PDF** — The compressed PDF scan is unreliable for color extraction. Use the verified mattdesl JSON dataset instead. This dataset has proper ICC profile CMYK→RGB conversions and has been community-verified for 6+ years.
2. **Embed data, don't fetch** — 159 colors (~30KB) is trivially small. Embedding avoids network dependency and CORS issues.
3. **L*a*b* for color matching** — The dataset includes L*a*b* values. Use CIE76 (Euclidean in L*a*b*) for perceptual color distance. Do NOT use RGB euclidean distance — it's perceptually non-uniform.
4. **EyeDropper API** — Use with fallback. Only supported in Chromium browsers. Canvas-based picker as fallback.
5. **Static site** — No backend needed. Vite builds to static files.

### Data Structure
- 159 colors, each with: name, hex, rgb[3], cmyk[4], lab[3], swatch(0-5), combinations[number[]]
- 348 combinations (numbered 1-348), each containing 2-4 color indices
- Palettes derived by grouping colors by their combination membership

### Implementation Order
1. ✅ Project docs created
2. ✅ Scaffold Vite + React + TypeScript + Tailwind
3. ✅ Embed color data + build palette derivation
4. ✅ Book View — the primary scrollable page-by-page experience
5. ✅ Randomizer with clipboard copy
6. ✅ Color Picker + Camera with L*a*b* nearest-neighbor search
7. ✅ Build succeeds — 0 TS errors, 77KB gzipped

### Architecture
```
src/
  data/
    colors.ts          — Raw color dataset + types
    palettes.ts        — Derived palette structures
  components/
    BookView.tsx       — Page-by-page scroll view
    PaletteCard.tsx    — Single combination card
    ColorSwatch.tsx    — Individual color display
    Randomizer.tsx     — Random palette picker
    ColorPicker.tsx    — Camera/upload/picker
    Navigation.tsx     — Chapter nav + mode switching
  utils/
    colorDistance.ts   — CIE76 L*a*b* distance
    colorConvert.ts    — RGB↔L*a*b* conversion (for picked colors)
    clipboard.ts       — Copy palette to clipboard
    camera.ts          — Camera stream management
  App.tsx
  main.tsx
```
