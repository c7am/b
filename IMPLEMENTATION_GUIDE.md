# Axiom - Material Design 3 Implementation Guide
## Quick Reference for Developers

---

## CSS Custom Properties Available

### Colors (31 total)
Use `var(--md-sys-color-*)` for all colors:
- Primary, Secondary, Tertiary (+ containers)
- Error (+ container)
- Surface, Surface-container (5 levels)
- Outline, Outline-variant
- Success (custom), custom aliases

### Shape (10 total)
Use `var(--md-sys-shape-corner-*)`:
- none (0), extra-small (4px), small (8px), medium (12px)
- large (16px), extra-large (28px), full (9999px)

### Motion (16 total)
**Durations:** short1/2/3/4, medium1/2/3/4, long1/2/3/4
**Easing:** standard, emphasized, decelerated, accelerated

### Elevation (5 levels)
Use `var(--md-sys-elevation-level*)` for shadows

### Typography (13 styles)
Use `var(--md-sys-typescale-*)` for type scale

---

## Responsive Breakpoints

- **Mobile:** < 600px (default, 1-column)
- **Tablet:** 600-840px (2-column)
- **Desktop:** > 840px (3-column, faster animations)

---

## DO's and DON'Ts

### DO:
- ✅ Use CSS custom properties for all values
- ✅ Test with prefers-reduced-motion enabled
- ✅ Add :focus-visible to all interactives
- ✅ Use semantic HTML

### DON'T:
- ❌ Hardcode colors, radiuses, shadows
- ❌ Create animations without motion tokens
- ❌ Skip keyboard navigation support
- ❌ Assume Dark mode isn't needed

---

## Resources

- Material Design 3: https://m3.material.io
- Axiom CLAUDE.md: Complete reference
- Axiom SESSION_COMPLETE.md: This session summary

