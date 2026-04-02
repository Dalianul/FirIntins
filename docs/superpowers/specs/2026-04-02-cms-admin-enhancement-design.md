# CMS Admin Enhancement + Frontend Polish — Design Spec
**Date:** 2026-04-02  
**Status:** Approved

---

## Scope

Four independent work streams that together bring the Payload CMS admin to a professional standard and polish the storefront frontend before the final UI/UX design phase.

1. Lexical editor upgrade (Posts + Pages collections)
2. SEO plugin on Posts
3. `@tailwindcss/typography` + PostContent fix
4. Framer Motion animations (B scope)
5. UI polish (cursor, ProductCard, contrast, safe areas)

---

## 1. Lexical Editor Upgrade

### What changes
Both `collections/Posts.ts` and `collections/Pages.ts` replace `lexicalEditor({})` with a fully configured feature set.

### Features to enable
```ts
import {
  lexicalEditor,
  HeadingFeature,
  BoldFeature,
  ItalicFeature,
  UnderlineFeature,
  StrikethroughFeature,
  BlockquoteFeature,
  LinkFeature,
  UploadFeature,
  YouTubeFeature,
  HorizontalRuleFeature,
  OrderedListFeature,
  UnorderedListFeature,
  ChecklistFeature,
} from "@payloadcms/richtext-lexical"
```

**Feature rationale:**
- `HeadingFeature({ enabledHeadingSizes: ["h2", "h3", "h4"] })` — H1 is always the post title, never in body
- `BlockquoteFeature` — "pro tip" callouts in fishing guides
- `LinkFeature` — built-in URL text input, simple enough for a non-technical client
- `UploadFeature({ collections: { media: { fields: [{ name: "alt", type: "text" }] } } })` — inline images from existing Media collection
- `YouTubeFeature` — paste a YouTube URL, auto-renders embed; no custom node needed
- `ChecklistFeature` — "what to pack" fishing checklists
- No custom nodes, no custom toolbar components

### Files changed
- `apps/storefront/collections/Posts.ts`
- `apps/storefront/collections/Pages.ts`

---

## 2. SEO Plugin (`@payloadcms/plugin-seo`)

### Scope
Posts collection only. Pages (legal/static) use auto-generated metadata from `extractTextFromLexical()` — sufficient for their purpose.

### Installation
```bash
pnpm add @payloadcms/plugin-seo --filter storefront
```

### Plugin config in `payload.config.ts`
```ts
import { seoPlugin } from "@payloadcms/plugin-seo"

plugins: [
  seoPlugin({
    collections: ["posts"],
    generateTitle: ({ doc }) => `${doc.title} — FirIntins Blog`,
    generateDescription: ({ doc }) => doc.excerpt ?? "",
    generateURL: ({ doc }) => `${process.env.NEXT_PUBLIC_SERVER_URL ?? "https://firintins.ro"}/blog/${doc.slug}`,
  }),
]
```

### What the plugin adds to Posts
- A **SEO tab** in the admin panel with:
  - `meta.title` — character counter, auto-populated from post title
  - `meta.description` — textarea with counter, auto-populated from excerpt
  - `meta.image` — upload field for OG social image
  - Live Google search result preview

### Frontend integration
`app/(main)/(shop)/blog/[slug]/page.tsx` `generateMetadata()` updated to prefer plugin fields:
```ts
title: post.meta?.title ?? `${post.title} — FirIntins Blog`,
description: post.meta?.description ?? post.excerpt ?? undefined,
openGraph: {
  images: post.meta?.image?.url
    ? [{ url: mediaUrl(post.meta.image.url) }]
    : [{ url: `${BASE_URL}/og-default.jpg` }],
}
```

### Files changed
- `apps/storefront/payload.config.ts`
- `apps/storefront/app/(main)/(shop)/blog/[slug]/page.tsx`
- `apps/storefront/payload-types.ts` (regenerated)

### Migration
After plugin install, run:
```bash
pnpm --filter storefront generate:types   # regenerate payload-types.ts
```
The SEO plugin adds `meta` group fields to the Posts schema. Payload's postgres adapter will apply the new columns automatically on next server start (dev mode) via its push mechanism. No manual `db:migrate` needed in development. For production, run `medusa db:migrate` (or the equivalent Payload migration command) before deploying.

---

## 3. `@tailwindcss/typography` + PostContent Fix

### Critical gap
`PostContent` uses `prose prose-invert` Tailwind classes but `@tailwindcss/typography` is not installed. Blog posts and static pages currently render with **zero prose styling**.

### Installation
```bash
pnpm add -D @tailwindcss/typography --filter storefront
```

### Tailwind v4 integration
In `apps/storefront/app/globals.css`, add after existing `@import` lines:
```css
@plugin "@tailwindcss/typography";
```
No `tailwind.config.ts` needed — Tailwind v4 uses CSS-based plugin registration.

### PostContent upgrade (`components/blog/post-content.tsx`)
Replace the existing minimal prose classes with a fully themed version:

```tsx
<div className="
  prose prose-invert max-w-none
  prose-headings:font-cormorant prose-headings:text-[--color-white] prose-headings:leading-tight
  prose-h2:text-3xl prose-h3:text-2xl prose-h4:text-xl
  prose-p:text-[--color-fog] prose-p:leading-8
  prose-a:text-[--color-moss-light] prose-a:no-underline hover:prose-a:underline
  prose-strong:text-[--color-cream] prose-strong:font-semibold
  prose-em:text-[--color-cream]
  prose-blockquote:border-l-[--color-moss] prose-blockquote:text-[--color-fog] prose-blockquote:italic prose-blockquote:pl-4
  prose-ul:text-[--color-fog] prose-ol:text-[--color-fog]
  prose-li:marker:text-[--color-moss]
  prose-hr:border-[--color-border]
  prose-img:rounded-lg prose-img:border prose-img:border-[--color-border] prose-img:mx-auto
  prose-code:text-[--color-cream] prose-code:bg-[--color-surface-2] prose-code:px-1 prose-code:rounded
  [&_iframe]:w-full [&_iframe]:aspect-video [&_iframe]:rounded-lg [&_iframe]:border [&_iframe]:border-[--color-border]
">
  <RichText data={content} />
</div>
```

### Files changed
- `apps/storefront/app/globals.css`
- `apps/storefront/components/blog/post-content.tsx`

---

## 4. Framer Motion — B Scope

All imports use `"motion/react"` (already correct per CLAUDE.md). `LazyMotion` + `domAnimation` already in main layout — no setup changes.

### 4a. Cart Drawer slide
**File:** `components/cart/cart-drawer.tsx`

Wrap drawer panel in `AnimatePresence`. When `isOpen`:
```tsx
<AnimatePresence>
  {isOpen && (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-40"
        onClick={onClose}
      />
      {/* Drawer */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed right-0 top-0 h-full w-full max-w-md bg-[--color-bg-light] z-50 ..."
      >
        {/* drawer content */}
      </motion.div>
    </>
  )}
</AnimatePresence>
```

### 4b. Page transition fade
**File:** `app/(main)/layout.tsx`

Wrap `{children}` in a `motion.div`:
```tsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.2 }}
>
  {children}
</motion.div>
```

### 4c. Product grid stagger
**File:** `components/product/product-grid.tsx`

```tsx
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

// Wrap grid div:
<motion.div variants={container} initial="hidden" animate="show" className="grid ...">
  {products.map(p => (
    <motion.div key={p.id} variants={item}>
      <ProductCard product={p} />
    </motion.div>
  ))}
</motion.div>
```

### 4d. Blog listing stagger
**File:** `components/blog/blog-listing.tsx`

Same `container`/`item` variants as product grid. When `selected` filter changes, use `key={selected ?? "all"}` on the container so React remounts it and triggers a fresh stagger.

### Files changed
- `components/cart/cart-drawer.tsx`
- `app/(main)/layout.tsx`
- `components/product/product-grid.tsx`
- `components/blog/blog-listing.tsx`

---

## 5. UI Polish

### 5a. Global cursor-pointer
**File:** `apps/storefront/app/globals.css`

```css
button, [role="button"], a, select, label[for],
input[type="checkbox"], input[type="radio"] {
  cursor: pointer;
}
```

Plus audit pass: add `cursor-pointer` to any Tailwind-only click-handler divs/spans in:
- `components/product/product-card.tsx`
- `components/blog/post-card.tsx`
- `components/blog/category-filter.tsx`
- `components/product/category-filter.tsx`
- `components/product/variant-selector.tsx`

### 5b. ProductCard upgrade
**File:** `components/product/product-card.tsx`

- Image container: `aspect-[4/3]` + `overflow-hidden` + `rounded-xl`
- Image: `object-cover w-full h-full`
- Hover state: `group-hover:scale-105 transition-transform duration-300` on image
- Card border + shadow lift on hover
- Crossed-out original price: when `variant.compare_at_price` exists and is higher than `variant.calculated_price`:
  ```tsx
  <span className="line-through text-[--color-fog] text-sm mr-2">
    {formatPrice(variant.compare_at_price)}
  </span>
  <span className="text-[--color-moss-light] font-semibold">
    {formatPrice(variant.calculated_price)}
  </span>
  ```

### 5c. Contrast audit
Known risk areas to fix:
- Form input placeholder text: ensure `placeholder:text-[--color-fog]` minimum
- Active/selected filter buttons: ensure selected state has sufficient contrast vs background
- Footer links: verify `--color-fog` on `--color-bg` meets WCAG AA (4.5:1)
- Cart item quantity controls: small text on dark background

### 5d. iOS safe area insets
**File:** `app/(main)/layout.tsx` or relevant layout wrappers

```css
/* globals.css */
header { padding-top: env(safe-area-inset-top); }
footer { padding-bottom: env(safe-area-inset-bottom); }
```

Or via Tailwind: `pt-[env(safe-area-inset-top)]` on the header component, `pb-[env(safe-area-inset-bottom)]` on the footer component.

Also add `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">` to the root layout if not already present.

### Files changed
- `apps/storefront/app/globals.css`
- `apps/storefront/components/product/product-card.tsx`
- `apps/storefront/components/blog/post-card.tsx`
- `apps/storefront/components/blog/category-filter.tsx`
- `apps/storefront/components/product/category-filter.tsx`
- `apps/storefront/components/product/variant-selector.tsx`
- `apps/storefront/components/layout/header.tsx`
- `apps/storefront/components/layout/footer.tsx`
- `apps/storefront/app/(main)/layout.tsx`

---

## Implementation Order

1. Lexical upgrade → both collections (backend, no migration needed)
2. SEO plugin → install, config, frontend metadata update, regenerate types
3. Typography plugin → install, globals.css, PostContent
4. Framer Motion → cart drawer, page fade, product grid, blog listing
5. UI polish → globals cursor, ProductCard, contrast audit, safe areas

Each step is independently deployable and testable.

---

## Out of Scope

- Frontend design phase (ui-ux-pro-max) — that's the next phase after this
- Medusa product changes
- Any new Payload collections
- Search functionality (Phase 3.4 in roadmap)
