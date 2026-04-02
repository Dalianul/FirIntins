# Oferte Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `/oferte` route that surfaces products marked `metadata.is_oferta = true` in Medusa, with a `−X%` sale badge on the product card, backed by Medusa automatic promotions for actual checkout discounts.

**Architecture:** `getOfferProducts()` fetches up to 100 products from Medusa and filters client-side for `metadata.is_oferta === true`. `ProductCard` gains an inline sale badge reading `metadata.discount_percentage`. The Oferte page is a Server Component mirroring the `/categorii/[slug]` pattern.

**Tech Stack:** Next.js 16 App Router, Medusa JS SDK v2, Tailwind v4, Jest + React Testing Library

---

## File Structure

**Create:**
- `apps/storefront/app/(main)/(shop)/oferte/page.tsx` — Server Component; breadcrumb, H1, product grid, empty state
- `apps/storefront/__tests__/unit/queries.test.ts` — unit tests for `getOfferProducts`
- `apps/storefront/__tests__/unit/product-card.test.tsx` — unit tests for sale badge in `ProductCard`

**Modify:**
- `apps/storefront/lib/medusa/queries.ts` — add `getOfferProducts()` export
- `apps/storefront/components/product/product-card.tsx` — add `−X%` badge (top-left, `--color-destructive`)
- `apps/storefront/components/layout/header.tsx` — fix "Oferte" `href` from `/produse` → `/oferte`

---

## Task 1: `getOfferProducts` query + unit tests

**Files:**
- Modify: `apps/storefront/lib/medusa/queries.ts`
- Create: `apps/storefront/__tests__/unit/queries.test.ts`

- [ ] **Step 1.1: Create failing test**

Create `apps/storefront/__tests__/unit/queries.test.ts`:

```ts
jest.mock("@/lib/medusa/client", () => ({
  medusa: {
    store: {
      product: {
        list: jest.fn(),
      },
    },
  },
}))

import { getOfferProducts } from "@/lib/medusa/queries"
import { medusa } from "@/lib/medusa/client"

const mockList = medusa.store.product.list as jest.Mock

describe("getOfferProducts", () => {
  beforeEach(() => jest.clearAllMocks())

  it("returns only products with is_oferta: true", async () => {
    mockList.mockResolvedValue({
      products: [
        { id: "1", metadata: { is_oferta: true } },
        { id: "2", metadata: { is_oferta: false } },
        { id: "3", metadata: {} },
        { id: "4", metadata: { is_oferta: true } },
      ],
    })
    const result = await getOfferProducts()
    expect(result).toHaveLength(2)
    expect(result.map((p: any) => p.id)).toEqual(["1", "4"])
  })

  it("returns empty array when no products have is_oferta: true", async () => {
    mockList.mockResolvedValue({ products: [{ id: "1", metadata: {} }] })
    const result = await getOfferProducts()
    expect(result).toHaveLength(0)
  })

  it("calls product.list with limit 100 and inventory field", async () => {
    mockList.mockResolvedValue({ products: [] })
    await getOfferProducts()
    expect(mockList).toHaveBeenCalledWith({
      limit: 100,
      fields: "+variants.inventory_quantity",
    })
  })
})
```

- [ ] **Step 1.2: Run test — expect FAIL (function not defined)**

```bash
pnpm --filter storefront test -- --testPathPattern="queries"
```

Expected: FAIL with `getOfferProducts is not a function` or similar import error.

- [ ] **Step 1.3: Add `getOfferProducts` to queries.ts**

Open `apps/storefront/lib/medusa/queries.ts` and append at the end of the file:

```ts
export async function getOfferProducts() {
  const res = await (medusa.store.product.list as Function)({
    limit: 100,
    fields: '+variants.inventory_quantity',
  })
  return (res.products as any[]).filter(
    (p) => p.metadata?.is_oferta === true
  )
}
```

- [ ] **Step 1.4: Run test — expect PASS**

```bash
pnpm --filter storefront test -- --testPathPattern="queries"
```

Expected: 3 tests PASS.

- [ ] **Step 1.5: Commit**

```bash
git add apps/storefront/lib/medusa/queries.ts apps/storefront/__tests__/unit/queries.test.ts
git commit -m "feat(storefront): add getOfferProducts query with metadata filter"
```

---

## Task 2: ProductCard sale badge + unit tests

**Files:**
- Modify: `apps/storefront/components/product/product-card.tsx`
- Create: `apps/storefront/__tests__/unit/product-card.test.tsx`

- [ ] **Step 2.1: Create failing test**

Create `apps/storefront/__tests__/unit/product-card.test.tsx`:

```tsx
import React from "react"
import { render, screen } from "@testing-library/react"
import { ProductCard } from "@/components/product/product-card"

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}))
jest.mock("motion/react", () => ({
  m: {
    div: ({ children, whileHover, ...props }: any) => <div {...props}>{children}</div>,
  },
}))
jest.mock("@/components/wishlist/heart-button", () => ({
  HeartButton: () => null,
}))
jest.mock("@/components/ui/badge", () => ({
  Badge: ({ children }: any) => <span>{children}</span>,
}))
jest.mock("@/lib/utils", () => ({
  formatPrice: (amount: number) => `${amount} RON`,
}))

const baseProduct = {
  id: "prod_1",
  handle: "lanseta-test",
  title: "Lanseta Test",
  variants: [{ prices: [{ amount: 15000 }] }],
  categories: [{ name: "Lansete" }],
  metadata: {},
}

describe("ProductCard sale badge", () => {
  it("does not render badge when metadata has no discount_percentage", () => {
    render(<ProductCard product={baseProduct} />)
    expect(screen.queryByText(/−\d+%/)).not.toBeInTheDocument()
  })

  it("renders badge with correct percentage when discount_percentage is set", () => {
    const product = { ...baseProduct, metadata: { discount_percentage: 20 } }
    render(<ProductCard product={product} />)
    expect(screen.getByText("−20%")).toBeInTheDocument()
  })

  it("does not render badge when discount_percentage is 0", () => {
    const product = { ...baseProduct, metadata: { discount_percentage: 0 } }
    render(<ProductCard product={product} />)
    expect(screen.queryByText(/−\d+%/)).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2.2: Run test — expect FAIL (badge not rendered yet)**

```bash
pnpm --filter storefront test -- --testPathPattern="product-card"
```

Expected: "renders badge with correct percentage" FAIL — element not found in DOM.

- [ ] **Step 2.3: Add sale badge to ProductCard**

Replace the entire content of `apps/storefront/components/product/product-card.tsx` with:

```tsx
"use client"

import Link from "next/link"
import Image from "next/image"
import { m } from "motion/react"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils"
import { HeartButton } from "@/components/wishlist/heart-button"

interface ProductCardProps {
  product: unknown
}

export function ProductCard({ product }: ProductCardProps) {
  const prod = product as Record<string, unknown>

  const variants = prod.variants as Array<Record<string, unknown>> | null | undefined
  const prices = (variants?.[0] as Record<string, unknown> | undefined)?.prices as Array<Record<string, unknown>> | null | undefined
  const price = (prices?.[0] as Record<string, unknown> | undefined)?.amount as number | null | undefined ?? 0

  const categories = prod.categories as Array<Record<string, unknown>> | null | undefined
  const category = (categories?.[0] as Record<string, unknown> | undefined)?.name as string | null | undefined ?? "Altele"

  const id = prod.id as string
  const handle = prod.handle as string
  const title = prod.title as string

  const metadata = prod.metadata as Record<string, unknown> | null | undefined
  const discountPercentage = metadata?.discount_percentage as number | null | undefined

  return (
    <div className="relative group">
      <Link href={`/produse/${handle}`}>
        <m.div
          whileHover={{ scale: 1.05 }}
          className="group rounded border border-border hover:border-moss transition-colors overflow-hidden bg-surface"
        >
          <div className="relative h-48 overflow-hidden bg-surface-2">
            <Image
              src={`https://picsum.photos/300/200?random=${id}`}
              alt={title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover group-hover:scale-110 transition-transform"
            />
            {discountPercentage != null && discountPercentage > 0 && (
              <span className="absolute top-2 left-2 z-10 bg-destructive text-white text-xs font-bold px-2 py-0.5 rounded">
                −{discountPercentage}%
              </span>
            )}
          </div>
          <div className="p-4">
            <Badge variant="outline" className="mb-2 text-xs">
              {category}
            </Badge>
            <h3 className="font-outfit font-medium text-cream text-sm line-clamp-2">
              {title}
            </h3>
            <p className="text-mud font-cormorant text-lg mt-2">
              {formatPrice(price)}
            </p>
          </div>
        </m.div>
      </Link>
      <HeartButton
        productId={id}
        className="absolute top-2 right-2 z-10"
      />
    </div>
  )
}
```

- [ ] **Step 2.4: Run test — expect PASS**

```bash
pnpm --filter storefront test -- --testPathPattern="product-card"
```

Expected: 3 tests PASS.

- [ ] **Step 2.5: Commit**

```bash
git add apps/storefront/components/product/product-card.tsx apps/storefront/__tests__/unit/product-card.test.tsx
git commit -m "feat(storefront): add sale badge to ProductCard for discount_percentage metadata"
```

---

## Task 3: Oferte page + header fix

**Files:**
- Create: `apps/storefront/app/(main)/(shop)/oferte/page.tsx`
- Modify: `apps/storefront/components/layout/header.tsx`

- [ ] **Step 3.1: Create the Oferte page**

Create `apps/storefront/app/(main)/(shop)/oferte/page.tsx`:

```tsx
import type { Metadata } from "next"
import { BASE_URL } from "@/lib/constants"
import { getOfferProducts } from "@/lib/medusa/queries"
import { ProductCard } from "@/components/product/product-card"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Oferte — FirIntins",
  description: "Produse la reducere — echipamente pescuit la crap la prețuri speciale.",
  alternates: { canonical: `${BASE_URL}/oferte` },
  openGraph: {
    title: "Oferte — FirIntins",
    url: `${BASE_URL}/oferte`,
    images: [{ url: `${BASE_URL}/og-default.jpg` }],
  },
}

export default async function OfertePage() {
  const products = await getOfferProducts()

  return (
    <main className="bg-bg min-h-screen">
      <div className="px-6 py-4 max-w-7xl mx-auto">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Acasă</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Oferte</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="font-cormorant text-4xl text-cream mb-8">Oferte</h1>
        {products.length === 0 ? (
          <p className="text-fog">Nu există produse în ofertă momentan.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
```

- [ ] **Step 3.2: Fix the "Oferte" header link**

Open `apps/storefront/components/layout/header.tsx`.

Find this block (around line 44):
```tsx
          <Link
            href="/produse"
            className="text-[--color-cream] hover:text-[--color-moss] transition-colors"
          >
            Oferte
          </Link>
```

Replace with:
```tsx
          <Link
            href="/oferte"
            className="text-[--color-cream] hover:text-[--color-moss] transition-colors"
          >
            Oferte
          </Link>
```

- [ ] **Step 3.3: Run the full test suite — expect no regressions**

```bash
pnpm --filter storefront test
```

Expected: all existing tests pass alongside the new ones.

- [ ] **Step 3.4: Commit**

```bash
git add apps/storefront/app/"(main)"/"(shop)"/oferte/page.tsx apps/storefront/components/layout/header.tsx
git commit -m "feat(storefront): add Oferte page at /oferte and fix header link"
```

---

## Self-Review

**Spec coverage:**
- ✅ `getOfferProducts()` in `queries.ts` — Task 1
- ✅ `metadata.is_oferta === true` filter — Task 1
- ✅ `−X%` badge on ProductCard from `metadata.discount_percentage` — Task 2
- ✅ Badge top-left, `--color-destructive` background — Task 2 (uses `bg-destructive` Tailwind token)
- ✅ Oferte page at `/oferte` with breadcrumb, H1, grid, empty state — Task 3
- ✅ `export const dynamic = "force-dynamic"` — Task 3
- ✅ Metadata / OpenGraph — Task 3
- ✅ Header "Oferte" link fixed to `/oferte` — Task 3

**Placeholder scan:** No TBDs, TODOs, or vague steps found.

**Type consistency:** `getOfferProducts` returns `any[]` (filtered from `res.products as any[]`). `ProductCard` reads `prod.metadata as Record<string, unknown>` and casts `discount_percentage as number`. Consistent throughout.
