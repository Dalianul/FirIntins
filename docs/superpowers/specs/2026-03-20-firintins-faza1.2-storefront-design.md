# FirIntins — Spec Faza 1.2: Next.js Storefront
**Data:** 2026-03-20
**Proiect:** FirIntins — E-commerce ultra-premium echipamente pescuit la crap
**Faza:** 1.2 — Next.js Storefront complet (catalog + coș + checkout + auth + cont)

---

## Context

Faza 1.1 a livrat infrastructura completă: Medusa v2 backend cu Stripe/SendGrid, baza de date migrată, seed cu Romania/RON, 6 categorii de pescuit, 2 produse. Faza 1.2 construiește storefrontul Next.js complet deasupra acestui backend.

**Abordare:** Infrastructure-first — primele task-uri pun fundația completă (scaffold, design system, SDK client, layout shared), apoi fiecare pagină este un task autonom care folosește ce există.

---

## Secțiunea 1 — Scaffold & Structura proiect

### Prerequisit: Backend file-local provider

Prima acțiune în Faza 1.2 este adăugarea `@medusajs/file-local` în `apps/backend/medusa-config.ts` (backend din Faza 1.1) pentru a permite upload imagini prin Admin UI în development:

```ts
// apps/backend/medusa-config.ts — adăugat în modules array
{
  resolve: "@medusajs/file-local",
  options: { upload_dir: "uploads" },
}
```

După modificare: `pnpm backend:dev` (restartează cu noul provider).

### Monorepo setup

- `apps/storefront/` creat via `create-next-app` cu TypeScript strict, Tailwind, App Router
- `turbo.json` adăugat la root cu pipeline: `build` (backend înainte de storefront), `dev` (paralel), `lint`, `type-check`
- `pnpm-workspace.yaml` confirmă `apps/*`

### Structura directoare

```
apps/storefront/
├── app/
│   ├── layout.tsx                          ← RootLayout: fonturi, LazyMotion, CartProvider
│   ├── page.tsx                            ← Homepage (SSG + ISR 1h)
│   ├── (shop)/
│   │   ├── produse/
│   │   │   ├── page.tsx                    ← Listing produse (SSR)
│   │   │   └── [handle]/page.tsx           ← PDP (SSG + ISR 30min)
│   │   └── categorii/[slug]/page.tsx       ← Listing per categorie (SSR)
│   ├── (checkout)/
│   │   ├── cos/page.tsx                    ← Pagina coș fallback (no-JS)
│   │   ├── checkout/page.tsx               ← Checkout Stripe Elements (CSR)
│   │   └── checkout/confirmare/[orderId]/page.tsx
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── cont/
│   │   ├── page.tsx                        ← Dashboard cont client
│   │   └── comenzi/
│   │       ├── page.tsx                    ← Lista comenzi
│   │       └── [id]/page.tsx               ← Detaliu comandă
│   ├── api/
│   │   └── newsletter/route.ts             ← No-op, returnează 200
│   ├── sitemap.ts
│   ├── robots.ts
│   ├── not-found.tsx
│   └── error.tsx
├── components/
│   ├── ui/                                 ← shadcn/ui components
│   ├── layout/                             ← Header, Footer, Breadcrumb, Navigation
│   ├── product/                            ← ProductCard, ProductGallery, VariantSelector
│   ├── cart/                               ← CartDrawer, CartItem, CartSummary
│   └── checkout/                           ← CheckoutForm, StripeElements wrapper
├── lib/
│   ├── medusa/
│   │   ├── client.ts                       ← SDK singleton (@medusajs/js-sdk)
│   │   └── queries.ts                      ← Typed fetch helpers
│   └── utils.ts                            ← cn(), formatPrice(RON)
├── hooks/
│   ├── use-cart.ts
│   └── use-customer.ts
├── context/
│   └── cart-context.tsx
├── actions/                                ← Server Actions (auth, cart, checkout)
├── variants/                               ← Framer Motion variant definitions
└── middleware.ts                           ← Protecție rute /cont/*
```

---

## Secțiunea 2 — Design System

### Paletă de culori

```css
--color-bg:          #0f0e0b   /* negru cald — fundal principal */
--color-surface:     #1a1814   /* carduri, drawer, modal */
--color-surface-2:   #242019   /* hover states, input backgrounds */
--color-border:      #2e2a22   /* borduri subtile */
--color-moss:        #4a5e3a   /* verde mușchi — accent primar, CTA-uri */
--color-moss-light:  #6b8a52   /* hover pe accent primar */
--color-mud:         #8b6914   /* auriu noroios — prețuri, highlights */
--color-fog:         #c4bfb0   /* text secundar, placeholder */
--color-cream:       #f0ebe0   /* text primar */
--color-white:       #faf8f3   /* headinguri, text pe CTA */
```

### Tipografie

| Rol | Font | Greutăți |
|---|---|---|
| Display / Headinguri | Cormorant Garamond | 300, 400, 600, 700 |
| Body / UI | Outfit | 300, 400, 500 |

- Încărcate via `next/font/google` (self-hosted automat, zero FOUT)
- Niciodată: Inter, Roboto, Arial, system fonts, Space Grotesk

### shadcn/ui

- Inițializat cu temă customizată — CSS variables de mai sus mapate pe Radix color tokens
- Componente adăugate pe demand: Button, Input, Sheet (cart drawer), Dialog, Badge, Separator, Skeleton, Toast, Breadcrumb, Form

### Animații (motion/react)

```ts
// app/layout.tsx
import { LazyMotion, domAnimation } from "motion/react"
// În componente
import { m } from "motion/react"
```

- `LazyMotion + domAnimation` în RootLayout — bundle -50%
- Toate variantele definite în `variants/*.ts` outside componentelor
- `useMotionValue` în loc de `useState` pentru valori animate continuu
- Spring physics peste tot (nu easing liniar)

**Animații specifice:**
- CartDrawer: slide-in din dreapta + staggered reveals pe items (0.05s interval)
- Page transitions: fade + slight Y translate
- ProductCard: scale + border glow pe hover
- Homepage sections: `whileInView` cu `once: true`

### Utilități

- `formatPrice(amount: number): string` — formatează bani întregi ca `549,99 lei` via `Intl.NumberFormat("ro-RO", { style: "currency", currency: "RON" })`
- `cn()` — clsx + tailwind-merge

---

## Secțiunea 3 — Data Layer

### Medusa JS SDK

```ts
// lib/medusa/client.ts
import Medusa from "@medusajs/js-sdk"

export const medusa = new Medusa({
  baseUrl: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL!,
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY!,
})
```

### Query helpers (lib/medusa/queries.ts)

```ts
export async function getProducts(params?: ProductParams)
export async function getProduct(handle: string)
export async function getCategories()
export async function getCategory(slug: string)
```

Folosite direct în Server Components. Operațiile de cart și auth merg prin **Server Actions** în `actions/`.

### Variabile de mediu (storefront .env)

```
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=<vezi mai jos>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Publishable API Key Setup

Cheia publishable se creează manual în Admin UI (`http://localhost:9000/app`) după ce backend-ul rulează:

1. Settings → API Keys → Create new Publishable API Key
2. Denumire: "Storefront Dev"
3. Asociază sales channel-ul "Magazin Online" (creat de seed în Faza 1.1)
4. Copiază cheia generată în `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`

O singură cheie per dev environment; nu se commit în git.

### Auth — flux complet

Autentificarea folosește **httpOnly cookie** gestionat manual în Server Actions:

```ts
// actions/auth.ts
import { cookies } from "next/headers"
import { medusa } from "@/lib/medusa/client"

export async function loginAction(email: string, password: string) {
  const { token } = await medusa.auth.login("customer", "emailpass", { email, password })
  cookies().set("_medusa_jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 zile
    path: "/",
  })
}

export async function logoutAction() {
  cookies().delete("_medusa_jwt")
  // șterge și cart ID din context (via revalidatePath sau redirect)
}
```

SDK singleton în `lib/medusa/client.ts` **nu** primește `auth.type` — token-ul este extras din cookie și injectat manual în request headers de Server Actions și Server Components care necesită autentificare:

```ts
// În Server Components protejate (cont/*)
const cookieStore = cookies()
const token = cookieStore.get("_medusa_jwt")?.value
const customer = await medusa.customer.retrieve({}, { Authorization: `Bearer ${token}` })
```

`middleware.ts` citește cookie-ul `_medusa_jwt` și redirectează la `/login` dacă lipsește.

---

## Secțiunea 4 — Layout Shared

### Header

- Sticky, `--color-bg`, full-width
- Stânga: logo wordmark "FirIntins" (Cormorant Garamond)
- Centru: Produse, dropdown Categorii (6 categorii din seed), Oferte
- Dreapta: icon search, icon cont, icon coș cu badge count
- La scroll: border-bottom subtil animat
- Mobile: hamburger → overlay full-screen

### Footer

- 3 coloane: descriere brand + social | quick links | contact
- Bar inferior: copyright + politica confidențialitate + termeni

### CartDrawer

- shadcn `Sheet` din dreapta
- `CartItem`: thumbnail + titlu + variantă + stepper cantitate + buton remove
- Staggered entrance animation (0.05s interval)
- Bottom: subtotal + CTA "Finalizează comanda" → `/checkout`
- Empty state cu link înapoi la shop

### CartContext

- Învelește app în RootLayout
- Cart ID persistat în `localStorage` cu cheia `"firintins_cart_id"`
- **Flux la mount:**
  1. `localStorage.getItem("firintins_cart_id")` → dacă există, `medusa.cart.retrieve(id)`
  2. Dacă 404 (cart expirat în Medusa) → `medusa.cart.create()` → salvează noul ID
  3. Dacă nu există în localStorage → `medusa.cart.create()` → salvează ID-ul
- **La logout** (`logoutAction`): `localStorage.removeItem("firintins_cart_id")` — cart-ul guest nu se merge cu contul (YAGNI Faza 1)
- Expune: `addItem`, `removeItem`, `updateQuantity`, `clearCart`, `cart`, `itemCount`

### Breadcrumb

- shadcn `Breadcrumb` pe listing + PDP + cont
- JSON-LD `BreadcrumbList` injectat manual ca `<script type="application/ld+json">` în aceleași pagini
- Trail-uri:
  - Listing: `Acasă > Produse`
  - Categorie: `Acasă > Produse > [Categorie]`
  - PDP: `Acasă > Produse > [Categorie] > [Produs]`

---

## Secțiunea 5 — Pagini

### Homepage (SSG + ISR 1h)

5 secțiuni:
1. **Hero** — full-viewport, fundal dark cu imagine, heading Cormorant, 2 CTA-uri (Explorează produsele / Categorii). Spring entrance, scroll-reveal pe text.
2. **Categorii** — grid asimetric 6 carduri → `/categorii/[slug]`. Scale + border glow pe hover.
3. **Noutăți** — row orizontal scroll, primele 4 produse din seed, `ProductCard`.
4. **De ce FirIntins** — 3 coloane: "Calitate premium" / "Livrare rapidă în România" / "Suport expert". Icon + heading + 2 rânduri copy.
5. **Newsletter** — email input + submit → `/api/newsletter` (no-op). Toast confirmare.

### Listing produse `/produse` + `/categorii/[slug]` (SSR)

- Sidebar: filtre categorie + interval preț
- Grid: `ProductCard` × N
- Paginare server-side via `searchParams`

### ProductCard

- Imagine (picsum placeholder), titlu, preț RON (`--color-mud`), badge categorie
- Hover: scale + border glow
- Link → PDP

### PDP `/produse/[handle]` (SSG + ISR 30min)

- Stânga: galerie imagini (thumbnail strip + imagine principală, `priority` pe prima)
- Dreapta: titlu Cormorant, preț variantă selectată (`--color-mud`), variant selector, buton add-to-cart → CartContext, descriere
- **VariantSelector:** butoane pentru fiecare variantă (ex: "2.5 lbs / 3 lbs / 3.5 lbs" sau "5000 / 6000"); prețul se actualizează la selecție; varianta selectată implicit = prima disponibilă
- Stock-aware: dacă `variant.inventory_quantity === 0`, butonul "Adaugă în coș" devine disabled cu label "Stoc epuizat"
- Schema.org `Product` + `Offer` JSON-LD (cu `lowPrice` pentru Directiva Omnibus)
- `generateMetadata` dinamic

### Auth `/login` + `/register`

- Server Actions cu validare Zod; erori inline sub câmpuri + toast pentru erori generale
- **Login schema:** `z.object({ email: z.string().email(), password: z.string().min(8) })`
- **Register schema:** `z.object({ email: z.string().email(), password: z.string().min(8), firstName: z.string().min(1), lastName: z.string().min(1) })`
- Login → `medusa.auth.login()` → token → httpOnly cookie `_medusa_jwt` (detalii în Secțiunea 3)
- Register → `medusa.auth.register()` → `medusa.customer.create()` → auto-login (același flux ca Login)
- Redirect la `?redirect=` (validat: acceptat doar dacă startsWith `/`, altfel redirect la `/cont`)
- `generateMetadata` returnează `{ robots: { index: false } }` pe ambele pagini

### Checkout `/checkout` (CSR)

Pagina unică CSR cu 3 pași vizuali (state local `step: "address" | "shipping" | "payment"`):

**Pas 1 — Adresă livrare** (Zod + RHF):
- Câmpuri: firstName, lastName, address1, city, postalCode, countryCode (fix "ro"), phone
- Submit → `medusa.cart.update(cartId, { shipping_address: ... })` via Server Action
- Avansează la Pasul 2

**Pas 2 — Metodă livrare:**
- Fetch `medusa.cart.listShippingOptions(cartId)` → afișează "Livrare Standard" + "Livrare Express" din seed
- Selecție → `medusa.cart.selectShippingMethod(cartId, optionId)` via Server Action
- Avansează la Pasul 3

**Pas 3 — Plată Stripe Elements:**
- Server Action creează PaymentSession: `medusa.cart.initiatePaymentSession(cartId, { provider_id: "pp_stripe_stripe" })`
- Returnează `client_secret` din PaymentSession
- Stripe `<Elements>` cu `client_secret` → `<PaymentElement>`
- La submit Stripe (`stripe.confirmPayment`) → on success: `medusa.cart.complete(cartId)` via Server Action
- Redirect la `/checkout/confirmare/[orderId]` cu `orderId` din răspuns

Guest checkout permis — adresa se colectează la Pasul 1 fără autentificare. Webhookul Stripe → Medusa confirmă plata pe backend independent (nu blochează redirect-ul).

### Confirmare comandă

- Sumar comandă: produse, totaluri, adresă livrare
- CTA "Înapoi la magazin"

### Cont `/cont`

- Dashboard: salut, comandă recentă, quick links
- `/cont/comenzi`: lista comenzi cu status badges
- `/cont/comenzi/[id]`: detaliu (produse, totaluri, tracking)
- Adrese + schimbare parolă (Server Actions + Zod)

### `middleware.ts`

- Protejează `/cont/*`
- Redirect → `/login?redirect=/cont/...`
- Validează `redirect` param: acceptat doar dacă startsWith `/`

---

## Secțiunea 6 — SEO & Performance

### generateMetadata

- Homepage: static
- Listing/categorie: `${category.name} | FirIntins`
- PDP: `${product.title} | FirIntins`, description, OG image
- Auth + cont: `{ robots: { index: false } }` via `generateMetadata`

### Schema.org

- `Organization` pe homepage
- `Product` + `Offer` pe PDP
- `BreadcrumbList` pe listing + PDP

### Fișiere automate

- `app/sitemap.ts` — dinamic din produse + categorii via Medusa API
- `app/robots.ts` — disallow: `/checkout`, `/cont`, `/api`

### Core Web Vitals

- `next/image` cu `sizes` corect + `priority` pe LCP (hero + prima imagine PDP)
- `next/font` self-hosted, `display: swap`
- `LazyMotion + domAnimation` — bundle animații -50%
- Skeleton loaders pe cart drawer pentru zero layout shift
- `not-found.tsx` + `error.tsx` cu design consistent

---

## Secțiunea 7 — Testing

### Unit tests (Jest + React Testing Library)

- `formatPrice()` — cazuri limită formatare RON
- `CartContext` — add/remove/update/persist
- Zod schemas — validare auth și checkout

### Smoke tests (fetch contra dev server)

- Homepage HTTP 200
- Listing returnează produse
- PDP rezolvă pentru handle cunoscut (`lanseta-crap-pro-36m`)
- Auth: register → login → acces `/cont`
- Cart: add item → verifică count

---

## Decizii tehnice

| Decizie | Alegere | Motiv |
|---|---|---|
| Abordare build | Infrastructure-first | Fundația odată, paginile autonom |
| SDK | `@medusajs/js-sdk` | SDK oficial Medusa v2 |
| Cart state | React Context + localStorage | Suficient Faza 1, zero overhead |
| Checkout | Stripe Elements embedded | Control complet pe design |
| Animații | `motion/react` LazyMotion + `m` | Bundle -50% vs import direct |
| Validare | Zod + RHF (forms) / Zod (Server Actions) | Tip-safe end-to-end |
| Imagini dev | Picsum placeholder | Unblocks dev, real photos via Admin UI |
| Newsletter | No-op API route | YAGNI — wired în Faza 3 |
| E2E browser | Amânat Faza 3 | Overhead nejustificat acum |
| Limbă | Română only | Piața țintă România |
