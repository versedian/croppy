# Croppy

**A privacy-first image cropping tool that runs entirely in your browser.**

Croppy is a focused, single-image cropping tool designed for quick, precise image cropping with complete user control. Paste an image from your clipboard, position it within a fixed crop box, adjust zoom and rotation, and export directly back to your clipboard or as a PNG file—all without ever leaving your browser.

## Philosophy

**Your Privacy Matters**

Croppy is built on a foundation of complete user privacy and transparency:

- **100% Client-Side Processing:** All image processing happens locally in your browser. Nothing is ever uploaded to any server.
- **No Data Collection:** We don't collect, store, or transmit any of your images or data.
- **No Tracking:** No analytics, no tracking cookies, no third-party scripts monitoring your activity.
- **Local Preferences Only:** Uses browser localStorage solely for your preferences (crop dimensions, custom presets). No personal data stored.
- **Metadata Stripped:** All exported images automatically have metadata removed to protect your privacy.
- **Open Source:** Full transparency—inspect the code yourself and verify our claims.

**You are in complete control.** Your images never leave your device.

## Features

- **Clipboard Integration:** Paste images directly (Ctrl+V), export to clipboard (Ctrl+C) or download (Ctrl+S)
- **Precise Cropping:** Fixed-dimension crop box with adjustable presets
- **Live Preview:** See your final result in real-time as you adjust
- **Image Controls:** Drag to position, zoom in/out, rotate ±180°
- **Custom Presets:** Save your frequently-used crop dimensions
- **Keyboard Shortcuts:** Efficient workflow with hotkeys for all major actions
- **Dark Interface:** Easy on the eyes with a modern dark theme

## Quick Start

Visit the live site or run locally:

```powershell
# Install dependencies
npm install

# Start development server
npm run dev
```

Open `http://localhost:3000` in your browser.

### Basic Usage

1. Press `Ctrl+V` to paste an image from your clipboard (or drag & drop)
2. Drag the image to position it within the crop box
3. Use mouse wheel to zoom, adjust rotation with the slider
4. Press `Ctrl+C` to copy cropped image to clipboard, or `Ctrl+S` to download
5. Press `H` for full keyboard shortcuts list

## Technical Details

- **Framework:** Next.js 14 with TypeScript
- **Rendering:** HTML5 Canvas for precise image manipulation
- **Storage:** localStorage for preferences (crop dimensions, custom presets)
- **Deployment:** Static export, works on any hosting platform

## Development

This project is open for contributions. See the codebase structure:

- `src/app/` - Main application logic
- `src/components/` - UI components (Canvas, TopLeftMenu, UtilityBar, etc.)
- `docs/` - Design specifications

## License

**The Unlicense**

This is free and unencumbered software released into the public domain.

Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.

For more information, please refer to <https://unlicense.org/>

---

**Built with privacy and user control as the top priorities.** No servers. No tracking. Just a tool that works.
