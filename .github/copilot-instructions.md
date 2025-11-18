# Copilot Instructions for Croppy

## Project Overview

**Croppy** is a focused, single-image cropping tool built with Next.js that works directly with clipboard images. It provides a fixed-dimension crop box with live preview, allowing users to position their image within precise dimensions and quickly export results back to clipboard or file.

**Key Features:**
- Intuitive positioning: Drag image around fixed crop box with zoom controls
- Live preview: See final result in real-time before exporting
- Clipboard integration: Load and export directly to/from clipboard
- Fully client-side: No server dependencies, complete user control

**Development Environment:** Windows 11 with PowerShell 7.5.4  
**Framework:** Next.js with TypeScript  
**Repository:** GitHub (main branch auto-deployed)  
**Deployment:** Cloudflare Pages with custom domain  
**Philosophy:** Maximum user control, no artificial limitations, fully client-side

## Key Architecture Principles

- **No Backend:** All processing happens in the browser (client-side only)
- **No External Dependencies:** No required API calls or external services
- **Local Data Storage:** User data stored in browser (localStorage/IndexedDB) only
- **Transparency:** Users have complete control and visibility into the tool's operation
- **Privacy-First:** All exported data (clipboard, downloads) has metadata stripped for user privacy

## Architecture

### Key Components
*Document main modules, services, and their responsibilities once structure is defined.*

### Data Flow
*Describe how data flows through the system, including API boundaries and major transformations.*

## UI Components

### Top Left Menu
- X and Y input fields for crop box position
- Remembers last used values in localStorage
- Real-time preview as user types

### Help Overlay
- Lists all available actions and keyboard shortcuts
- Example: `Paste Clipboard Image - Ctrl+V`
- Accessible via help button or keyboard shortcut

### Utility Bar (Bottom)
- **Far Left:** Original image dimensions (e.g., "Original Size: 1920 x 1080")
- **Center:** Current zoom level (e.g., "Zoom: 100%")
- **Far Right:** Crop output dimensions (e.g., "Output: 800 x 600")

## Development Workflow

### Build & Run
```powershell
# To be documented with actual build commands
# All commands should be PowerShell 7.5.4 compatible
```

### Testing
```powershell
# Document test execution commands and conventions
```

### Debugging
*Describe debugging setup and any special configurations needed.*

### Deployment to Cloudflare Pages
*Document deployment process, build configuration (wrangler.toml or functions setup), and CI/CD pipeline via GitHub Actions.*

## Design System

### Color Palette
- Canvas Background: `#1a1a1a` (Dark Gray)
- Crop Box Border: `#ffffff` (White)
- UI Background: `#2a2a2a` (Dark Gray)
- UI Text: `#e0e0e0` (Light Gray)

### Layout
- Dark mode theme throughout
- Top-left menu for X/Y position controls
- Bottom utility bar for image info (original size, zoom, output dimensions)
- Help overlay for keyboard shortcuts and actions

See `docs/DESIGN.md` for complete design specification.

## Project Conventions

### Code Style & Patterns
- *Add project-specific conventions (naming, structure, etc.)*
- *Document unusual patterns that differ from standard practices*
- *Reference key files that exemplify patterns*

### File Organization
- *Describe directory structure and naming conventions*
- *Explain how components are organized*

## External Dependencies & Integration Points

### Key Dependencies
*List critical external libraries, APIs, or services.*

### Configuration
*Document how configuration is managed (env vars, config files, etc.)*

## Common Tasks & Patterns

### Task 1: *Example task*
*Step-by-step approach with relevant file references.*

### Task 2: *Example task*
*Step-by-step approach with relevant file references.*

## Getting Started Checklist
- [ ] Review this file structure once codebase is populated
- [ ] Run initial build/setup commands
- [ ] Understand the architecture overview
- [ ] Examine example implementations in key files

---
*Last updated: November 17, 2025. Update this document as the codebase evolves and new patterns emerge.*
