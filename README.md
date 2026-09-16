[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## Overview

**FontSara** (فونت‌سرا) is a modern, bilingual (Persian / English) web application that lets designers and developers discover, preview, filter, and download high-quality free & open-source Persian fonts.

It acts as a living specimen library: fonts are loaded dynamically from a curated open dataset, rendered with real typefaces, and can be explored with advanced filters, live preview text, variable-font axes, and one-click CSS generation.

### Key Features

- **Curated Persian Font Catalog**  
  Sourced from the [Awesome Persian Fonts](https://github.com/alr-rashidi/Awesome-Persian-Fonts) dataset.

- **Rich Filtering & Search**
  - Style (Sans, Serif, Display, Decorative, Monospace…)
  - License (OFL, GPL, Apache, BVL…)
  - Supported languages (Persian, Arabic, Kurdish, Urdu, etc.)
  - Number of weights / Variable fonts

- **Interactive Specimen Viewer**
- **Pin favorite fonts**
- **Copy ready-to-use CSS**

- **Bilingual UI** with seamless language switching
- **Dark / Light theme** with system preference support
- **Responsive design** optimized for desktop and mobile
- **Performance-focused**
  - Lazy-loaded font faces
  - Infinite scroll / batched rendering of font cards
  - Efficient canvas-based font detection

---

## Tech Stack

| Category          | Technology                          |
|-------------------|-------------------------------------|
| Framework         | React 19 + TypeScript               |
| Build Tool        | Vite 6                              |
| Styling           | Tailwind CSS 4 (via `@tailwindcss/vite`) |
| Carousel          | Embla Carousel                      |
| State Management  | React Context                       |
| Package Manager   | pnpm                                |
| Linting / Format  | ESLint + Prettier (with Husky + lint-staged) |

---

## Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/FontSara/FontSara.github.io
cd ./FontSara.github.io/

# Install dependencies
pnpm install
```

### Development

```bash
pnpm dev
```

The app will be available at `http://localhost:5173`.

### Production Build

```bash
pnpm build
pnpm preview   # optional local preview of the production build
```

### Linting & Formatting

```bash
pnpm lint
pnpm lint:fix
pnpm format
```

---

## Data Source

Font metadata is fetched at runtime from:

```
https://cdn.jsdelivr.net/gh/alr-rashidi/Awesome-Persian-Fonts/data/fonts.json
```

This keeps the catalog always up-to-date without without GitHub request limits.

---

## License

This project is open source.  
Individual fonts retain their original licenses (OFL, GPL, Apache, etc.).  
Please respect each typeface’s license when downloading or redistributing.

---

## Acknowledgments

- [Awesome Persian Fonts](https://github.com/alr-rashidi/Awesome-Persian-Fonts) - the curated data source (Special thanks to its amazing creator!)
- [`@fullstacksjs/eslint-config`](https://github.com/fullstacksjs/eslint-config) - for the excellent ESLint configuration
- All the talented type designers who released their work under open licenses
- The React, Vite, and Tailwind communities
