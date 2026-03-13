# A Dictionary of Color Combinations — Web App Specification

## Overview
A web application that digitally recreates Sanzo Wada's *A Dictionary of Color Combinations* (1933), providing a faithful page-by-page browsing experience of all 348 color palettes composed from 159 unique colors across 6 swatch chapters.

## Data Source
- **Primary**: Verified JSON dataset from [mattdesl/dictionary-of-colour-combinations](https://github.com/mattdesl/dictionary-of-colour-combinations)
- **Why not parse the PDF?** The PDF is a compressed scan. OCR/text extraction of color values from a design book is fragile and error-prone. The mattdesl dataset was meticulously compiled from the original book data by Dain M. Blodorn Kim, then corrected by Matt DesLauriers with proper CMYK→RGB color profile conversions (U.S. Web Coated SWOP v2 → sRGB IEC61966-2.1, Relative Colorimetric with Black Point Compensation). This is the gold standard for accuracy.
- **159 unique colors** with name, CMYK, RGB, hex, L*a*b*, swatch chapter (0-5), and combination memberships
- **348 combinations** of 2, 3, or 4 colors each

## Architecture
- **Stack**: Vite + React 18 + TypeScript + Tailwind CSS
- **Deployment**: Static site (no backend required)
- **Data**: Embedded JSON (~30KB gzipped) — no API calls needed for core data
- **Browser APIs**: MediaDevices (camera), Canvas (color extraction), EyeDropper API (native picker)

## Features

### 1. Book View (Primary — Page-by-Page Browsing)
The core experience. Mimics scrolling through the physical book.

- Each "page" displays one combination (palette) with its number (1–348)
- Color swatches rendered as large blocks showing the 2–4 colors
- Each color shows: name, hex code, RGB, CMYK values
- Smooth vertical scroll through all 348 combinations in order
- Swatch chapter grouping preserved (chapters 0–5)
- Chapter navigation sidebar/header for jumping between sections
- Responsive: works on mobile (single column) and desktop (book-like layout)

### 2. Randomizer
- Single button press → random combination from the 348
- Animated transition between palettes
- "Lock" a color to find combinations containing it
- Copy palette values (hex, RGB, CSS) to clipboard

### 3. Color Picker + Camera
- **Camera Snap**: Capture photo via device camera → extract dominant colors → find closest matching combination(s) from the book
- **Image Upload**: Same flow for uploaded images
- **Manual Picker**: Click-to-pick color → find nearest colors and their combinations
- **EyeDropper API**: Native browser color picker (where supported)
- Color distance calculated using CIE76 (Euclidean distance in L*a*b* space) for perceptual accuracy

## Color Distance Algorithm
Using L*a*b* color space (already in the dataset) with CIE76:
```
ΔE = sqrt((L1-L2)² + (a1-a2)² + (b1-b2)²)
```
L*a*b* is perceptually uniform — equal numerical differences correspond to roughly equal perceived differences. This avoids the pitfalls of RGB distance where perceptual uniformity is poor.

## Non-Goals
- No user accounts or backend
- No PDF rendering (we use the structured data, not the PDF itself)
- No CMYK editing (display only — CMYK→RGB is pre-computed with proper ICC profiles)
- No arbitrary color generation — this is strictly the book's 159 colors and 348 palettes
