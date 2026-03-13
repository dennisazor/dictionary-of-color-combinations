# A Dictionary of Color Combinations

A web app that digitally recreates Sanzo Wada's *A Dictionary of Color Combinations* (1933) — **348 curated color palettes** composed from **159 unique colors**, browsable page-by-page just like the original book.

### **[🔗 Live Demo → dennisazor.github.io/dictionary-of-color-combinations](https://dennisazor.github.io/dictionary-of-color-combinations/)**

![React](https://img.shields.io/badge/React_18-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)

---

## What Is This?

Sanzo Wada (1883–1967) was a Japanese artist and teacher who spent decades studying color theory. His book *A Dictionary of Colour Combinations* catalogs 348 carefully selected color palettes — combinations of 2, 3, or 4 colors drawn from a set of 159 named colors. The palettes are organized into 6 chapters by color family.

This app brings that book to the web, making it easy to browse, discover, and use these timeless palettes in your own design work.

## Features

### 🎲 Randomizer (Default View)
- Hit **Randomize** to discover palettes at random
- **Lock a color** to filter — only palettes containing that color will appear
- Browse all **159 colors** as clickable dots to lock & filter
- **Back** button to revisit previous palettes
- **Copy** palette values (hex, RGB, or CSS custom properties) to clipboard

### 🎨 Color Picker
Pick any color and find the closest matches from Wada's 159-color palette:

- **Manual** — Use the color wheel or type a hex code, then hit "Find Match"
- **Camera** — Snap a photo from your device camera → extracts dominant colors → finds closest book matches
- **Upload** — Drop in any image for the same analysis
- **EyeDropper** — Native screen color picker (Chromium browsers)

Color matching uses **CIE76 distance in L\*a\*b\* color space** for perceptual accuracy. Each match shows its ΔE (delta-E) score — lower = closer match. ΔE < 2.3 is considered a "just noticeable difference."

### 📖 Book View
Scroll through all 348 palettes in order, grouped by the book's 6 swatch chapters:

| Chapter | Colors |
|---------|--------|
| 🔴 Reds & Pinks | Hermosa Pink → Pansy Purple |
| 🟡 Yellows & Browns | Sulpher Yellow → Vandyke Brown |
| 🟢 Greens | Turquoise Green → Deep Slate Olive |
| 🔵 Blues | Nile Blue → Deep Indigo |
| 🟣 Purples & Violets | Grayish Lavender → Cotinga Purple |
| ⚪ Neutrals | White → Black |

- Sticky chapter navigation bar for quick jumping
- **Click any swatch** to copy its hex code
- Each palette shows: combination number, color names, hex, RGB, and CMYK values
- **4-color palettes** render in a **2×2 grid** matching the book's layout
- **2–3 color palettes** render as tall vertical blocks side by side

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) 18+ installed

### Run Locally

**Windows — Double-click:**
```
start.bat
```

**Or manually:**
```bash
npm install
npm run dev
```

Then open **http://localhost:5173** in your browser.

### Build for Production
```bash
npm run build
npm run preview
```

Output goes to `dist/` — fully static, deploy anywhere.

## Tech Stack

| Tool | Purpose |
|------|---------|
| React 18 | UI framework |
| TypeScript | Type safety |
| Vite | Build tool & dev server |
| Tailwind CSS 3 | Utility-first styling |

**No backend.** The entire app is static — all 159 colors are embedded as JSON (~30KB). No API calls needed.

## Color Data

The color dataset comes from [mattdesl/dictionary-of-colour-combinations](https://github.com/mattdesl/dictionary-of-colour-combinations), originally compiled by Dain M. Blodorn Kim ([@dblodorn](https://github.com/dblodorn/sanzo-wada)).

CMYK → RGB conversion uses professional ICC color profiles:
- **CMYK**: U.S. Web Coated (SWOP) v2
- **RGB**: sRGB IEC61966-2.1
- **Method**: Relative Colorimetric with Black Point Compensation

Each color includes: name, hex, RGB, CMYK, L\*a\*b\* (D50 illuminant), swatch chapter, and combination memberships.

## Project Structure

```
src/
├── data/
│   ├── colors.json      — 159 verified colors from the book
│   ├── types.ts         — TypeScript interfaces
│   └── palettes.ts      — Derives 348 palettes from color data
├── components/
│   ├── Randomizer.tsx   — Random palette discovery
│   ├── ColorPicker.tsx  — Camera/upload/manual color matching
│   ├── BookView.tsx     — Page-by-page scroll view
│   ├── PaletteCard.tsx  — Book-style palette display
│   ├── Navigation.tsx   — Top nav bar
│   └── CopyButton.tsx   — Clipboard copy menu
├── utils/
│   ├── colorDistance.ts  — CIE76 ΔE + RGB↔L*a*b* conversion
│   ├── clipboard.ts     — Copy formatting (hex/RGB/CSS)
│   └── imageColors.ts   — Median-cut color extraction
├── App.tsx
└── main.tsx
```

## Attribution

Book: *A Dictionary of Colour Combinations* by **Sanzo Wada**, published by **Seigensha Art Publishing**.

## Author

Created by **[Dennis Azor](https://github.com/dennisazor)**

## License

MIT — see [LICENSE](LICENSE) for details.
