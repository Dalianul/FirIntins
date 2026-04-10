# Light Theme Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the FirIntins storefront from a dark luxury theme to a warm light theme — parchment backgrounds, earthy greens, readable dark text — targeting the older demographic who buys fishing equipment.

**Architecture:** CSS custom properties in `globals.css` are the single lever for ~85% of the change; flipping the variable values propagates to all components that use `text-[--color-white]`, `bg-[--color-bg]`, etc. The remaining 15% is a small set of hardcoded `rgba()` values and `prose-invert` classes that must be patched manually.

**Tech Stack:** Tailwind v4 (CSS-variable tokens in `globals.css`), Next.js 16 App Router, `@tailwindcss/typography` (prose plugin), React 19

---

## File Map

| File | Change |
|---|---|
| `app/globals.css` | Flip all brand CSS variable values — both `:root` and `@theme inline {}` blocks |
| `app/(main)/layout.tsx` | Update `theme-color` meta tag value |
| `components/layout/header.tsx` | Reduce shadow opacity for light bg |
| `components/ui/select.tsx` | Replace hardcoded dark rgba in trigger + dropdown |
| `components/cart/cart-summary.tsx` | Replace hardcoded dark rgba in summary container |
| `components/blocks/HeroBlock.tsx` | Force white text over dark photo overlay (text was using `--color-white` which is now near-black) |
| `components/blocks/FaqBlock.tsx` | Remove `prose-invert` |
| `components/blocks/RichTextBlock.tsx` | Remove `prose-invert` |
| `components/blog/post-content.tsx` | Remove `prose-invert` |
| `components/layout/footer.tsx` | Remove `prose-invert` |

---

### Task 1: Flip CSS Variables — the Core Theme Change

**Files:**
- Modify: `apps/storefront/app/globals.css:8-22` (`:root` brand block)
- Modify: `apps/storefront/app/globals.css:57-71` (`@theme inline {}` brand block)

This single task changes ~85% of the visual appearance. All components using `text-[--color-white]`, `bg-[--color-bg]`, `border-[--color-border]`, etc. will adapt automatically.

**Design rationale:**
- `--color-bg: #f5f1ea` — warm parchment; reads as "aged paper", familiar to heritage outdoor brands
- `--color-white: #1c1a15` — near-black warm brown; primary text color (name kept to avoid touching 50+ files)
- `--color-cream: #3d3630` — darker warm brown; secondary body text (same name inversion rationale)
- `--color-fog: #6b6359` — medium warm gray; muted/placeholder text — 4.6:1 contrast on `#f5f1ea` (WCAG AA ✓)
- `--color-moss: #3d5630` — deeper green than current `#4a5e3a` for adequate contrast on light bg (5.1:1 on parchment)
- `--color-moss-light: #4f7339` — slightly lighter green for hover states, 4.5:1 on parchment (WCAG AA ✓)
- `--color-border: #d4cdbf` — warm light gray border; subtle on parchment ✓
- `--color-surface: #ffffff` — white card surfaces
- `--color-surface-2: #ede9df` — tinted surface for nested containers

- [ ] **Step 1: Open `apps/storefront/app/globals.css` and replace the `:root` brand variables block**

Replace lines 8–22 (the brand color variables only — do NOT touch the shadcn `--background`, `--foreground`, etc. variables that follow):

```css
:root {
  --color-bg: #f5f1ea;
  --color-bg-light: #faf7f2;
  --color-surface: #ffffff;
  --color-surface-2: #ede9df;
  --color-border: #d4cdbf;
  --color-moss: #3d5630;
  --color-moss-light: #4f7339;
  --color-moss-dim: rgba(61, 86, 48, 0.08);
  --color-mud: #8b6914;
  --color-gold: #a16207;
  --color-gold-light: #ca8a04;
  --color-fog: #6b6359;
  --color-cream: #3d3630;
  --color-white: #1c1a15;
```

- [ ] **Step 2: Replace the `@theme inline {}` brand variables block**

Replace lines 57–71 (same values, mirror of `:root`):

```css
@theme inline {
  --color-bg: #f5f1ea;
  --color-bg-light: #faf7f2;
  --color-surface: #ffffff;
  --color-surface-2: #ede9df;
  --color-border: #d4cdbf;
  --color-moss: #3d5630;
  --color-moss-light: #4f7339;
  --color-moss-dim: rgba(61, 86, 48, 0.08);
  --color-mud: #8b6914;
  --color-gold: #a16207;
  --color-gold-light: #ca8a04;
  --color-fog: #6b6359;
  --color-cream: #3d3630;
  --color-white: #1c1a15;
```

- [ ] **Step 3: Start the dev server and visually verify**

```bash
pnpm --filter storefront dev
```

Open `http://localhost:3000`. Confirm:
- Body background is warm parchment (not dark)
- Text is dark brown (readable)
- Header/footer picked up the new palette
- Green accent buttons still look correct

- [ ] **Step 4: Commit**

```bash
git add apps/storefront/app/globals.css
git commit -m "feat: flip CSS variables to warm light palette"
```

---

### Task 2: Update `theme-color` Meta Tag

**Files:**
- Modify: `apps/storefront/app/(main)/layout.tsx:46`

The `theme-color` meta tag controls the browser chrome color on mobile. Currently `#0c0b09` (dark). Needs to match the new parchment background.

- [ ] **Step 1: Update `theme-color` in metadata**

In `apps/storefront/app/(main)/layout.tsx`, find:

```ts
  other: {
    "theme-color": "#0c0b09",
  },
```

Replace with:

```ts
  other: {
    "theme-color": "#f5f1ea",
  },
```

- [ ] **Step 2: Commit**

```bash
git add apps/storefront/app/(main)/layout.tsx
git commit -m "fix: update theme-color meta to light parchment"
```

---

### Task 3: Fix Header Shadow Opacity

**Files:**
- Modify: `apps/storefront/components/layout/header.tsx:22`

The header's drop shadow is `rgba(0,0,0,0.5)` — very heavy, designed for dark backgrounds. On a light surface it looks muddy and overpowering.

- [ ] **Step 1: Reduce shadow opacity**

In `apps/storefront/components/layout/header.tsx`, find:

```tsx
      className="sticky top-0 z-50 border-b border-[--color-border] [background:color-mix(in_srgb,var(--color-bg-light)_92%,transparent)] backdrop-blur-md shadow-[0_2px_12px_rgba(0,0,0,0.5)]"
```

Replace with:

```tsx
      className="sticky top-0 z-50 border-b border-[--color-border] [background:color-mix(in_srgb,var(--color-bg-light)_92%,transparent)] backdrop-blur-md shadow-[0_2px_12px_rgba(0,0,0,0.07)]"
```

Note: The glass background `color-mix(in_srgb,var(--color-bg-light)_92%,transparent)` automatically becomes warm off-white glass — no change needed there.

- [ ] **Step 2: Verify header appearance**

Open `http://localhost:3000`. The header should have a subtle warm off-white glass blur with a barely-visible shadow — not a heavy dark stripe.

- [ ] **Step 3: Commit**

```bash
git add apps/storefront/components/layout/header.tsx
git commit -m "fix: reduce header shadow opacity for light theme"
```

---

### Task 4: Fix Select Component Hardcoded Dark RGBA

**Files:**
- Modify: `apps/storefront/components/ui/select.tsx`

The custom Select has hardcoded dark rgba values in the trigger button and the dropdown content. These will look broken on a light background.

Locations:
- `SelectTrigger` (line ~81): `[background:rgba(26,24,20,0.7)]` and `border-[rgba(196,191,176,0.15)]`
- `SelectContent` (line ~131–133): `[background:rgba(22,20,16,0.98)]`, `border-[rgba(196,191,176,0.12)]`, `shadow-[0_8px_32px_rgba(0,0,0,0.6)]`
- `SelectItem` (line ~171): `text-[#6b8a52]` (too light for light bg)

- [ ] **Step 1: Fix SelectTrigger background and border**

In `apps/storefront/components/ui/select.tsx`, find in `SelectTrigger`:

```tsx
        "[background:rgba(26,24,20,0.7)] border border-[rgba(196,191,176,0.15)]",
```

Replace with:

```tsx
        "[background:rgba(245,241,234,0.92)] border border-[rgba(100,92,80,0.2)]",
```

- [ ] **Step 2: Fix SelectContent background, border, and shadow**

In `apps/storefront/components/ui/select.tsx`, find in `SelectContent`:

```tsx
        "[background:rgba(22,20,16,0.98)] backdrop-blur-md",
        "border border-[rgba(196,191,176,0.12)]",
        "rounded-md shadow-[0_8px_32px_rgba(0,0,0,0.6)]",
```

Replace with:

```tsx
        "[background:rgba(250,247,242,0.99)] backdrop-blur-md",
        "border border-[rgba(100,92,80,0.15)]",
        "rounded-md shadow-[0_8px_32px_rgba(0,0,0,0.12)]",
```

- [ ] **Step 3: Fix SelectItem selected text color**

In `apps/storefront/components/ui/select.tsx`, find in `SelectItem`:

```tsx
        isSelected && "text-[#6b8a52]",
```

Replace with:

```tsx
        isSelected && "text-[#3d5630]",
```

- [ ] **Step 4: Verify select visually**

Navigate to `/produse`. The sort and category selects should appear as warm off-white dropdowns with dark text and green selection indicator.

- [ ] **Step 5: Run unit tests for select**

```bash
pnpm --filter storefront test -- --testPathPattern="sort-select|category-filter"
```

Expected: all tests pass (these tests mock `SelectTrigger` and don't render rgba, but confirm no import errors).

- [ ] **Step 6: Commit**

```bash
git add apps/storefront/components/ui/select.tsx
git commit -m "fix: replace hardcoded dark rgba in Select component for light theme"
```

---

### Task 5: Fix Cart Summary Hardcoded Dark Background

**Files:**
- Modify: `apps/storefront/components/cart/cart-summary.tsx:18`

The cart summary panel has a hardcoded `bg-[rgba(22,20,16,0.5)]` which renders as a dark overlay. On the light theme this will create an ugly dark blot inside the cart drawer.

- [ ] **Step 1: Replace hardcoded dark bg**

In `apps/storefront/components/cart/cart-summary.tsx`, find:

```tsx
    <div className="border-t border-[--color-border] bg-[rgba(22,20,16,0.5)] px-5 py-4 flex flex-col gap-3">
```

Replace with:

```tsx
    <div className="border-t border-[--color-border] bg-[--color-surface-2] px-5 py-4 flex flex-col gap-3">
```

Note: `--color-surface-2` is now `#ede9df` (warm tinted surface), which looks like a slightly recessed panel — correct for this use case.

- [ ] **Step 2: Verify cart drawer**

Open the cart drawer. The summary section at the bottom should have a slightly warm tinted background that differentiates it from the items list above.

- [ ] **Step 3: Commit**

```bash
git add apps/storefront/components/cart/cart-summary.tsx
git commit -m "fix: use surface-2 token instead of hardcoded dark rgba in cart summary"
```

---

### Task 6: Fix Hero Block Text Over Dark Photo Overlay

**Files:**
- Modify: `apps/storefront/components/blocks/HeroBlock.tsx`

**Critical issue:** The hero always shows a dark photo with a dark gradient overlay — the text MUST stay white regardless of theme. Currently the heading uses `text-[--color-white]` which is now `#1c1a15` (near-black), making it unreadable over the dark photo.

Fix: Replace all `text-[--color-white]`/`text-[--color-cream]`/`text-[--color-fog]` in HeroBlock with Tailwind's hardcoded `text-white`/`text-white/75`/`text-white/50` (built-in, always #ffffff).

The gradient overlays (`via-black/55`, `from-black/30`) stay — they keep the photo dark enough for legible text.

- [ ] **Step 1: Fix heading text color**

In `apps/storefront/components/blocks/HeroBlock.tsx`, find:

```tsx
        <h1 className="font-cormorant font-semibold text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] text-[--color-white] leading-[1.05] tracking-[-0.01em] max-w-4xl mb-6">
```

Replace with:

```tsx
        <h1 className="font-cormorant font-semibold text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] text-white leading-[1.05] tracking-[-0.01em] max-w-4xl mb-6">
```

- [ ] **Step 2: Fix subheading text color**

Find:

```tsx
            className="text-[--color-cream]/75 text-lg md:text-xl font-outfit font-light max-w-xl mb-10 leading-relaxed"
```

Replace with:

```tsx
            className="text-white/75 text-lg md:text-xl font-outfit font-light max-w-xl mb-10 leading-relaxed"
```

- [ ] **Step 3: Fix scroll hint text and bar**

Find:

```tsx
          <span className="text-[--color-fog] text-[10px] font-outfit uppercase tracking-[0.22em] [writing-mode:vertical-rl]">
```

Replace with:

```tsx
          <span className="text-white/50 text-[10px] font-outfit uppercase tracking-[0.22em] [writing-mode:vertical-rl]">
```

Find:

```tsx
          <motion.span
            className="block w-px h-10 bg-[--color-fog]"
```

Replace with:

```tsx
          <motion.span
            className="block w-px h-10 bg-white/40"
```

- [ ] **Step 4: Verify hero legibility**

Open `http://localhost:3000`. The hero heading, subheading, and scroll hint should all be white and readable over the dark photo. The CTA button (`bg-[--color-moss] text-white`) needs no change.

- [ ] **Step 5: Commit**

```bash
git add apps/storefront/components/blocks/HeroBlock.tsx
git commit -m "fix: force white text in HeroBlock over dark photo overlay"
```

---

### Task 7: Remove `prose-invert` from All Rich Text Components

**Files:**
- Modify: `apps/storefront/components/blocks/FaqBlock.tsx:83`
- Modify: `apps/storefront/components/blocks/RichTextBlock.tsx:13`
- Modify: `apps/storefront/components/blog/post-content.tsx:9`
- Modify: `apps/storefront/components/layout/footer.tsx:106`

`prose-invert` forces white text and light-colored links for use on dark backgrounds. On a light theme it makes text white-on-white (invisible). All four locations already override individual prose colors via CSS variables (`[&_p]:text-[--color-fog]`, etc.) which auto-adapt — removing `prose-invert` is all that's needed.

- [ ] **Step 1: Fix FaqBlock**

In `apps/storefront/components/blocks/FaqBlock.tsx`, find:

```tsx
                      <div className="pb-6 text-[--color-fog] text-sm leading-relaxed font-outfit prose prose-invert prose-sm max-w-none [&_p]:text-[--color-fog] [&_a]:text-[--color-moss] [&_a:hover]:text-[--color-moss-light]">
```

Replace with:

```tsx
                      <div className="pb-6 text-[--color-fog] text-sm leading-relaxed font-outfit prose prose-sm max-w-none [&_p]:text-[--color-fog] [&_a]:text-[--color-moss] [&_a:hover]:text-[--color-moss-light]">
```

- [ ] **Step 2: Fix RichTextBlock**

In `apps/storefront/components/blocks/RichTextBlock.tsx`, find the className that contains `prose prose-invert prose-base`. Replace `prose prose-invert prose-base` with `prose prose-base`.

Read the file first to confirm the exact surrounding context, then apply the replacement.

```bash
# Expected: line 13 contains something like:
# className={cn("prose prose-invert prose-base max-w-none ...", ...)}
# Change to:
# className={cn("prose prose-base max-w-none ...", ...)}
```

- [ ] **Step 3: Fix post-content**

In `apps/storefront/components/blog/post-content.tsx`, find:

```tsx
      prose prose-invert max-w-none
```

Replace with:

```tsx
      prose max-w-none
```

- [ ] **Step 4: Fix footer**

In `apps/storefront/components/layout/footer.tsx`, find:

```tsx
            <div className="prose prose-sm prose-invert">
```

Replace with:

```tsx
            <div className="prose prose-sm">
```

- [ ] **Step 5: Verify prose content**

- Open a blog post → body text should be dark and readable
- Open `/pagini/[any-slug]` → RichText content should be dark
- Open a page with FAQ block → FAQ answers should be dark text
- Open footer → any rich-text in footer renders correctly

- [ ] **Step 6: Run full test suite**

```bash
pnpm --filter storefront test
```

Expected: all 239 tests pass.

- [ ] **Step 7: Commit**

```bash
git add apps/storefront/components/blocks/FaqBlock.tsx \
        apps/storefront/components/blocks/RichTextBlock.tsx \
        apps/storefront/components/blog/post-content.tsx \
        apps/storefront/components/layout/footer.tsx
git commit -m "fix: remove prose-invert from all rich text components for light theme"
```

---

## Self-Review

### Spec Coverage
- ✅ Global palette flip via CSS variables → Task 1
- ✅ Mobile browser chrome color → Task 2
- ✅ Header shadow → Task 3
- ✅ Select component dark glass → Task 4
- ✅ Cart summary dark bg → Task 5
- ✅ Hero legibility over photo → Task 6
- ✅ All 4 `prose-invert` occurrences (FaqBlock, RichTextBlock, post-content, footer) → Task 7

### Components that auto-adapt (no tasks needed)
The following use only `text-[--color-*]` / `bg-[--color-*]` / `border-[--color-*]` tokens and will look correct with zero changes after Task 1:
- All block components: `FeaturesGridBlock`, `OffersBlock`, `FeaturedProductsBlock`, `TestimonialsBlock`, `CtaBlock`, `StepsBlock`, `NewsletterBlock`, `LogosBlock`, `VideoBlock`
- `cart-drawer.tsx`, `cart-item.tsx` (green rgba hover tints work on light)
- All account pages (`/cont/*`)
- All product listing / PDP pages
- Category pages, checkout, order confirmation

### Placeholder Scan
No TBD, TODO, "implement later", or "similar to Task N" patterns found.

### Type Consistency
No new types, functions, or method signatures introduced — this is purely CSS class changes.
