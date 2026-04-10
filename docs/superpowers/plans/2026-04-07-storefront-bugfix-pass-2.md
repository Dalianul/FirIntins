# Storefront Bugfix Pass 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 5 UI/UX bugs: sort API error, select hover/open states, header stacking + content padding, dropdown z-index vs header, and cart thumbnail images.

**Architecture:** Minimal targeted fixes — no refactoring. Each task touches 1-2 files. All changes are in `apps/storefront/`. No backend changes needed.

**Tech Stack:** Next.js 16 App Router, Tailwind v4, Base UI `@base-ui/react` selects, Framer Motion (`motion/react`), Medusa v2 JS SDK.

---

## File Map

| File | What changes |
|---|---|
| `apps/storefront/lib/medusa/queries.ts` | SORT_ORDER_MAP values: objects → strings; ProductParams.order type |
| `apps/storefront/components/ui/select.tsx` | Hover + open states on SelectTrigger; lower popup z-index to z-40 |
| `apps/storefront/components/layout/page-transition.tsx` | Add `relative z-0 pt-16` to `<m.main>` |
| `apps/storefront/components/layout/header.tsx` | Raise header to `z-50` |
| `apps/storefront/actions/cart.ts` | Expand `+items.thumbnail` on cart retrieve/mutate |

---

### Task 1: Fix sort order API error

**Root cause:** `SORT_ORDER_MAP` in `queries.ts:24` sends `{ title: 'ASC' }` as an object. Medusa v2 store API expects `order` as a string (`"title"` for ASC, `"-title"` for DESC). The API responds with `"Expected type: 'string' for field 'order', got: 'object'"`.

**Files:**
- Modify: `apps/storefront/lib/medusa/queries.ts` (lines 18, 24-28)

- [ ] **Step 1: Change ProductParams.order type and SORT_ORDER_MAP values**

Open `apps/storefront/lib/medusa/queries.ts`. Make two changes:

**Line 18** — change the `order` type:
```ts
// Before:
order?: Record<string, string>

// After:
order?: string
```

**Lines 24-28** — change SORT_ORDER_MAP values to Medusa v2 string format (prefix `-` for DESC):
```ts
// Before:
export const SORT_ORDER_MAP: Record<string, Record<string, string>> = {
  newest:     { created_at: 'DESC' },
  title_asc:  { title: 'ASC' },
  title_desc: { title: 'DESC' },
}

// After:
export const SORT_ORDER_MAP: Record<string, string> = {
  newest:     '-created_at',
  title_asc:  'title',
  title_desc: '-title',
}
```

- [ ] **Step 2: Run tests**

```bash
pnpm --filter storefront test
```
Expected: all 227 tests pass (no tests cover SORT_ORDER_MAP directly; this verifies no regressions).

- [ ] **Step 3: Commit**

```bash
git add apps/storefront/lib/medusa/queries.ts
git commit -m "fix: sort order sends string not object to Medusa v2 store API"
```

---

### Task 2: Add hover and open states to SelectTrigger

**Root cause:** SelectTrigger in `components/ui/select.tsx:25` has no hover or active-open styling. Dropdowns feel unresponsive because the trigger gives no visual feedback on interaction.

**Files:**
- Modify: `apps/storefront/components/ui/select.tsx` (lines 24-27)

- [ ] **Step 1: Add hover and aria-expanded states to SelectTrigger className**

In `apps/storefront/components/ui/select.tsx`, the `SelectTrigger` function — update the `cn(...)` call to add hover and open-state classes. Replace the existing className block:

```tsx
className={cn(
  "inline-flex w-auto items-center justify-between gap-2 [background:var(--color-surface)] border border-[--color-fog]/20 text-sm text-[--color-fog] rounded px-3 py-1.5 focus:outline-none focus:border-[--color-moss] cursor-pointer whitespace-nowrap transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed",
  "hover:bg-[--color-bg-light] hover:border-[--color-fog]/40 hover:text-[--color-white]",
  "aria-expanded:bg-[--color-bg-light] aria-expanded:border-[--color-moss]/60 aria-expanded:text-[--color-white]",
  className
)}
```

- [ ] **Step 2: Run tests**

```bash
pnpm --filter storefront test
```
Expected: all tests pass.

- [ ] **Step 3: Commit**

```bash
git add apps/storefront/components/ui/select.tsx
git commit -m "fix: add hover and open states to SelectTrigger"
```

---

### Task 3: Fix header stacking + content padding + dropdown z-order

**Root causes:**
1. `<m.main>` in `PageTransition` animates `opacity: 0 → 1`, which creates a CSS stacking context. Since `<m.main>` follows `<header>` in DOM order and has no explicit z-index, it can paint on top of the header during animation (and sometimes after, when the stacking context is retained). Fix: `relative z-0` on `<m.main>` — gives it z-index 0, so header z-40 is always above it.
2. No `pt-16` on page content means all pages start at y=0 behind the sticky 64px header. Titles, filter bars, and page content all start under the header. Fix: add `pt-16` to `<m.main>`.
3. Dropdown portal is `z-[9999]` — it renders above the header (z-40). When a filter is open near the top of the page, the dropdown covers the header. Fix: raise header to `z-50`, lower dropdown to `z-40` (header > dropdown > page content).

**Files:**
- Modify: `apps/storefront/components/layout/page-transition.tsx`
- Modify: `apps/storefront/components/layout/header.tsx`
- Modify: `apps/storefront/components/ui/select.tsx`

- [ ] **Step 1: Fix PageTransition — add z-0 and pt-16**

Replace the full contents of `apps/storefront/components/layout/page-transition.tsx`:

```tsx
"use client"

import { m } from "motion/react"

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <m.main
      className="relative z-0 min-h-screen pt-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </m.main>
  )
}
```

`relative z-0` makes the stacking context explicit at z=0 in the root — always below header z-50. `pt-16` (64px) offsets all page content below the sticky header.

- [ ] **Step 2: Raise header z-index to z-50**

In `apps/storefront/components/layout/header.tsx`, line 16, change `z-40` → `z-50`:

```tsx
// Before:
<header className="sticky top-0 z-40 bg-[--color-bg] border-b border-[--color-border]/60 transition-all duration-300">

// After:
<header className="sticky top-0 z-50 bg-[--color-bg] border-b border-[--color-border]/60 transition-all duration-300">
```

- [ ] **Step 3: Lower dropdown portal to z-40 (below header z-50, above page content)**

In `apps/storefront/components/ui/select.tsx`, inside `SelectContent`, change the popup className:

```tsx
// Before:
"z-[9999] min-w-[var(--anchor-width,8rem)] ..."

// After:
"z-40 min-w-[var(--anchor-width,8rem)] ..."
```

**Why this works end-to-end:**
- Root stacking context: `<header>` z=50 > dropdown portal z=40 > `<m.main>` z=0
- Inside `<m.main>` stacking context: product card badges z=10, hearts z=10 — these are contained within z=0 and cannot reach z=40 or z=50. Product card overlays no longer bleed through open dropdowns.

- [ ] **Step 4: Run tests**

```bash
pnpm --filter storefront test
```
Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add apps/storefront/components/layout/page-transition.tsx apps/storefront/components/layout/header.tsx apps/storefront/components/ui/select.tsx
git commit -m "fix: header z-50, page pt-16, dropdown z-40, isolate product card stacking context"
```

---

### Task 4: Fix cart item thumbnails — expand fields in cart actions

**Root cause:** `retrieveCart` and cart mutation actions call the Medusa SDK without field expansion. Medusa v2 does not include `thumbnail` on cart line items by default — it must be explicitly requested via `fields: "+items.thumbnail"`. Without it, `item.thumbnail` is `undefined` and the `<Image>` in `cart-item.tsx` renders nothing.

**Files:**
- Modify: `apps/storefront/actions/cart.ts`

- [ ] **Step 1: Add CART_FIELDS constant and apply to retrieve + mutations**

Replace the full contents of `apps/storefront/actions/cart.ts`:

```ts
"use server"

import { medusa } from "@/lib/medusa/client"

const CART_FIELDS = "+items.thumbnail"

export async function addItemToCart(
  cartId: string,
  variantId: string,
  quantity: number
) {
  try {
    const { cart } = await (medusa.store.cart.createLineItem as Function)(cartId, {
      variant_id: variantId,
      quantity,
    }, { fields: CART_FIELDS })
    return { success: true, cart }
  } catch (error) {
    console.error("addItemToCart error:", error)
    throw error
  }
}

export async function removeItemFromCart(cartId: string, lineItemId: string) {
  try {
    await medusa.store.cart.deleteLineItem(cartId, lineItemId)
    // deleteLineItem has no fields param — retrieve fresh cart with thumbnail expanded
    const cart = await retrieveCart(cartId)
    return { success: true, cart }
  } catch (error) {
    console.error("removeItemFromCart error:", error)
    throw error
  }
}

export async function updateCartQuantity(
  cartId: string,
  lineItemId: string,
  quantity: number
) {
  try {
    const { cart } = await (medusa.store.cart.updateLineItem as Function)(cartId, lineItemId, {
      quantity,
    }, { fields: CART_FIELDS })
    return { success: true, cart }
  } catch (error) {
    console.error("updateCartQuantity error:", error)
    throw error
  }
}

export async function createCart() {
  try {
    const { regions } = await medusa.store.region.list()
    const region_id = regions[0]?.id
    const { cart } = await medusa.store.cart.create({ region_id })
    return cart
  } catch (error) {
    console.error("createCart error:", error)
    throw error
  }
}

export async function retrieveCart(cartId: string) {
  try {
    const { cart } = await (medusa.store.cart.retrieve as Function)(cartId, { fields: CART_FIELDS })
    return cart
  } catch (error) {
    return null
  }
}
```

Note: `removeItemFromCart` now calls `retrieveCart` after deletion (one extra request) because `deleteLineItem` returns a deletion response, not a full cart with selectable fields. All other mutations use the `as Function` cast pattern established in `CLAUDE.md` for SDK type limitations.

- [ ] **Step 2: Run tests**

```bash
pnpm --filter storefront test
```
Expected: all tests pass.

- [ ] **Step 3: Commit**

```bash
git add apps/storefront/actions/cart.ts
git commit -m "fix: expand +items.thumbnail in cart actions so cart drawer shows images"
```

---

## Self-Review

**Spec coverage:**
- Sort API error (`title_asc` → object error) → Task 1 ✓
- No hover states on filter dropdowns → Task 2 ✓
- Product card badges/hearts bleed through dropdowns → Task 3 (stacking context isolation) ✓
- Black stripe / header invisible on scroll → Task 3 (z-0 on PageTransition) ✓
- No top padding — content starts under header → Task 3 (pt-16 on PageTransition) ✓
- Dropdown filter appears over header → Task 3 (header z-50, dropdown z-40) ✓
- Page titles overlap header → Task 3 (pt-16) ✓
- Cart missing thumbnails → Task 4 ✓

**Placeholder scan:** No TBDs or missing code snippets.

**Type consistency:**
- `SORT_ORDER_MAP` is now `Record<string, string>`, referenced as `SORT_ORDER_MAP[sort]` in `produse/page.tsx` — passes `string` where `order?: string` expects. ✓
- `CART_FIELDS` constant used consistently across all cart operations. ✓
- `z-0` / `z-40` / `z-50` are Tailwind utility classes with deterministic specificity. ✓
