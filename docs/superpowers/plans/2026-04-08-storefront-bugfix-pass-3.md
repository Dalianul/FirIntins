# Storefront Bugfix Pass 3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 5 isolated UI/logic bugs: hero top padding, cart item qty badge, cart drawer footer, checkout product images, and the broken `removePromoCodeAction` server action.

**Architecture:** All changes are surgical edits to existing files — no new files or abstractions needed. Tasks are fully independent and can be executed in any order except Task 5 (promo fix) which must be done after reading the investigation notes below.

**Tech Stack:** Next.js 16 App Router, React, Tailwind v4, Medusa JS SDK, TypeScript

---

## Investigation Notes: SUMMER20 and the Promotions System

Before implementing Task 5, read this section.

Medusa v2 has two distinct discount mechanisms:

1. **Automatic price rules / campaigns** — applied server-side to line items based on product/customer/date conditions. These show up as `discount_total` on the cart but **do NOT appear in `cart.promotions`**. They cannot be "removed" via the promotions API — they're pricing rules, not applied codes.

2. **Manual promo codes** — applied client-side via `POST /store/carts/:id/promotions`. These appear in `cart.promotions[]` as `{ code: string }` objects and CAN be removed via `DELETE /store/carts/:id/promotions`.

**What SUMMER20 is:** An automatic campaign promotion (type 1). It reduces item prices via price rules configured in the Medusa admin. It shows as `-20%` on cart items and contributes to `discount_total`. It does NOT appear in `cart.promotions`. So there is no "remove SUMMER20" button shown to the user — the promo code input at checkout only shows codes from `cart.promotions`, which SUMMER20 is not in.

**The actual bug:** `(medusa.store.cart as any).removePromotions()` throws `removePromotions is not a function` at runtime because the Medusa JS SDK simply doesn't implement this method. The fix is a direct `fetch` call to `DELETE /store/carts/{cartId}/promotions` with the Medusa backend URL and publishable API key.

---

## File Map

| File | Change |
|------|--------|
| `apps/storefront/components/blocks/HeroBlock.tsx` | Line 53: `py-16` → `pb-16` |
| `apps/storefront/components/cart/cart-item.tsx` | Remove lines 48–50 (qty badge `<span>`) |
| `apps/storefront/components/cart/cart-summary.tsx` | Remove promo row, replace CTA + continue with two link buttons, remove `onClose` prop |
| `apps/storefront/components/cart/cart-drawer.tsx` | Remove `onClose` prop from `<CartSummary />` |
| `apps/storefront/components/checkout/order-summary.tsx` | Add picsum fallback for missing thumbnails |
| `apps/storefront/actions/checkout.ts` | Fix `removePromoCodeAction` to use direct `fetch` |

---

## Task 1: Hero — Remove Top Padding

**Files:**
- Modify: `apps/storefront/components/blocks/HeroBlock.tsx:53`

- [ ] **Step 1: Edit the content wrapper class**

In `HeroBlock.tsx` line 53, change `py-16` to `pb-16`:

```tsx
// Before:
<div className="relative z-10 w-full px-6 sm:px-10 py-16 max-w-7xl mx-auto">

// After:
<div className="relative z-10 w-full px-6 sm:px-10 pb-16 max-w-7xl mx-auto">
```

- [ ] **Step 2: Verify visually**

Open the homepage at `http://localhost:3000`. The hero content (eyebrow line + heading) should now sit closer to the top of the hero image, with no extra white/dark gap above it. Bottom padding remains unchanged.

- [ ] **Step 3: Commit**

```bash
git add apps/storefront/components/blocks/HeroBlock.tsx
git commit -m "fix: remove top padding from hero content wrapper"
```

---

## Task 2: Cart Item — Remove Qty Badge

**Files:**
- Modify: `apps/storefront/components/cart/cart-item.tsx:48-50`

- [ ] **Step 1: Remove the badge `<span>`**

In `cart-item.tsx`, delete lines 48–50 entirely. The `<div className="relative flex-shrink-0">` wrapper stays — only the `<span>` inside it (after the thumbnail div) is removed:

```tsx
// Remove this block (lines 48-50):
<span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[--color-moss] text-white text-[9px] font-bold rounded-full flex items-center justify-center border-[1.5px] border-[--color-bg-light]">
  {item.quantity}
</span>
```

After removal the thumbnail block should look like:

```tsx
{/* Thumbnail + qty badge */}
<div className="relative flex-shrink-0">
  <div className="w-[60px] h-[60px] bg-[--color-surface] border border-[--color-border] rounded-md overflow-hidden">
    <Image
      src={imgSrc}
      alt={item.product_title}
      width={60}
      height={60}
      className="object-cover w-full h-full"
    />
  </div>
</div>
```

- [ ] **Step 2: Verify**

Open the cart drawer. Product thumbnails should show cleanly with no green circle overlay in the top-right corner.

- [ ] **Step 3: Commit**

```bash
git add apps/storefront/components/cart/cart-item.tsx
git commit -m "fix: remove qty badge overlay from cart item thumbnail"
```

---

## Task 3: Cart Summary — New Footer Layout

**Files:**
- Modify: `apps/storefront/components/cart/cart-summary.tsx`
- Modify: `apps/storefront/components/cart/cart-drawer.tsx`

- [ ] **Step 1: Rewrite `cart-summary.tsx`**

Replace the entire file content with:

```tsx
"use client"

import Link from "next/link"
import { useCart } from "@/hooks/use-cart"
import { formatPrice } from "@/lib/utils"

export function CartSummary() {
  const { cart, itemCount } = useCart()

  if (!cart || itemCount === 0) {
    return null
  }

  const shippingTotal = cart.shipping_total ?? 0

  return (
    <div className="border-t border-[--color-border] bg-[rgba(22,20,16,0.5)] px-5 py-4 flex flex-col gap-3">
      {/* Totals */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-center">
          <span className="text-[12px] font-outfit text-[--color-fog]/50 tracking-wide">Subtotal</span>
          <span className="text-[12px] font-outfit text-[--color-fog]/70">{formatPrice(cart.subtotal)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[12px] font-outfit text-[--color-fog]/50 tracking-wide">Transport</span>
          <span className="text-[12px] font-outfit text-[--color-fog]/70">
            {shippingTotal === 0 ? "Gratuit" : formatPrice(shippingTotal)}
          </span>
        </div>
        <div className="flex justify-between items-center pt-2 mt-0.5 border-t border-[--color-border]">
          <span className="text-[14px] font-outfit font-medium text-[--color-white]">Total</span>
          <span className="text-[17px] font-cormorant font-semibold text-[--color-white]">
            {formatPrice(cart.total ?? cart.subtotal)}
          </span>
        </div>
      </div>

      {/* Primary CTA — cart page */}
      <Link
        href="/cos"
        className="flex items-center justify-center w-full py-3 rounded-md border border-[rgba(74,94,58,0.4)] [background:linear-gradient(135deg,rgba(74,94,58,0.25)_0%,rgba(107,138,82,0.2)_100%)] shadow-[0_2px_12px_rgba(74,94,58,0.15),inset_0_1px_0_rgba(255,255,255,0.04)] text-[--color-white] text-[13px] font-outfit font-medium tracking-widest uppercase hover:border-[rgba(74,94,58,0.6)] hover:[background:linear-gradient(135deg,rgba(74,94,58,0.4)_0%,rgba(107,138,82,0.3)_100%)] hover:shadow-[0_4px_20px_rgba(74,94,58,0.2),inset_0_1px_0_rgba(255,255,255,0.06)] transition-all duration-200"
      >
        Mergi la coș
      </Link>

      {/* Secondary CTA — checkout */}
      <Link
        href="/checkout"
        className="flex items-center justify-center w-full py-2 rounded-md border border-[--color-border] text-[--color-fog]/60 text-[12px] font-outfit tracking-wide hover:border-[rgba(74,94,58,0.3)] hover:text-[--color-fog]/90 transition-all duration-200"
      >
        Finalizează comanda
      </Link>
    </div>
  )
}
```

- [ ] **Step 2: Update `cart-drawer.tsx` — remove `onClose` prop from `<CartSummary />`**

In `cart-drawer.tsx` line 70, change:

```tsx
// Before:
<CartSummary onClose={onClose} />

// After:
<CartSummary />
```

- [ ] **Step 3: Verify**

Open the cart drawer with items in cart. You should see:
- Subtotal / Transport / Total rows
- A large moss-gradient "Mergi la coș" button
- A smaller outlined "Finalizează comanda" button below it
- No promo code row, no "sau continuă cumpărăturile" text

- [ ] **Step 4: Run tests**

```bash
pnpm --filter storefront test
```

Expected: all tests pass (no test touches cart-summary directly).

- [ ] **Step 5: Commit**

```bash
git add apps/storefront/components/cart/cart-summary.tsx apps/storefront/components/cart/cart-drawer.tsx
git commit -m "fix: cart summary — two-button layout, remove promo placeholder and continue link"
```

---

## Task 4: Checkout — Fix Product Image Blanks

**Files:**
- Modify: `apps/storefront/components/checkout/order-summary.tsx:26-37`

- [ ] **Step 1: Add picsum fallback to thumbnail rendering**

Replace the thumbnail block (lines 26–37) with:

```tsx
<div className="relative h-16 w-16 rounded overflow-hidden bg-[--color-surface] border border-[--color-border] flex-shrink-0">
  <Image
    src={item.thumbnail ?? `https://picsum.photos/64/64?random=${item.id}`}
    alt={item.product_title}
    fill
    sizes="64px"
    className="object-cover"
  />
</div>
```

The full updated `items.map` block:

```tsx
{items.map((item: CartItem) => (
  <div key={item.id} className="flex gap-3 text-sm">
    <div className="relative h-16 w-16 rounded overflow-hidden bg-[--color-surface] border border-[--color-border] flex-shrink-0">
      <Image
        src={item.thumbnail ?? `https://picsum.photos/64/64?random=${item.id}`}
        alt={item.product_title}
        fill
        sizes="64px"
        className="object-cover"
      />
    </div>
    <div className="flex-1">
      <p className="text-cream font-outfit">{item.product_title}</p>
      <p className="text-fog text-xs">{item.quantity}x</p>
    </div>
    <p className="text-mud">{formatPrice(item.total ?? item.unit_price * item.quantity)}</p>
  </div>
))}
```

- [ ] **Step 2: Verify**

Go to `/checkout` with items in cart. The order summary on the right should show product images instead of blank white squares. If a product genuinely has no thumbnail, it shows a picsum placeholder instead of a blank box.

- [ ] **Step 3: Commit**

```bash
git add apps/storefront/components/checkout/order-summary.tsx
git commit -m "fix: checkout order summary — always show product image with picsum fallback"
```

---

## Task 5: Fix `removePromoCodeAction` — Direct Fetch

**Files:**
- Modify: `apps/storefront/actions/checkout.ts:83-98`

**Context:** `(medusa.store.cart as any).removePromotions()` doesn't exist at runtime — the Medusa JS SDK doesn't implement this method. Fix: use a direct `fetch` to `DELETE /store/carts/{cartId}/promotions`. This endpoint accepts `{ promo_codes: string[] }` in the request body. The publishable API key is required as `x-publishable-api-key` header. Both env vars (`NEXT_PUBLIC_MEDUSA_BACKEND_URL`, `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`) are available in server actions via `process.env`.

- [ ] **Step 1: Replace `removePromoCodeAction` with a direct fetch**

Replace lines 83–98 in `actions/checkout.ts`:

```ts
export async function removePromoCodeAction(cartId: string, code: string) {
  const parse = promoCodeSchema.safeParse({ code })
  if (!parse.success) {
    return { success: false, error: parse.error.errors[0]?.message ?? "Cod invalid", cart: null }
  }
  try {
    const baseUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
    const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
    const res = await fetch(`${baseUrl}/store/carts/${cartId}/promotions`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key": publishableKey ?? "",
      },
      body: JSON.stringify({ promo_codes: [parse.data.code] }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      const message = (data as any)?.message ?? `Eroare ${res.status}`
      return { success: false, error: message, cart: null }
    }
    const data = await res.json()
    return { success: true, cart: data.cart ?? null }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "A apărut o eroare"
    return { success: false, error: message, cart: null }
  }
}
```

- [ ] **Step 2: Verify the fix**

1. Open the app at `http://localhost:3000`
2. Add a product to cart
3. Go to `/checkout`
4. Enter a valid promo code in the promo field and apply it
5. Click the X button next to the applied code
6. Verify: the code disappears without a console error; totals update correctly

- [ ] **Step 3: Run tests**

```bash
pnpm --filter storefront test
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add apps/storefront/actions/checkout.ts
git commit -m "fix: removePromoCodeAction — use direct fetch instead of non-existent SDK method"
```

---

## Verification Checklist

After all tasks are committed:

- [ ] Hero: No top gap above heading/eyebrow on homepage
- [ ] Cart drawer: No green circle badge on thumbnails
- [ ] Cart drawer footer: "Mergi la coș" (primary) + "Finalizează comanda" (secondary), no promo row, no continue link
- [ ] Checkout: Product images visible in order summary (not blank white squares)
- [ ] Checkout: Removing a manually-applied promo code works without runtime error
- [ ] All tests pass: `pnpm --filter storefront test`

---

## Self-Review

**Spec coverage:**
- Hero top padding ✅ Task 1
- Cart item qty badge ✅ Task 2
- Cart drawer footer redesign ✅ Task 3
- Checkout images ✅ Task 4
- removePromoCode fix ✅ Task 5
- SUMMER20 investigation ✅ Investigation Notes section (automatic promotion — no UI change needed as it doesn't appear in `cart.promotions`)

**Placeholder scan:** None — all steps contain exact code.

**Type consistency:** `CartSummary` interface loses `onClose: () => void` prop; `cart-drawer.tsx` stops passing it. Both files updated in Task 3.
