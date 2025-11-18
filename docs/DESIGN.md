# Design Specification - Croppy

## Color Palette

| Element | Color | Hex Value | Usage |
|---------|-------|-----------|-------|
| Canvas Background | Dark Gray | #1a1a1a | Main canvas/image area background |
| Crop Box Border | White | #ffffff | Fixed crop box overlay |
| UI Text | Light Gray | #e0e0e0 | Labels, values, help text |
| UI Background | Dark Gray | #2a2a2a | Control panels, overlays |
| Accent/Interactive | TBD | TBD | Buttons, hover states, active elements |

## Layout Architecture

### Main Canvas Area
- Dark gray background (#1a1a1a) - primary working area
- Centered crop box with white border (fixed dimensions)
- Image positioned behind crop box with drag/zoom capabilities

### Component Structure

```
┌─────────────────────────────────────────┐
│  [Top Left Menu]                        │
│  ├─ X: [___]                            │
│  └─ Y: [___]                            │
├─────────────────────────────────────────┤
│                                         │
│           Canvas Area                   │
│      (Dark Gray Background)             │
│                                         │
│      ┌──────────────────────┐           │
│      │  Crop Box (White)    │           │
│      │  (Fixed Dimensions)  │           │
│      └──────────────────────┘           │
│                                         │
├─────────────────────────────────────────┤
│ Original: X x Y  │  Zoom: %  │  Output │
│                  │ (centered) │  X x Y  │
└─────────────────────────────────────────┘

[Help Overlay - Available via keyboard/menu]
├─ Paste Clipboard Image - Ctrl+V
├─ [Additional shortcuts]
└─ [Additional shortcuts]
```

## UI Components

### 1. Top Left Menu
**Purpose:** Position control for crop box, presets management, and image management  
**Location:** Top-left corner of canvas  
**Default Dimensions:** 832 × 1216 (for first-time users)
**Elements:**
- Label: "Crop Box Position"
- X Input Field: Position on horizontal axis
  - Defaults to 832 for first-time users
  - Remembers last used value
  - Real-time preview as user types
  - Numeric input only
- Y Input Field: Position on vertical axis
  - Defaults to 1216 for first-time users
  - Remembers last used value
  - Real-time preview as user types
  - Numeric input only
- Help Button (?): Opens HelpOverlay to show keyboard shortcuts
- Remove Button (X): 
  - Only appears when image is loaded
  - Red styling (#ff4444) for visibility
  - Removes image from canvas without modifying user's clipboard

**Presets Dropdown:**
- Located below TopLeftMenu, folds out on click
- Toggle button: "Presets ▼" / "Presets ▲"
- **Add Preset Button:** Creates form to add custom presets
  - Input: Preset Name
  - Inputs: Width and Height values
  - Client-side only (localStorage storage)
- **Preset List:**
  - Default presets: 720p (1280×720), 1080p (1920×1080), 4K (3840×2160)
  - Custom user presets appear below defaults
  - **Drag Handle (⋮):** Drag presets to reorder, persists to localStorage
  - **Preset Button:** Click to apply preset dimensions to X and Y fields
  - **Delete Button (✕):** 
    - Red on hover
    - Clicking shows confirmation: "Are you sure? Yes / No"
    - Only deletes custom presets (built-in presets cannot be deleted)

**Behavior:**
- Position values persist in localStorage (`croppy_lastX`, `croppy_lastY`)
- Update live preview when values change
- Constrain values to valid range (0 to canvas bounds)
- Remove button safely discards loaded image without side effects
- Presets stored in localStorage (`croppy_customPresets`)
- Drag-and-drop reordering maintained across sessions

---

### 2. Help Overlay
**Purpose:** Display available actions and keyboard shortcuts  
**Trigger:** Help button / ? key / help menu item  
**Display Mode:** Modal or floating overlay  
**Content:**
- Action name and corresponding keyboard shortcut
- Example: `Paste Clipboard Image - Ctrl+V`

**Planned Shortcuts:**
- Paste Clipboard Image - `Ctrl+V`
- Copy to Clipboard - `Ctrl+C`
- Download - `Ctrl+S`
- Reset Position - `R`
- Toggle Help - `?` or `H`
- Show/Hide Overlay - `Tab`

---

### 3. Utility Bar (Bottom)
**Purpose:** Display real-time information and status  
**Location:** Bottom of canvas area  
**Sections:**

#### Far Left: Original Image Information
- Label: "Original Size:"
- Display: `[Width] x [Height]` (pixels)
- Updates when new image is pasted
- Shows "—" if no image loaded

#### Center: Zoom Level
- Label: "Zoom:"
- Display: `[Percentage]%`
- Real-time update as user zooms
- Range: 10% to 500% (adjustable)

#### Far Right: Crop Output Dimensions
- Label: "Output:"
- Display: `[Width] x [Height]` (pixels)
- Shows fixed crop box dimensions
- Updates if crop box size is changed (future feature)

---

## Visual Hierarchy

1. **Canvas Background** - Foundation (#1a1a1a)
2. **Crop Box Border** - Primary focus (white, high contrast)
3. **Image Content** - Interactive element
4. **UI Controls** - Secondary (dark mode themed)
5. **Text/Labels** - Tertiary (light gray #e0e0e0)

## Typography

| Element | Font Size | Weight | Color | Notes |
|---------|-----------|--------|-------|-------|
| Labels | 12-14px | Regular | #e0e0e0 | Input labels, info text |
| Values | 14-16px | Monospace | #ffffff | Numbers (coordinates, dimensions) |
| Headers | 16-18px | Bold | #ffffff | Section titles |
| Shortcuts | 12px | Monospace | #b0b0b0 | Help overlay text |

## Interaction Patterns

### Mouse Interactions
- **Drag Image:** Click and drag within crop box to reposition
- **Zoom:** Mouse wheel to zoom in/out
- **Scroll:** Pan view if image extends beyond visible area

### Keyboard Interactions
- **Ctrl+V:** Paste from clipboard
- **Ctrl+C:** Copy crop result to clipboard (metadata stripped)
- **Ctrl+S:** Download as PNG with timestamp (metadata stripped)
- **Arrow Keys:** Fine-tune position (when focused)
- **Tab:** Cycle through input fields

### Touch Interactions (Future)
- **Drag:** Reposition image
- **Pinch:** Zoom in/out

---

## Export & Privacy

### Clipboard Export (Ctrl+C)
- Copies only the cropped image area to clipboard
- All EXIF data and metadata stripped
- Raw pixel data only

### PNG Download (Ctrl+S)
- Downloads as `croppy-YYYY-MM-DDTHH-MM-SS.png` (ISO 8601 timestamp)
- All metadata stripped (no EXIF, color profiles, creation date)
- Clean PNG file with cropped image only

---

## State Management

### localStorage Persistence
- `croppy_lastX` - Last used X coordinate
- `croppy_lastY` - Last used Y coordinate
- `croppy_zoomLevel` - Last zoom percentage (optional)

### Dynamic State
- Current image data (clipboard/uploaded)
- Current image dimensions
- Current zoom level
- Current crop box position
- Live preview output

---

## Accessibility Considerations

- Sufficient color contrast (WCAG AA standard)
- Keyboard-navigable controls
- Focus indicators on interactive elements
- Descriptive labels for all inputs
- Screen reader friendly structure

---

**Last Updated:** November 17, 2025
