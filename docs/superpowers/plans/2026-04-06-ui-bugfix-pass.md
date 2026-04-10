# UI Bug Fix Pass — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 9 visual/functional bugs reported after the UI redesign — covering badge contrast, hero height, header depth, cart icon, cart drawer UX, missing product images, checkout NaN, and filter bar styling.

**Architecture:** Pure bug-fix pass — minimal scope, no new features. Each task targets specific files. No new abstractions unless strictly required. Fixes are verified visually and with unit tests where meaningful.

**Tech Stack:** Next.js 16 App Router, Tailwind v4, motion/react, lucide-react, shadcn/ui on Base UI, Medusa JS SDK

---

## Root Causes Identified

| Bug | Root Cause |
|---|---|
| Badge black on dark bg | `Badge variant="outline"` uses shadcn `text-foreground` (dark) — no `.dark` class on `<html>` |
| Hero too tall, text too low | `min-h-[100dvh]` ignores 64px sticky header; `items-end` pushes CTA to bottom off-screen |
| Header transparent | `--color-bg` (#0c0b09) too dark, no visual depth vs dark hero; `html` has no bg (iOS overscroll shows white) |
| Cart icon emoji | Hard-coded 🛒 emoji |
| Cart drawer spacing | SheetContent has no explicit `px` override; shadcn `Button variant="outline"` uses light-theme white bg |
| No product images in cart | `CartItem` interface lacks `thumbnail`; cart-item.tsx shows gray placeholder; order-summary uses random picsum |
| Checkout NaN lei | `item.total` is `undefined` from Medusa; `formatPrice(undefined)` → `undefined/100 = NaN` |
| Filter selects unstyled | Native `<select>` options use OS white bg and inherit white text; native arrow overlaps right padding |
| InStockToggle border disappears | Active state removes `border` class → 1px layout shift and visual loss of outline |

---

## File Map

**Modify:**
- `app/globals.css` — add `html { background-color }`, fix `@layer base` global `*` border rule interaction
- `app/(main)/layout.tsx` — add `<meta name="theme-color">` for iOS chrome color
- `components/layout/header.tsx` — cart icon + visual depth
- `components/blocks/HeroBlock.tsx` — height fix
- `components/product/product-card.tsx` — badge + real thumbnail
- `lib/utils.ts` — `formatPrice` null safety
- `context/cart-context.tsx` — add `thumbnail` to CartItem interface
- `components/cart/cart-item.tsx` — show thumbnail, fix button styles, fix spacing
- `components/cart/cart-drawer.tsx` — fix SheetContent padding
- `components/cart/cart-summary.tsx` — spacing fixes
- `components/checkout/order-summary.tsx` — use real thumbnail, formatPrice fallback
- `components/product/sort-select.tsx` — replace native select
- `components/product/category-filter.tsx` — replace native select
- `components/product/in-stock-toggle.tsx` — fix border persistence
- `components/product/price-filter.tsx` — fix Input styling

**Tests (existing, must stay green):**
- `__tests__/unit/category-filter.test.tsx`
- `__tests__/unit/in-stock-toggle.test.tsx`
- `__tests__/unit/sort-select.test.tsx`
- `__tests__/unit/product-card.test.tsx`

---

## Task 1: Fix HTML Background + Theme Meta

**Files:**
- Modify: `apps/storefront/app/globals.css` (line ~116 `@layer base`)
- Modify: `apps/storefront/app/(main)/layout.tsx`

- [ ] **Step 1: Add `html` background and theme-color meta**

In `globals.css`, inside `@layer base`, add `html` background rule:

```css
@layer base {
  html {
    @apply font-sans;
    scroll-behavior: smooth;
    background-color: var(--color-bg);   /* ← add this line */
  }

  body {
    background-color: var(--color-bg);
    color: var(--color-white);
    font-family: var(--font-family-outfit);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
```

- [ ] **Step 2: Add theme-color meta to main layout**

In `apps/storefront/app/(main)/layout.tsx`, find the existing `<head>` or metadata. Open the file first to see the current structure, then add inside the returned JSX (if using RootLayout pattern, add to the `<head>` tag or export it via Next.js metadata):

If the layout exports a `metadata` object, add:
```ts
export const metadata: Metadata = {
  // existing fields...
  other: {
    "theme-color": "#0c0b09",
  },
}
```

If it renders `<html>` directly, add to `<head>`:
```tsx
<meta name="theme-color" content="#0c0b09" />
```

- [ ] **Step 3: Verify**

Open the site in browser, scroll up on mobile/pull-to-refresh — the overscroll area should be dark `#0c0b09` matching the header.

- [ ] **Step 4: Commit**

```bash
git add apps/storefront/app/globals.css apps/storefront/app/(main)/layout.tsx
git commit -m "fix: add html dark bg for iOS overscroll + theme-color meta"
```

---

## Task 2: Header — Cart Icon + Visual Depth

**Files:**
- Modify: `apps/storefront/components/layout/header.tsx`

- [ ] **Step 1: Replace emoji cart icon with lucide-react ShoppingCart**

Open `header.tsx`. Current cart button (lines ~46-56):
```tsx
<button
  onClick={() => setIsCartOpen(!isCartOpen)}
  className="relative text-[--color-cream] hover:text-[--color-moss] transition-colors"
>
  🛒
  {itemCount > 0 && (
    <span className="absolute -top-2 -right-2 bg-[--color-moss] text-[--color-white] text-xs rounded-full w-5 h-5 flex items-center justify-center">
      {itemCount}
    </span>
  )}
</button>
```

Replace with:
```tsx
import { ShoppingCart } from "lucide-react"

// in JSX:
<button
  onClick={() => setIsCartOpen(!isCartOpen)}
  aria-label="Coș de cumpărături"
  className="relative text-[--color-cream] hover:text-[--color-moss] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-moss] rounded-sm p-1"
>
  <ShoppingCart size={20} strokeWidth={1.5} />
  {itemCount > 0 && (
    <span className="absolute -top-1 -right-1 bg-[--color-moss] text-white text-[10px] font-outfit font-semibold rounded-full w-4 h-4 flex items-center justify-center leading-none">
      {itemCount}
    </span>
  )}
</button>
```

- [ ] **Step 2: Add visual depth to header**

Change the header `className` from:
```tsx
"sticky top-0 z-40 bg-[--color-bg] border-b border-[--color-border] transition-all duration-300"
```
to:
```tsx
"sticky top-0 z-40 bg-[--color-bg]/95 backdrop-blur-md border-b border-[--color-border]/60 transition-all duration-300"
```

- [ ] **Step 3: Verify visually**

The header should show a crisp icon (not emoji), with a subtle frosted-glass depth that separates it from the hero below.

- [ ] **Step 4: Commit**

```bash
git add apps/storefront/components/layout/header.tsx
git commit -m "fix: replace cart emoji with ShoppingCart icon, add header backdrop-blur"
```

---

## Task 3: Hero Height — Fix CTA Visibility

**Files:**
- Modify: `apps/storefront/components/blocks/HeroBlock.tsx`

**Problem:** `min-h-[100dvh]` + `items-end` = CTA is at bottom of section which is 64px below viewport bottom (hero starts after the 64px sticky header, so it's 100dvh + 64px tall total). User must scroll to see the CTA text.

- [ ] **Step 1: Fix hero height and content position**

In `HeroBlock.tsx`, change line 26:
```tsx
// FROM:
<section className="relative min-h-[100dvh] flex items-end overflow-hidden">

// TO:
<section className="relative min-h-[calc(100dvh-4rem)] flex items-end overflow-hidden">
```

Also adjust the content bottom padding from `pb-20 md:pb-28` to `pb-16 md:pb-20` so the text sits at a nicer vertical position:
```tsx
// FROM:
<div className="relative z-10 w-full px-6 sm:px-10 pb-20 md:pb-28 max-w-7xl mx-auto">

// TO:
<div className="relative z-10 w-full px-6 sm:px-10 pb-16 md:pb-24 max-w-7xl mx-auto">
```

- [ ] **Step 2: Verify**

The hero CTA and heading should be visible WITHOUT scrolling when the page loads. The hero image should fill from the header bottom to the viewport bottom.

- [ ] **Step 3: Commit**

```bash
git add apps/storefront/components/blocks/HeroBlock.tsx
git commit -m "fix: hero height accounts for sticky header so CTA is visible without scroll"
```

---

## Task 4: Product Card — Badge + Real Thumbnail

**Files:**
- Modify: `apps/storefront/components/product/product-card.tsx`

**Problems:**
1. `Badge variant="outline"` → `text-foreground` = near-black (shadcn light theme, no `.dark` class on html)
2. Product image uses random picsum URL instead of real Medusa thumbnail

- [ ] **Step 1: Write failing test for badge styling**

In `__tests__/unit/product-card.test.tsx`, check that the badge is not using the `outline` variant (which gives wrong colors). Read the existing test file first to understand its structure, then add:

```tsx
it("renders category badge with brand-styled pill, not shadcn outline variant", () => {
  // Render a product card
  const mockProduct = {
    id: "prod_1",
    handle: "test-handle",
    title: "Test Product",
    variants: [{ calculated_price: { calculated_amount: 5000, original_amount: 5000 } }],
    categories: [{ name: "Mulinete" }],
    metadata: {},
    thumbnail: null,
  }
  const { container } = render(<ProductCard product={mockProduct} />)
  // The badge should have moss-themed classes, not shadcn's `text-foreground`
  const badge = container.querySelector("[data-testid='category-badge']")
  expect(badge).not.toBeNull()
  expect(badge?.className).not.toContain("text-foreground")
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
pnpm --filter storefront test -- --testPathPattern="product-card" -t "badge"
```

Expected: FAIL (element not found because `data-testid` doesn't exist yet)

- [ ] **Step 3: Replace Badge with custom brand-styled pill**

In `product-card.tsx`:

1. Remove the `Badge` import
2. Replace the `<Badge variant="outline">` element with:

```tsx
<span
  data-testid="category-badge"
  className="inline-block mb-2 px-2 py-0.5 text-[10px] font-outfit uppercase tracking-[0.12em] text-[--color-moss-light] border border-[--color-moss]/25 bg-[--color-moss]/8"
>
  {category}
</span>
```

3. Fix the product image to use the real `thumbnail` from Medusa instead of picsum:

```tsx
const thumbnail = prod.thumbnail as string | null | undefined

// In JSX replace the Image src:
// FROM:
src={`https://picsum.photos/300/200?random=${id}`}

// TO (keep picsum as fallback for seeded demo data without images):
src={thumbnail ?? `https://picsum.photos/300/200?random=${id}`}
```

- [ ] **Step 4: Run test — expect pass**

```bash
pnpm --filter storefront test -- --testPathPattern="product-card" -t "badge"
```

Expected: PASS

- [ ] **Step 5: Run full product-card test suite**

```bash
pnpm --filter storefront test -- --testPathPattern="product-card"
```

Expected: all tests pass

- [ ] **Step 6: Commit**

```bash
git add apps/storefront/components/product/product-card.tsx
git commit -m "fix: replace Badge outline with brand-styled category pill, use real thumbnail"
```

---

## Task 5: formatPrice Null Safety + CartItem Thumbnail Interface

**Files:**
- Modify: `apps/storefront/lib/utils.ts`
- Modify: `apps/storefront/context/cart-context.tsx`

**Problems:**
1. `formatPrice(undefined)` = "NaN lei" in checkout
2. `CartItem` interface missing `thumbnail` field needed for cart images

- [ ] **Step 1: Write failing test for formatPrice null safety**

Create or open `__tests__/unit/format-price.test.ts`:

```ts
import { formatPrice } from "@/lib/utils"

describe("formatPrice", () => {
  it("formats a valid price in bani to lei", () => {
    expect(formatPrice(5000)).toBe("50,00 lei")
  })

  it("returns zero formatted string for null", () => {
    expect(formatPrice(null as any)).toBe("0,00 lei")
  })

  it("returns zero formatted string for undefined", () => {
    expect(formatPrice(undefined as any)).toBe("0,00 lei")
  })

  it("returns zero formatted string for NaN", () => {
    expect(formatPrice(NaN)).toBe("0,00 lei")
  })
})
```

- [ ] **Step 2: Run test to confirm failures**

```bash
pnpm --filter storefront test -- --testPathPattern="format-price"
```

Expected: 3 failures (null/undefined/NaN cases)

- [ ] **Step 3: Fix formatPrice in utils.ts**

```ts
export function formatPrice(price: number | null | undefined): string {
  if (price == null || isNaN(price as number)) return "0,00 lei"
  return (price / 100).toLocaleString("ro-RO", {
    minimumFractionDigits: 2,
  }) + " lei"
}
```

- [ ] **Step 4: Run test — expect pass**

```bash
pnpm --filter storefront test -- --testPathPattern="format-price"
```

Expected: all 4 tests pass

- [ ] **Step 5: Add thumbnail to CartItem interface**

In `context/cart-context.tsx`, update the `CartItem` interface:

```ts
export interface CartItem {
  id: string
  variant_id: string
  product_title: string
  variant_title: string | null
  quantity: number
  unit_price: number
  total: number
  thumbnail?: string | null   // ← add this field
}
```

- [ ] **Step 6: Commit**

```bash
git add apps/storefront/lib/utils.ts apps/storefront/context/cart-context.tsx apps/storefront/__tests__/unit/format-price.test.ts
git commit -m "fix: formatPrice handles null/undefined/NaN; add thumbnail to CartItem interface"
```

---

## Task 6: Cart Drawer — Image, Button Styles, Spacing

**Files:**
- Modify: `apps/storefront/components/cart/cart-item.tsx`
- Modify: `apps/storefront/components/cart/cart-drawer.tsx`
- Modify: `apps/storefront/components/cart/cart-summary.tsx`

**Problems:**
1. Product image is gray placeholder — need to render `item.thumbnail`
2. +/− buttons use `Button variant="outline"` which has white bg (shadcn light theme vars)
3. "Șterge" (delete) button hugs right edge of the drawer (SheetContent has default 24px padding)
4. Subtotal row and checkout button need proper inset padding from right edge

- [ ] **Step 1: Fix cart-item.tsx — thumbnail + button styles + spacing**

Replace the entire file content with:

```tsx
"use client"

import Image from "next/image"
import { m } from "motion/react"
import { X, Minus, Plus } from "lucide-react"
import { itemVariants } from "@/variants/drawer"
import { useCart } from "@/hooks/use-cart"
import { CartItem as CartItemData } from "@/context/cart-context"
import { formatPrice } from "@/lib/utils"

interface CartItemProps {
  item: CartItemData
  index: number
}

export function CartItem({ item, index }: CartItemProps) {
  const { removeItem, updateQuantity } = useCart()

  const handleIncrease = () => updateQuantity(item.id, item.quantity + 1)
  const handleDecrease = () => {
    if (item.quantity - 1 <= 0) {
      removeItem(item.id)
    } else {
      updateQuantity(item.id, item.quantity - 1)
    }
  }

  return (
    <m.div
      variants={itemVariants}
      custom={index}
      className="flex gap-3 py-4 border-b border-[--color-border] last:border-b-0"
    >
      {/* Thumbnail */}
      <div className="w-16 h-16 bg-[--color-surface] flex-shrink-0 overflow-hidden">
        {item.thumbnail ? (
          <Image
            src={item.thumbnail}
            alt={item.product_title}
            width={64}
            height={64}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="w-full h-full bg-[--color-surface-2]" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <h3 className="text-sm font-outfit font-medium text-[--color-white] leading-snug line-clamp-2">
          {item.product_title}
        </h3>
        {item.variant_title && (
          <span className="text-[10px] font-outfit text-[--color-fog]">
            {item.variant_title}
          </span>
        )}
        <p className="text-sm font-outfit font-semibold text-[--color-moss] mt-auto">
          {formatPrice(item.unit_price)}
        </p>

        {/* Quantity controls */}
        <div className="flex items-center gap-2 mt-1">
          <button
            onClick={handleDecrease}
            aria-label="Scade cantitate"
            className="w-6 h-6 border border-[--color-border] hover:border-[--color-moss]/50 flex items-center justify-center text-[--color-fog] hover:text-[--color-moss] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[--color-moss]"
          >
            <Minus size={11} />
          </button>
          <span className="text-sm font-outfit font-medium text-[--color-white] w-6 text-center tabular-nums">
            {item.quantity}
          </span>
          <button
            onClick={handleIncrease}
            aria-label="Crește cantitate"
            className="w-6 h-6 border border-[--color-border] hover:border-[--color-moss]/50 flex items-center justify-center text-[--color-fog] hover:text-[--color-moss] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[--color-moss]"
          >
            <Plus size={11} />
          </button>
        </div>
      </div>

      {/* Remove button — top-aligned, not right edge */}
      <button
        onClick={() => removeItem(item.id)}
        aria-label="Șterge din coș"
        className="flex-shrink-0 w-7 h-7 flex items-center justify-center text-[--color-fog]/50 hover:text-[--color-moss] transition-colors duration-200 self-start mt-0.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[--color-moss]"
      >
        <X size={14} />
      </button>
    </m.div>
  )
}
```

- [ ] **Step 2: Fix cart-drawer.tsx — add horizontal padding to SheetContent**

In `cart-drawer.tsx`, update SheetContent className:

```tsx
// FROM:
<SheetContent side="right" className="bg-[--color-bg-light] border-[--color-border] max-w-md">

// TO:
<SheetContent side="right" className="bg-[--color-bg-light] border-[--color-border] max-w-md px-5">
```

- [ ] **Step 3: Fix cart-summary.tsx — ensure proper padding**

In `cart-summary.tsx`, the container already uses `border-t pt-4`. Verify it looks correct by checking the full rendered drawer. No code change needed here unless spacing is still off after Step 2.

- [ ] **Step 4: Verify visually**

Open the site, add a product to cart, open the cart drawer:
- Product thumbnail should show (real image or gray block if no thumbnail)
- +/− icons should be dark-bordered small squares, not white buttons
- Delete (X) icon should be top-right of each item, not touching the drawer edge
- Subtotal and "Mergi la coș" button should have proper inset from right

- [ ] **Step 5: Commit**

```bash
git add apps/storefront/components/cart/cart-item.tsx apps/storefront/components/cart/cart-drawer.tsx
git commit -m "fix: cart item shows thumbnail, custom qty buttons, X icon replaces Șterge text"
```

---

## Task 7: Checkout Order Summary — Real Thumbnails + NaN Fix

**Files:**
- Modify: `apps/storefront/components/checkout/order-summary.tsx`

**Problems:**
1. `formatPrice(item.total)` → NaN when `item.total` is undefined (fixed by Task 5 formatPrice)
2. Uses random picsum images for products — need real thumbnail from cart item

- [ ] **Step 1: Fix order-summary.tsx**

Update the items section (lines 25-41):

```tsx
{items.map((item: CartItem) => (
  <div key={item.id} className="flex gap-3 text-sm">
    <div className="relative h-14 w-14 bg-[--color-surface] flex-shrink-0 overflow-hidden">
      {item.thumbnail ? (
        <Image
          src={item.thumbnail}
          alt={item.product_title}
          fill
          sizes="56px"
          className="object-cover"
        />
      ) : (
        <div className="w-full h-full bg-[--color-surface-2]" />
      )}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[--color-cream] font-outfit leading-snug line-clamp-2">{item.product_title}</p>
      <p className="text-[--color-fog] text-xs mt-0.5">{item.quantity}×</p>
    </div>
    <p className="text-[--color-mud] font-outfit flex-shrink-0">
      {formatPrice(item.total ?? item.unit_price * item.quantity)}
    </p>
  </div>
))}
```

- [ ] **Step 2: Verify**

Open checkout page (with items in cart). Product prices should show as "X,XX lei" (not "NaN lei"). Thumbnails should show (real image or neutral surface block).

- [ ] **Step 3: Commit**

```bash
git add apps/storefront/components/checkout/order-summary.tsx
git commit -m "fix: checkout order summary uses real thumbnail and NaN-safe formatPrice"
```

---

## Task 8: Filter Bar — Native Selects + InStockToggle

**Files:**
- Modify: `apps/storefront/components/product/sort-select.tsx`
- Modify: `apps/storefront/components/product/category-filter.tsx`
- Modify: `apps/storefront/components/product/in-stock-toggle.tsx`
- Modify: `apps/storefront/components/product/price-filter.tsx`

**Problems:**
1. Native `<select>` dropdown options: browser renders them with OS-default bg (white) + the select's text color (fog/white) → white text on white bg unreadable
2. Sort select: `ml-auto` + not enough right padding for native browser arrow → arrow clips to edge
3. InStockToggle: when toggled ON, `border` class removed → 1px layout shift + outline disappears
4. PriceFilter: shadcn `Input` component uses `--background` (white) for bg

**Note on native selects:** Native `<option>` dropdown cannot be styled via CSS in most browsers. The fix is to add explicit `background-color` and `color` on the `<select>` element AND on `<option>` elements — Chromium-based browsers DO respect `option { background: ...; color: ... }`.

- [ ] **Step 1: Write test for InStockToggle border persistence**

Read `__tests__/unit/in-stock-toggle.test.tsx` to understand current test structure, then add:

```tsx
it("maintains consistent border size in both active and inactive states", () => {
  const { rerender, container } = render(
    <InStockToggle inStock={false} />
  )
  const track = container.querySelector(".rounded-full")
  const inactiveClass = track?.className ?? ""

  rerender(<InStockToggle inStock={true} />)
  const activeClass = container.querySelector(".rounded-full")?.className ?? ""

  // Both states should include "border" to avoid layout shift
  expect(inactiveClass).toContain("border")
  expect(activeClass).toContain("border")
})
```

- [ ] **Step 2: Run test — expect fail**

```bash
pnpm --filter storefront test -- --testPathPattern="in-stock-toggle" -t "border"
```

Expected: FAIL (active state has no border class)

- [ ] **Step 3: Fix InStockToggle — persistent border**

In `in-stock-toggle.tsx`, update the track span:

```tsx
// FROM:
<span
  className={`relative inline-flex w-8 h-4 rounded-full transition-colors ${
    inStock
      ? "bg-[--color-moss]"
      : "bg-[--color-surface] border border-[--color-fog]/30"
  }`}
>

// TO:
<span
  className={`relative inline-flex w-8 h-4 rounded-full border transition-colors ${
    inStock
      ? "bg-[--color-moss] border-[--color-moss]"
      : "bg-[--color-surface] border-[--color-fog]/30"
  }`}
>
```

- [ ] **Step 4: Run test — expect pass**

```bash
pnpm --filter storefront test -- --testPathPattern="in-stock-toggle"
```

Expected: all tests pass

- [ ] **Step 5: Fix sort-select.tsx — right padding + option colors**

```tsx
// FROM:
<select
  value={sort || "relevance"}
  onChange={handleChange}
  className="ml-auto bg-[--color-surface] border border-[--color-fog]/20 text-sm text-[--color-fog] rounded px-3 py-1.5 focus:outline-none focus:border-[--color-moss] cursor-pointer"
>
  {SORT_OPTIONS.map((opt) => (
    <option key={opt.value} value={opt.value}>
      {opt.label}
    </option>
  ))}
</select>

// TO:
<select
  value={sort || "relevance"}
  onChange={handleChange}
  className="ml-auto bg-[--color-surface] border border-[--color-fog]/20 text-sm text-[--color-fog] px-3 pr-8 py-1.5 focus:outline-none focus:border-[--color-moss] cursor-pointer appearance-auto"
>
  {SORT_OPTIONS.map((opt) => (
    <option key={opt.value} value={opt.value} className="bg-[#1a1814] text-[#c4bfb0]">
      {opt.label}
    </option>
  ))}
</select>
```

- [ ] **Step 6: Fix category-filter.tsx — same option colors**

```tsx
// FROM:
<select
  value={category || ""}
  onChange={handleChange}
  className="bg-[--color-surface] border border-[--color-fog]/20 text-sm text-[--color-fog] rounded px-3 py-1.5 focus:outline-none focus:border-[--color-moss] cursor-pointer"
>
  <option value="">Toate categoriile</option>
  {categories.map((cat) => (
    <option key={cat.id} value={cat.id}>
      {cat.name}
    </option>
  ))}
</select>

// TO:
<select
  value={category || ""}
  onChange={handleChange}
  className="bg-[--color-surface] border border-[--color-fog]/20 text-sm text-[--color-fog] px-3 pr-8 py-1.5 focus:outline-none focus:border-[--color-moss] cursor-pointer appearance-auto"
>
  <option value="" className="bg-[#1a1814] text-[#c4bfb0]">Toate categoriile</option>
  {categories.map((cat) => (
    <option key={cat.id} value={cat.id} className="bg-[#1a1814] text-[#c4bfb0]">
      {cat.name}
    </option>
  ))}
</select>
```

- [ ] **Step 7: Fix price-filter.tsx — Input dark styling**

The shadcn `Input` uses `bg-background` (white in light theme). Override explicitly:

```tsx
// FROM:
<Input
  type="number"
  placeholder="Preț min"
  value={minPrice}
  onChange={(e) => setMinPrice(e.target.value)}
  className="w-24 bg-[--color-surface] border-[--color-fog]/20 text-[--color-fog] text-sm"
/>
<span className="text-[--color-fog]/40 text-sm">–</span>
<Input
  type="number"
  placeholder="Preț max"
  value={maxPrice}
  onChange={(e) => setMaxPrice(e.target.value)}
  className="w-24 bg-[--color-surface] border-[--color-fog]/20 text-[--color-fog] text-sm"
/>

// TO (force bg and text, override shadcn defaults):
<Input
  type="number"
  placeholder="Preț min"
  value={minPrice}
  onChange={(e) => setMinPrice(e.target.value)}
  className="w-24 [background:var(--color-surface)] border-[--color-fog]/20 text-[--color-fog] placeholder:text-[--color-fog]/40 text-sm focus-visible:ring-[--color-moss]"
/>
<span className="text-[--color-fog]/40 text-sm">–</span>
<Input
  type="number"
  placeholder="Preț max"
  value={maxPrice}
  onChange={(e) => setMaxPrice(e.target.value)}
  className="w-24 [background:var(--color-surface)] border-[--color-fog]/20 text-[--color-fog] placeholder:text-[--color-fog]/40 text-sm focus-visible:ring-[--color-moss]"
/>
```

- [ ] **Step 8: Run all filter tests**

```bash
pnpm --filter storefront test -- --testPathPattern="(category-filter|sort-select|in-stock-toggle)"
```

Expected: all pass

- [ ] **Step 9: Verify visually on /produse page**

- Sort dropdown arrow should have enough right padding
- Opening category/sort dropdowns: options should show dark bg with legible text (Chromium) or at minimum system default without white-on-white issue
- InStockToggle: both states keep a consistent border — no visual shift on click
- Price inputs: dark background, fog-colored placeholder text

- [ ] **Step 10: Commit**

```bash
git add apps/storefront/components/product/sort-select.tsx apps/storefront/components/product/category-filter.tsx apps/storefront/components/product/in-stock-toggle.tsx apps/storefront/components/product/price-filter.tsx
git commit -m "fix: filter bar select padding, option dark colors, InStockToggle persistent border, Input dark styling"
```

---

## Self-Review

### Spec Coverage

| Issue | Task |
|---|---|
| Badge black on dark bg | Task 4 ✓ |
| Hero too tall, text too low | Task 3 ✓ |
| Header transparent / iOS overscroll | Task 1 + Task 2 ✓ |
| Cart emoji icon | Task 2 ✓ |
| Cart drawer spacing + button styles | Task 6 ✓ |
| Missing product images in cart + checkout | Task 6 + Task 7 ✓ |
| Checkout NaN lei | Task 5 + Task 7 ✓ |
| Shipping calculation | NOT a bug — shipping-step.tsx correctly uses `formatPrice(option.amount ?? 0)` and `selectShippingAction`. The `cart.shipping_total` in order-summary shows 0 until shipping selected (expected). |
| Filter sort arrow clipped | Task 8 ✓ |
| Filter dropdowns white/unstyled | Task 8 ✓ |
| Price min/max inputs unstyled | Task 8 ✓ |
| InStockToggle outline disappears | Task 8 ✓ |

### Additional Issues Not Mentioned — Found During Review

- [ ] **Cart page** (`cart-page-content.tsx`): Uses `CartItem` component, which after Task 6 will show thumbnails. No separate fix needed — inherits the fixed CartItem.
- [ ] **formatPrice in cart-summary.tsx** (`cart.subtotal`, `cart.total`): These come from Medusa cart which always populates totals on the cart level (not line items), so shouldn't NaN. But after Task 5 fix, they're safe anyway.

### Placeholder Scan

No TBD, TODO, or undefined steps found.

### Type Consistency

- `CartItem.thumbnail?: string | null` added in Task 5, used in Tasks 6 + 7 ✓
- `formatPrice(price: number | null | undefined)` defined in Task 5, called throughout ✓
- `item.total ?? item.unit_price * item.quantity` in Task 7 — both fields exist in CartItem interface ✓
