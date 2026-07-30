# Scroll World Animation V1 — Specification

**Version:** 1.0  
**Date:** 2026-07-30  
**Status:** Implemented  

## Overview

Interactive "Scroll World" animation layer added to the Ready Maid Agency homepage. Users can explore three Malaysian service zones (Penang, Johor, Kuala Lumpur) through an animated world map with route lines, zoom transitions, and service information panels.

## Architecture

### Files

| File | Purpose | Lines |
|------|---------|-------|
| `animation-v1.css` | All animation styles, keyframes, responsive breakpoints, reduced-motion fallback | 491 |
| `animation-v1.js` | State machine, zone interaction, SVG route generation, zoom logic, keyboard handling | 415 |
| `index.html` | Modified — added CSS link + JS script reference | 2 lines added |

### State Machine

```
WORLD → ZOOMING → ZOOMED → RETURNING → WORLD
  ↑                                        │
  └────────────────────────────────────────┘
```

| State | Description |
|-------|-------------|
| `WORLD` | Default. Map visible, zone labels pulsing, clickable. |
| `ZOOMING` | Route lines animating, camera zooming into zone. |
| `ZOOMED` | Zone focused, service panel visible, "Back to World" active. |
| `RETURNING` | Zooming back to world view, panel dismissing. |

## Zone Data

| Zone | Service | Section Link | Route Color |
|------|---------|--------------|-------------|
| Penang | Elderly Care | `#elderly` | Cyan `#13d7ff` |
| Johor | Baby & Child Care | `#baby` | Purple `#d445ff` |
| Kuala Lumpur | Home & Household Support | `#home-support` | Blue `#3e9eff` |

## Animation Components

### 1. Zone Pulsing Glow
- CSS `::before` pseudo-element on `.world-label`
- `@keyframes pulse-glow` with scale + opacity
- Staggered animation delays per zone (0s, 0.3s, 0.6s)
- Respects `prefers-reduced-motion`

### 2. SVG Route Lines
- Dynamically generated SVG overlay (`.animation-routes`)
- Cubic bezier `<path>` elements from world center to zone positions
- `stroke-dashoffset` animation for "drawing" effect
- Drop-shadow glow filter
- Recalculated on window resize

### 3. Zoom Transition
- CSS `transform: scale(2.5) translate(...)` on `.world-stage`
- `transform-origin` set to zone position
- Desktop: scale 2.5, Mobile: scale 1.8
- `cubic-bezier(0.4, 0, 0.2, 1)` timing

### 4. Service Panel
- Fixed position, slides in from right (desktop) or bottom (mobile)
- Contains: zone name, service type, description, "Learn More" link
- "Back to World" button at top
- Semi-transparent backdrop overlay

### 5. Keyboard Accessibility
- Zone labels: `tabindex="0"`, `role="button"`, `aria-label`
- Enter/Space triggers zone selection
- Escape returns to world view
- Focus management: zone → panel → back button → world

### 6. Reduced Motion
- `prefers-reduced-motion: reduce` detected at load + live listener
- Disables zoom (scale stays 1)
- Disables route line animation
- Uses instant show/hide for panel
- Pulsing glow disabled

## Responsive Breakpoints

| Breakpoint | Zoom Scale | Panel Position | Touch Targets |
|------------|-----------|----------------|---------------|
| > 768px | 2.5 | Right side | Standard |
| ≤ 768px | 1.8 | Bottom sheet | ≥ 44px |
| ≤ 480px | 1.5 | Full-width bottom | ≥ 48px |

## Integration Points

- **Existing `styles.css`** — not modified
- **Existing `script.js`** — not modified  
- **Zone labels** — remain `<a>` elements with original `href` attributes
- **Navigation** — zone links still work via "Learn More" in service panel
- **Enquiry planner** — unaffected, opens independently

## Performance

- No external dependencies (pure CSS/JS)
- No CDN calls
- SVG generated lazily on first zone interaction
- Route paths recalculated only on resize (debounced)
- `will-change: transform` only during active transitions
