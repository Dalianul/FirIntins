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
pnpm --filter storefront dev         # next dev
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
- `src/subscribers/` — Event subscribers
- `src/jobs/` — Scheduled jobs
- `src/scripts/seed.ts` — Database seed script

Config: `medusa-config.ts`. Active providers: Stripe (payments), SendGrid (notifications), local file storage.

### Storefront (Next.js 16 App Router)

The app has two independent root layouts (each renders `<html>` + `<body>`):

**`app/(main)/`** — storefront root layout (fonts, CartProvider, WishlistProvider, LazyMotion, Header, Footer, CookieConsent):
- `(shop)/` — product listing (`/produse`), PDP (`/produse/[handle]`), category (`/categorii/[slug]`), cart (`/cos`), blog (`/blog`), static pages (`/pagini/[slug]`)
- `(auth)/` — login, register
- `(checkout)/` — 3-step checkout (address → shipping → payment), order confirmation (`/checkout/confirmare/[orderId]`)
- `cont/` — protected account pages (orders, addresses, profile, security, wishlist); guarded by `proxy.ts` via `_medusa_jwt` cookie

**`app/(payload)/`** — Payload CMS admin panel at `/admin` (separate root layout, imports `@payloadcms/next/css`). Collections: Users, Categories, Posts, Pages, Media.

**Auth guard:** `proxy.ts` (exported as `middleware`) matches `/cont/:path*` — redirects to `/login` if `_medusa_jwt` cookie absent.

**Data layer** (`lib/medusa/`):
- `client.ts` — singleton Medusa SDK instance
- `queries.ts` — server-side fetch helpers (`getProducts`, `getProduct`, `getCategories`, `getCart`, etc.)
- `auth.ts`, `account.ts`, `checkout.ts` — server-side SDK calls for mutations

**Server Actions** (`actions/`): `auth.ts`, `checkout.ts`, `cart.ts`, `account.ts` — all use Zod schemas from `lib/schema/` for validation.

**State:**
- `context/cart-context.tsx` — CartProvider, persists `cartId` in localStorage
- `context/wishlist-context.tsx` — WishlistProvider

**Animations:** `LazyMotion` + `domAnimation` is set up in `(main)/layout.tsx`. Import from `"motion/react"`, not `"framer-motion"`.

### Payload CMS

Payload v3 runs inside the Next.js 16 app (same process, same port). Config: `payload.config.ts`.

- `app/(payload)/layout.tsx` — uses `RootLayout` from `@payloadcms/next/layouts`; the only CSS import must be `import "@payloadcms/next/css"` (do NOT use `@payloadcms/ui/styles.css` or any SCSS)
- `app/(payload)/admin/[[...segments]]/page.tsx` — Payload admin UI
- `app/(payload)/api/[...slug]/route.ts` — Payload REST + GraphQL API
- `app/(payload)/admin/importMap.js` — auto-generated; regenerate with `generate:importmap` after adding custom components
- `collections/` — Payload collection configs (Posts and Pages have `afterChange` hooks calling `revalidateTag`)

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
