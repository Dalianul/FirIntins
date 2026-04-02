# Spec: Oferte Page

**Date:** 2026-04-02  
**Status:** Approved

## Goal

Add a functional `/oferte` route that surfaces products currently on sale, driven by Medusa product metadata and backed by Medusa's automatic promotions engine for actual checkout discounts.

## Data Model

Products are marked for the Oferte page via two Medusa metadata fields set in Medusa admin:

| Field | Type | Example |
|-------|------|---------|
| `metadata.is_oferta` | `boolean` | `true` |
| `metadata.discount_percentage` | `number` | `20` |

The actual price reduction at checkout is handled by a separate Medusa automatic promotion targeting the same products. The storefront never calculates prices — it only reads the badge percentage from metadata.

## Architecture

### New files
- `apps/storefront/app/(main)/(shop)/oferte/page.tsx` — Server Component; fetches offer products, renders breadcrumb + grid + empty state

### Modified files
- `apps/storefront/lib/medusa/queries.ts` — add `getOfferProducts()`: fetches `limit: 100` products, filters for `metadata.is_oferta === true`
- `apps/storefront/components/product/product-card.tsx` — add sale badge: reads `product.metadata?.discount_percentage`, renders `−X%` pill top-left when value is present and `> 0`
- `apps/storefront/components/layout/header.tsx` — fix "Oferte" link `href` from `/produse` → `/oferte`

## Page Layout

```
/oferte
├── Breadcrumb: Acasă → Oferte
├── H1: "Oferte"
├── Product grid (1 col / 2 col sm / 4 col lg)
│   └── ProductCard with −X% badge (top-left)
└── Empty state: "Nu există produse în ofertă momentan." (if no products)
```

- `export const dynamic = "force-dynamic"` — Medusa fetch at render time
- Metadata: `title: "Oferte — FirIntins"`, canonical `/oferte`, OpenGraph with `og-default.jpg`

## ProductCard Badge

- Position: `absolute top-2 left-2` (wishlist heart stays top-right — no conflict)
- Style: `--color-destructive` background, white text, small bold pill
- Content: `−{discount_percentage}%`
- Condition: only renders when `product.metadata?.discount_percentage` is truthy and `> 0`
- No new props — reads directly from existing `product: any` prop

## Data Flow

1. `getOfferProducts()` calls `medusa.store.product.list({ limit: 100, fields: '+variants.inventory_quantity' })`
2. Filters result: `products.filter(p => p.metadata?.is_oferta === true)`
3. Page renders filtered list; empty state if array is empty

## Admin Workflow (per promotion)

1. Medusa admin → Products → select product → set `metadata.is_oferta = true`, `metadata.discount_percentage = N`
2. Medusa admin → Promotions → create automatic promotion targeting the same product(s) with `N%` discount
3. Product now appears on `/oferte` with badge; discount applies automatically at checkout

## Out of Scope

- Countdown timers or promotion end dates
- Sorting/filtering on the Oferte page
- Struck-through original prices (requires `region_id` for calculated prices — not available)
- Admin UI for managing offers (use Medusa admin directly)
