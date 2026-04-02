# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Fishing equipment e-commerce — pnpm monorepo with Turborepo.

- `apps/backend` — Medusa v2 headless commerce API (port 9000)
- `apps/storefront` — Next.js 16 App Router storefront + Payload CMS admin (port 3000)

## Commands

### Root (runs across all apps via Turborepo)
```bash
pnpm dev           # Start all apps concurrently
pnpm build         # Build all apps
pnpm test          # Run all test suites
pnpm lint          # Lint all apps
```

### Backend only
```bash
pnpm backend:dev          # medusa develop (watch mode)
pnpm backend:migrate      # medusa db:migrate
pnpm backend:seed         # Run seed script

# From apps/backend directly:
pnpm test:unit            # Unit tests (swc/jest)
pnpm test:integration:http    # HTTP integration tests
pnpm test:integration:modules # Module integration tests
```

### Storefront only
```bash
pnpm --filter storefront dev         # next dev --webpack (webpack, not Turbopack)
pnpm --filter storefront test        # Jest unit tests (excludes smoke)
pnpm --filter storefront test:smoke  # Smoke tests (requires running server)
pnpm --filter storefront test:watch  # Watch mode

# Run a single test file:
pnpm --filter storefront test -- --testPathPattern="checkout"

# Payload CMS
pnpm --filter storefront generate:types    # Regenerate payload-types.ts
pnpm --filter storefront generate:importmap  # Regenerate admin/importMap.js
```

### Infrastructure
```bash
docker compose up -d   # Start Postgres + Redis
```

## Environment Setup

**Backend** (`apps/backend/.env`): Copy from `.env.template`. Requires `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `COOKIE_SECRET`, CORS vars, `STRIPE_API_KEY`, `SENDGRID_API_KEY`.

**Storefront** (`apps/storefront/.env.local`): Requires:
```
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=<from Medusa admin>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
PAYLOAD_DATABASE_URL=<postgres connection string for Payload>
PAYLOAD_SECRET=<random secret for Payload JWT>
```

The storefront client (`lib/medusa/client.ts`) throws at module load if either Medusa env var is missing.

## Architecture

### Backend (Medusa v2)

Medusa v2 uses a module + workflow architecture. Business logic belongs in **Workflows**, never directly in API routes.

- `src/api/store/` and `src/api/admin/` — custom API routes extending Medusa's built-in routes
- `src/modules/` — custom Medusa modules (data models + services)
- `src/workflows/` — Medusa Workflows for business logic
- `src/links/` — Module Links connecting custom modules to Medusa core modules
- `src/scripts/seed.ts` — Database seed script

Config: `medusa-config.ts`. Active providers: Stripe (payments), SendGrid (notifications), local file storage.

**Custom modules:**
- `wishlist` — `Wishlist` + `WishlistItem` models; linked to customer and product via `src/links/`; workflows: `add-to-wishlist`, `remove-from-wishlist`; store API at `/store/wishlists`
- `product-review` — `ProductReview` model; linked to customer and product; workflows: `create-product-review`, `update-product-review`; store API at `/store/products/[id]/reviews`

### Storefront (Next.js 16 App Router)

**Bundler:** `next dev --webpack` (Turbopack is default in Next.js 16 but has a memory-leak dev crash with Payload; webpack is stable).

The app has two independent root layouts (each renders `<html>` + `<body>`):

**`app/(main)/`** — storefront root layout (fonts, CartProvider, WishlistProvider, LazyMotion, Header, Footer, CookieConsent):
- `(shop)/` — homepage (`/`), product listing (`/produse`), PDP (`/produse/[handle]`), category (`/categorii/[slug]`), cart (`/cos`), blog listing (`/blog`), blog post (`/blog/[slug]`), blog by category (`/blog/categorii/[slug]`), static pages (`/pagini/[slug]`)
- `(auth)/` — login (`/login`), register (`/register`)
- `(checkout)/` — single page at `/checkout` with 3 client-side steps (address → shipping → payment); order confirmation at `/checkout/confirmare/[orderId]`
- `cont/` — protected account pages: orders, addresses, profile, security, wishlist; guarded by `proxy.ts` checking `_medusa_jwt` cookie

**`app/(payload)/`** — Payload CMS admin panel at `/admin` (separate root layout). Both `layout.tsx` and `admin/[[...segments]]/page.tsx` have `export const dynamic = "force-dynamic"` — **do not remove**, it's required for Payload to function alongside `experimental.useCache`.

**Auth guard:** `proxy.ts` exports `proxy` function and `config` (matcher: `/cont/:path*`) — redirects to `/login` if `_medusa_jwt` cookie absent. Must be re-exported from `middleware.ts` for Next.js to pick it up.

**Data layer** (`lib/medusa/`):
- `client.ts` — singleton Medusa SDK instance
- `queries.ts` — server-side fetch helpers (`getProducts`, `getProduct`, `getCategories`, `getCart`, etc.)
- `get-customer.ts` — server-side customer fetch using `_medusa_jwt` cookie

**Server Actions** (`actions/`): `auth.ts`, `checkout.ts`, `cart.ts`, `account.ts`, `review.ts`, `wishlist.ts` — all use Zod schemas from `lib/schema/` for validation.

**State:**
- `context/cart-context.tsx` — CartProvider, persists `cartId` in localStorage
- `context/wishlist-context.tsx` — WishlistProvider

**Animations:** `LazyMotion` + `domAnimation` is set up in `(main)/layout.tsx`. Import from `"motion/react"`, not `"framer-motion"`.

### Payload CMS

Payload v3 runs inside the Next.js 16 app (same process, same port). Config: `payload.config.ts`.

- `app/(payload)/layout.tsx` — uses `RootLayout` from `@payloadcms/next/layouts`; CSS import must be `import "@payloadcms/next/css"` only (do NOT use `@payloadcms/ui/styles.css` or any SCSS)
- `app/(payload)/admin/[[...segments]]/page.tsx` — Payload admin UI
- `app/(payload)/api/[...slug]/route.ts` — Payload REST + GraphQL API
- `app/(payload)/admin/importMap.js` — auto-generated; regenerate with `generate:importmap` after adding custom components
- `collections/` — Posts and Pages have `afterChange` hooks calling `revalidateTag`; Media has `access: { read: () => true }` for public file serving

**CMS data caching** (`lib/cms/client.ts`): uses `"use cache"` + `cacheTag` + `cacheLife` (enabled by `experimental: { useCache: true }` in `next.config.ts`). Tags: `cms-blog` (posts/categories), `cms-pages` (pages/footer).

**Payload media images:** Payload returns absolute URLs (`http://localhost:3000/api/media/file/...`). Always extract the pathname before passing to `next/image` to avoid loopback fetch errors: `new URL(url).pathname`.

### next.config.ts

```ts
experimental: { useCache: true }   // enables "use cache" directive without dynamicIO
```
`withPayload()` wraps the config. Do NOT add `cacheComponents: true` — it's incompatible with Payload's `force-dynamic` routes.

### Styling

Tailwind v4 — **no `tailwind.config.ts`**. All theme tokens are CSS variables in `app/globals.css` under `@theme inline {}`. Brand palette:
- `--color-bg` / `--color-bg-light` / `--color-surface` — dark backgrounds
- `--color-moss` / `--color-moss-light` — green accents
- `--color-mud` — gold/amber accent
- `--color-fog` / `--color-cream` / `--color-white` — light text

Typography: `--font-cormorant` (Cormorant Garamond — display/headings) + `--font-outfit` (Outfit — body).

`globals.css` is imported only in `app/(main)/layout.tsx` — it does NOT bleed into the `(payload)` layout.

shadcn/ui components live in `components/ui/`. Add new ones with `pnpm dlx shadcn add <component>` from `apps/storefront/`.

### Testing (Storefront)

Jest + ts-jest, `jsdom` environment. `@/` alias maps to `apps/storefront/`.

- `__tests__/unit/` — Zod schema validation tests
- `__tests__/actions/` — Server action tests (mock `lib/medusa/client`)
- `__tests__/context/` — React context tests
- `__tests__/smoke/` — E2E smoke tests against a running server (excluded from default `pnpm test`)

UI is in Romanian. Test assertions on user-facing strings must use Romanian text.

### Next.js Version Note

This project uses Next.js 16. Dynamic route params are `Promise<{ param: string }>` — always `await params` in page components. See `apps/storefront/AGENTS.md`.

### `revalidateTag` Signature

Next.js 16 with `experimental.useCache` changes `revalidateTag` to require two arguments:

```ts
revalidateTag("cms-blog", {})   // second arg is CacheLifeConfig (all fields optional, {} is valid)
```

Single-arg calls are a TypeScript error. Affects `collections/Posts.ts`, `collections/Pages.ts`, and `app/api/revalidate/route.ts`.

### Pages That Fetch Medusa Data at Render Time

Pages whose server components call Medusa queries during render (not in `generateStaticParams`) need `export const dynamic = "force-dynamic"` to prevent build-time prerender failures (backend not running during `next build`):

```ts
export const dynamic = "force-dynamic"   // required on homepage and any page with top-level Medusa fetches
```

Dynamic route pages (`/produse/[handle]`, `/categorii/[slug]`) already have `generateStaticParams` that returns `[]` on error — these become server-rendered without needing `force-dynamic`.

### `useSearchParams()` Requires Suspense

Any client component using `useSearchParams()` must be wrapped in `<Suspense>` at the page level or static prerendering fails:

```tsx
<Suspense fallback={null}>
  <LoginForm />   {/* uses useSearchParams internally */}
</Suspense>
```

Affects `(auth)/login/page.tsx` and `(auth)/register/page.tsx`.

### Medusa SDK Type Limitations

The JS SDK types are narrower than what the runtime actually accepts. Known mismatches:

- `StoreUpdateCustomer` does not include `email` or `password` fields (runtime supports them)
- `createAddress` / `updateAddress` / `deleteAddress` auth header arg type doesn't match `SelectParams`

Use `as Function` or `as any` casts at the call site rather than fighting the types. Examples are in `actions/account.ts`.

`order.metadata` is typed `Record<string, unknown> | null` — fields like `.cui` are `unknown`, which can't be used directly in JSX. Cast with `!!value` for conditionals or `String(value)` for rendering.

### Base UI vs Radix UI

shadcn/ui components are built on **Base UI** (`@base-ui-components/react`), not Radix UI. The `asChild` prop does not exist on Base UI primitives (e.g. `SheetTrigger`, `DialogTrigger`). Do not pass `asChild` to these components.

### pnpm Overrides

Root `package.json` has critical overrides under `pnpm.overrides`:

- `"zod": "^3.25.76"` — aligns Zod across Medusa and storefront to avoid version conflicts.
