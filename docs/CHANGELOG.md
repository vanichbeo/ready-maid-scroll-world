# Changelog

All notable changes to the Ready Maid Scroll World project.

## [v1.5-static-approved] — 2026-07-30

### Frozen Base

- Approved frozen website foundation from `READY_MAID_RESPONSIVE_HOMEPAGE_V1_5_MAXIMUM_ASSET_FREE_TECHNICAL_POLISH`
- 22 files: index.html, styles.css, script.js, 404.html, assets/, sitemap.xml, robots.txt, site.webmanifest
- Tagged as `v1.5-static-approved` on `main` branch
- **DO NOT MODIFY** on main branch

## [animation-v1] — 2026-07-30

### Added

- **Scroll World Animation V1** — interactive zone exploration on the origami Malaysia map
  - Clickable Penang, Johor, and Kuala Lumpur service zones
  - Keyboard-accessible zone controls (tabindex, role, aria-labels, Enter/Space activation)
  - Animated glowing route lines (SVG with stroke-dashoffset animation)
  - Controlled zoom into selected zone (CSS transform scale+translate)
  - Service information panel with zone details and "Learn More" link
  - Clear "Back to World" control
  - Escape-key return to world view
  - Mobile and tablet support (responsive breakpoints at 768px and 480px)
  - Reduced-motion fallback (prefers-reduced-motion: reduce)

### Files

- `animation-v1.css` — 491 lines, all animation styles
- `animation-v1.js` — 415 lines, state machine and interaction logic
- `index.html` — 2 lines added (CSS link + JS script reference)
- `docs/ANIMATION_SPEC.md` — Technical specification
- `docs/CHANGELOG.md` — This file
- `docs/QA_REPORT.md` — Quality assurance report

### Not Modified

- `styles.css` — existing styles preserved
- `script.js` — existing scripts preserved
- Locked structure, colours, hero composition, responsive foundation — unchanged

---

## Branch Status

| Branch | Commit | Status |
|--------|--------|--------|
| `main` | `565c7ab` | Frozen — v1.5-static-approved tag |
| `animation-v1` | `114de9c` | Active — Animation V1 complete |

**Note:** `animation-v1` is NOT merged into `main`. Per instructions, branches remain separate.
