# QA Report — Scroll World Animation V1

**Date:** 2026-07-30  
**Tested By:** SS (Automated + Visual)  
**Branch:** animation-v1  
**Base:** v1.5-static-approved  

---

## Test Matrix

### 1. Zone Interaction

| Test | Expected | Result |
|------|----------|--------|
| Click Penang zone | Zoom to Penang, show Elderly Care panel | ✅ PASS |
| Click Johor zone | Zoom to Johor, show Baby & Child Care panel | ✅ PASS |
| Click KL zone | Zoom to KL, show Home & Household Support panel | ✅ PASS |
| Click "Back to World" | Return to world view | ✅ PASS |
| Click zone while zoomed | Ignore or return first | ✅ PASS |

### 2. Keyboard Accessibility

| Test | Expected | Result |
|------|----------|--------|
| Tab to zone labels | Focus visible, tabindex=0 | ✅ PASS |
| Enter on focused zone | Trigger zone selection | ✅ PASS |
| Space on focused zone | Trigger zone selection | ✅ PASS |
| Escape in zoomed state | Return to world view | ✅ PASS |
| Tab through service panel | Focus trapped logically | ✅ PASS |
| Focus returns after "Back" | Focus on previously clicked zone | ✅ PASS |

### 3. Route Lines

| Test | Expected | Result |
|------|----------|--------|
| Route lines animate on zone click | Stroke-dashoffset draws from center to zone | ✅ PASS |
| Route lines fade on return | Opacity transition to 0 | ✅ PASS |
| Route lines glow | Drop-shadow filter visible | ✅ PASS |
| Route lines recalculate on resize | Path endpoints updated | ✅ PASS |

### 4. Zoom

| Test | Expected | Result |
|------|----------|--------|
| Desktop zoom scale | 2.5x | ✅ PASS |
| Mobile zoom scale (≤768px) | 1.8x | ✅ PASS |
| Small mobile zoom (≤480px) | 1.5x | ✅ PASS |
| Transform-origin correct | Centered on selected zone | ✅ PASS |
| Transition timing | Smooth cubic-bezier | ✅ PASS |

### 5. Service Panel

| Test | Expected | Result |
|------|----------|--------|
| Panel slides in on desktop | translateX from right | ✅ PASS |
| Panel slides in on mobile | translateY from bottom (sheet) | ✅ PASS |
| Panel content correct | Zone name, service, description, link | ✅ PASS |
| "Learn More" link works | Scrolls to corresponding section | ✅ PASS |
| Back button visible | Clear "Back to World" control | ✅ PASS |

### 6. Reduced Motion

| Test | Expected | Result |
|------|----------|--------|
| prefers-reduced-motion: reduce | No zoom, instant show/hide | ✅ PASS |
| Route lines disabled | No stroke animation | ✅ PASS |
| Pulsing glow disabled | No keyframe animation | ✅ PASS |
| Live preference change | Responds to runtime change | ✅ PASS |

### 7. Responsive

| Breakpoint | Test | Result |
|------------|------|--------|
| 1440px+ | Layout intact, zoom 2.5x | ✅ PASS |
| 1024px | Layout intact, zoom 2.5x | ✅ PASS |
| 768px | Panel becomes bottom sheet, zoom 1.8x | ✅ PASS |
| 480px | Full-width panel, zoom 1.5x, touch targets ≥48px | ✅ PASS |
| 375px (iPhone SE) | All elements accessible | ✅ PASS |

### 8. Integration

| Test | Expected | Result |
|------|----------|--------|
| Existing nav still works | Click nav links → scroll to sections | ✅ PASS |
| Enquiry planner unaffected | Opens/closes normally | ✅ PASS |
| Mobile menu unaffected | Toggle works | ✅ PASS |
| Scroll reveal unaffected | Panels still animate in | ✅ PASS |
| Original styles.css unmodified | Byte-for-byte identical | ✅ PASS |
| Original script.js unmodified | Byte-for-byte identical | ✅ PASS |

### 9. Performance

| Test | Expected | Result |
|------|----------|--------|
| No external dependencies | Pure CSS/JS | ✅ PASS |
| No CDN calls | Self-contained | ✅ PASS |
| SVG generated lazily | Only on first interaction | ✅ PASS |
| Resize debounced | No layout thrashing | ✅ PASS |

---

## Issues Found

| # | Severity | Description | Status |
|---|----------|-------------|--------|
| — | — | No issues found | — |

## Summary

**Overall Status: ✅ PASS**

All 10 feature requirements met:
1. ✅ Clickable Penang, Johor, KL zones
2. ✅ Keyboard-accessible zone controls
3. ✅ Animated glowing route lines
4. ✅ Controlled zoom into selected zone
5. ✅ Service information panel
6. ✅ Clear "Back to World" control
7. ✅ Escape-key return
8. ✅ Mobile and tablet support
9. ✅ Reduced-motion fallback
10. ✅ No modifications to locked foundation
