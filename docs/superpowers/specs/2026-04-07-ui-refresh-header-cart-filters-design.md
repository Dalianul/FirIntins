# UI Refresh — Header, Cart Drawer, Filter Dropdowns

**Date:** 2026-04-07  
**Scope:** Three focused UI areas on the storefront — header behavior, cart drawer visual refresh, and custom filter dropdown redesign.

---

## 1. Header — Smart Sticky with Scroll Hide/Reveal

### Visual Direction
Option A — Refined Current. 64px tall. Existing layout structure preserved but elevated.

**Changes from current:**
- Nav links: hover state adds bottom border in `rgba(74,94,58,0.5)`; active link has solid `#4a5e3a` underline
- Cart button: outlined pill — `rgba(74,94,58,0.15)` background, `rgba(74,94,58,0.25)` border, green hover
- Search/account: icon-only 36px buttons, rounded 6px, hover gets `rgba(74,94,58,0.12)` background
- Glass background: `color-mix(in srgb, #161410 92%, transparent)` + `backdrop-blur-md` + bottom border + shadow (already implemented — keep)

### Smart Scroll Behavior
- **Scroll down** past 80px → header translates `y: -64px` (fully hidden above viewport)
- **Scroll up** any amount → header translates `y: 0` (immediately snaps back)
- **At top of page (< 80px)** → always visible, no threshold logic applies
- Animation: Framer Motion `animate={{ y }}` with `transition={{ duration: 0.25, ease: "easeInOut" }}`
- Implementation: `useScrollDirection` hook in `hooks/use-scroll-direction.ts`
  - Tracks `lastScrollY` ref, compares on each scroll event
  - Returns `"up" | "down"`, resets to `"up"` when `scrollY < 80`
  - Uses `passive: true` event listener, cleans up on unmount

### Files
- `components/layout/header.tsx` — add `useScrollDirection`, wrap header in `<m.header>` with `animate={{ y }}`
- `hooks/use-scroll-direction.ts` — new hook

---

## 2. Cart Drawer — Rich Glass Refresh

### Visual Direction
Option B — Rich Glass. Without security note. With "sau continuă cumpărăturile" link.

### Item Row Layout
```
[60×60 thumb + qty badge] [name / variant / (price · qty control)] [✕ button]
```
- Thumbnail: 60×60, rounded-md (6px), `border border-[--color-border]`, dark background, overflow hidden
- Qty badge on thumbnail: absolute top-right, 16×16, `bg-[--color-moss]`, white text, 9px bold
- Name: 13px Outfit medium, white, truncated
- Variant: 10px, `--color-fog` at 35% opacity
- Price + qty control on same row, space-between
- Qty control: pill group — minus | number | plus — `bg-[--color-surface]` background, border, each btn 26×24, hover gets moss tint
- Remove button (✕): top-right of row, 24×24, fades in on row hover (`opacity-0 group-hover:opacity-100`)
- Row hover: subtle `rgba(74,94,58,0.05)` background tint
- Divider: `left-20 right-20` inset 1px line (not full-width)

### Footer
1. **Promo code row**: `bg-[--color-surface]/40`, bordered, "Adaugă cod promoțional" with tag icon — tappable, hover gets moss border tint. (No actual promo input required in this spec — placeholder that opens nothing for now)
2. **Totals**: Subtotal row + Transport row (shows "Gratuit" or actual value) + Total row with top border, serif total value
3. **CTA button**: Full-width, `linear-gradient(135deg, rgba(74,94,58,0.25), rgba(107,138,82,0.2))`, `border rgba(74,94,58,0.4)`, rounded-md, uppercase "Finalizează comanda", inset highlight on top edge. Hover brightens gradient + border.
4. **"sau continuă cumpărăturile"**: 11px, `--color-fog` at 35%, centered, hover raises opacity, calls `onClose`

### Micro-interactions
- Drawer slides in from right: `x: "100%"` → `x: 0`, spring physics `{ type: "spring", stiffness: 300, damping: 30 }`
- Items stagger in: each item `delay: index * 0.04`, `opacity: 0, y: 8` → `opacity: 1, y: 0`
- Remove item: `AnimatePresence` exit `{ opacity: 0, x: -20, height: 0 }`
- Qty change: number springs — `useSpring` on displayed quantity value (visual-only, not tied to real state)

### Files
- `components/cart/cart-drawer.tsx` — drawer shell, footer, micro-interactions
- `components/cart/cart-item.tsx` — item row redesign (thumb badge, pill qty, row hover, remove fade)

---

## 3. Filter Dropdowns — Minimal Glass Redesign

### Visual Direction
Option A — Minimal Glass. Rounded pill triggers, frosted glass dropdown, moss glow on open.

### SelectTrigger (closed state)
- `bg-[rgba(26,24,20,0.7)]` background, `border border-[--color-fog]/15`, `rounded-md` (6px), `px-3 py-1.5`
- Label: 13px, `--color-fog`
- Chevron: `▾` at 50% opacity, 10px, `transition-transform`
- Hover: border → `rgba(74,94,58,0.5)`, text → white
- Open (`aria-expanded`): border → `#4a5e3a`, `box-shadow: 0 0 0 1px rgba(74,94,58,0.2)`, chevron rotates 180°, text → white

### SelectPopup (dropdown)
- `bg-[rgba(22,20,16,0.98)]` + `backdrop-filter: blur(12px)`
- `border border-[--color-fog]/15`, `rounded-md`, `p-1`
- `box-shadow: 0 8px 32px rgba(0,0,0,0.6)`
- Offset 4px below trigger
- Animate: `opacity: 0, scaleY: 0.95, y: -4` → `opacity: 1, scaleY: 1, y: 0`, origin top, duration 0.15s ease-out

### SelectItem
- Padding `7px 10px`, `rounded` (4px), 13px, `--color-fog`
- Hover: `rgba(74,94,58,0.12)` background, text → white
- Selected: `color: #6b8a52`, shows `✓` prefix (11px, `#4a5e3a`)
- Non-selected: empty space (width: 11px) to keep text aligned

### Root Component Fix
The current `Select` wrapper passes `items` prop to `Select.Root` from Base UI, which conflicts with Base UI internals. Fix:
- Remove `items` prop from the wrapper interface
- Pass options as `children` to `SelectContent` via a render prop or direct JSX in the consumer
- Consumers (`sort-select.tsx`, `category-filter.tsx`) will map options to `<SelectItem>` JSX directly

### InStockToggle
- Matches Minimal Glass aesthetic: small pill toggle, moss accent when active
- Label: 13px `--color-fog`, same font as triggers

### Files
- `components/ui/select.tsx` — redesign trigger + popup styles, fix `items` prop bug
- `components/product/sort-select.tsx` — update to pass children instead of `items`
- `components/product/category-filter.tsx` — same
- `components/product/in-stock-toggle.tsx` — minor style refresh

---

## Out of Scope
- Price stepper functionality (separate spec already in progress)
- Promo code actual functionality (drawer placeholder only)
- Mobile responsive changes
- Any page outside header, `/produse` filters, and cart drawer

---

## Verification
- All 227 existing tests continue to pass
- Header hides on scroll down, reappears on scroll up at any viewport width
- Cart items always show image (picsum fallback already in place)
- Filter dropdowns open, close, and show selected state correctly
- No `items` prop TypeScript errors on Select components
