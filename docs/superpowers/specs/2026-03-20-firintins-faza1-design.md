# FirIntins — Spec Faza 1
**Data:** 2026-03-20
**Proiect:** FirIntins — E-commerce ultra-premium echipamente pescuit la crap
**Faza:** 1 din 4 — Fundație (Backend + Storefront + Design System + Auth + Listing + PDP + Coș + Checkout)

---

## Context & Faze

Proiectul este împărțit în 4 faze livrable. Acest spec acoperă exclusiv **Faza 1**.

| Faza | Conținut |
|---|---|
| **1 (acest spec)** | Medusa v2 backend + Next.js storefront + design system + auth + listing produse + PDP + coș animat + checkout Stripe |
| 2 | Wishlist, Reviews, pagina cont completă, comenzi |
| 3 | Blog/MDX, pagini legale, SEO tehnic complet, sitemap, Schema.org |
| 4 | Brands pages, Seturi & Oferte, Noutăți/Promoții, Directive Omnibus |

---

## Secțiunea 1 — Repository & Infrastructură

### Structura monorepo

```
firintins/
├── apps/
│   ├── backend/          ← Medusa v2 (creat via create-medusa-app)
│   └── storefront/       ← Next.js 16 App Router (creat via create-next-app)
├── turbo.json
├── pnpm-workspace.yaml
├── package.json          ← root (Node 20 LTS, engines field)
├── .nvmrc                ← "20"
└── docker-compose.yml    ← PostgreSQL 15 + Redis 7 (pentru dev cu Docker)
```

**Package manager:** pnpm
**Monorepo tool:** Turborepo

### Turborepo pipelines (`turbo.json`)

- `build` — backend compilat înaintea storefront-ului (dependență explicită)
- `dev` — ambele apps pornesc în paralel
- `lint`, `type-check` — rulează în paralel pe ambele apps

### Deployment — VPS netcup

```
netcup VPS
├── Docker Compose (producție)
│   ├── medusa-backend     ← container Node.js (Medusa, port 9000)
│   ├── next-storefront    ← container Node.js (Next.js standalone, port 3000)
│   ├── postgres           ← container PostgreSQL 15
│   ├── redis              ← container Redis 7
│   └── nginx              ← reverse proxy + SSL termination
└── Certbot / Let's Encrypt ← certificate SSL automat (reînnoire automată)
```

**Nginx routing:**
- `api.firintins.ro` → Medusa backend (port 9000)
- `firintins.ro` / `www.firintins.ro` → Next.js storefront (port 3000)

**Docker Compose strategie:**
- `compose.yml` — configurație de bază, folosită atât în dev (laptop) cât și în producție
- `compose.override.yml` — diferențe locale (volume pentru hot reload, porturi expuse)
- Producție: un singur `compose.yml` cu imagini din registry

**CI/CD:**
- GitHub Actions — la push pe `main`: build imagini Docker → push la registry → SSH pe VPS → `docker compose pull && docker compose up -d`

**Backup:**
- Cron job pe VPS: dump PostgreSQL zilnic în `/backups/`, retenție 30 zile

**Variabile de mediu:**
- `.env.example` în fiecare app (committat în repo)
- `.env` pe VPS, gestionat manual sau via GitHub Secrets pentru CI/CD
- `.env` în `.gitignore`

### Dev local — două variante

**Varianta A — Cu Docker (laptop):**
```bash
docker compose up -d   # pornește PostgreSQL 15 + Redis 7
pnpm dev               # Medusa + Next.js rulează nativ
```

**Varianta B — Fără Docker (PC, Windows):**
- PostgreSQL 15: instalat nativ ca Windows service (`winget install PostgreSQL.PostgreSQL`)
- Redis: Memurai (Redis-compatible pentru Windows, fără WSL2) — `winget install Memurai.Memurai`
- **Nu necesită WSL2** — servicii native Windows, pornesc automat la boot
- `pnpm dev` identic

Singura diferență între variante: `DATABASE_URL` și `REDIS_URL` în `.env` pointează la `localhost` (nativ) vs container Docker. Documentat în `README.md` cu instrucțiuni pas-cu-pas pentru ambele scenarii.

---

## Secțiunea 2 — Design System

### Paletă de culori

```css
--color-bg:          #0f0e0b   /* negru cald, fundal principal */
--color-surface:     #1a1814   /* carduri, drawer, modal */
--color-surface-2:   #242019   /* hover states, input backgrounds */
--color-border:      #2e2a22   /* borduri subtile */
--color-moss:        #4a5e3a   /* verde mușchi — accent primar */
--color-moss-light:  #6b8a52   /* hover pe accent primar */
--color-mud:         #8b6914   /* auriu noroios — accent secundar, prețuri */
--color-fog:         #c4bfb0   /* text secundar, placeholder */
--color-cream:       #f0ebe0   /* text primar */
--color-white:       #faf8f3   /* headinguri, text pe CTA */
```

### Tipografie

| Rol | Font | Greutăți |
|---|---|---|
| Display / Headinguri | Cormorant Garamond | 300, 400, 600, 700 |
| Body / UI | Outfit | 300, 400, 500 |

- Încărcate via `next/font/google` (self-hosted automat de Next.js, zero FOUT)
- Niciodată: Inter, Roboto, Arial, system fonts, Space Grotesk

### Componente UI

- **shadcn/ui** cu temă customizată folosind CSS variables de mai sus
- **lucide-react** pentru iconițe (tree-shakeable)
- Container max-width: `1400px`, padding lateral: `clamp(1.5rem, 5vw, 4rem)`
- Grid: 12 coloane, utilizate intenționat asimetric
- Spațiu negativ generos — fără umplere excesivă a ecranului

### Animații Framer Motion

**Package:** `motion` (nu `framer-motion`)
**Importuri:** ÎNTOTDEAUNA din `"motion/react"`, niciodată din `"framer-motion"`

```ts
import { m, LazyMotion, domAnimation, AnimatePresence } from "motion/react"
import { useMotionValue, useTransform, useSpring } from "motion/react"
```

**Pattern global (bundle optimization — CRITIC):**
```tsx
// app/layout.tsx
import { LazyMotion, domAnimation } from "motion/react"
export default function RootLayout({ children }) {
  return <LazyMotion features={domAnimation}>{children}</LazyMotion>
}
```

```tsx
// În componente — `m` în loc de `motion`
import { m } from "motion/react"
<m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
```

**Reguli de implementare:**
- Variantele definite OUTSIDE componentelor (în fișiere `variants.ts` separate) — previne re-render
- `useMotionValue` în loc de `useState` pentru valori animate continuu
- `AnimatePresence` cu `mode="wait"` pentru page transitions
- `AnimatePresence` cu `key` unic pentru cart items
- Spring physics peste tot în loc de easing liniar

**Animații specifice:**
- **Cart drawer:** slide-in din dreapta + staggered reveals pe items (0.05s interval)
- **Page transitions:** fade + slight Y translate (100ms delay între layout și conținut)
- **Product cards:** subtle scale + border glow pe hover
- **Scroll reveals:** `whileInView` cu `once: true` pe secțiuni homepage

---

## Secțiunea 3 — Medusa v2 Backend (Faza 1)

### Module core utilizate as-is (fără cod custom)

| Modul | Utilizare |
|---|---|
| `@medusajs/product` | Produse, variante, categorii, colecții, imagini |
| `@medusajs/inventory` | Stoc per variantă |
| `@medusajs/cart` | Coș, line items, promoții |
| `@medusajs/order` | Comenzi, fulfillment |
| `@medusajs/customer` | Conturi clienți, adrese |
| `@medusajs/payment` | Abstractizare plăți |
| `@medusajs/fulfillment` | Livrare cu rate fixe |

### Plugin-uri instalate în Faza 1

- `@medusajs/payment-stripe` — checkout Stripe
- `@medusajs/file-local` (dev) / `@medusajs/file-s3` (producție) — upload imagini produse
- `@medusajs/notification-sendgrid` — emailuri tranzacționale (confirmare comandă, resetare parolă)

### API Routes (Faza 1)

Toate sunt **Store API routes native Medusa** — nu se scriu API routes custom în Faza 1.

```
/store/products             ← listing cu filtrare (categorii, preț, brand tag)
/store/products/[handle]    ← PDP
/store/categories           ← navigație categorii
/store/cart                 ← CRUD coș
/store/auth                 ← login / register / logout
/store/customers/me         ← profil client
/webhooks/stripe            ← confirmare plată (built-in Medusa)
```

### Variante produs per categorie

| Categorie | Opțiuni variante |
|---|---|
| Lansete | `lungime` (ex: 3.6m, 3.9m, 4.2m) + `tc` — test de curbură (ex: 2.75 lbs, 3 lbs, 3.5 lbs) |
| Mulinete | `marime` (ex: 5000, 6000, 8000) |
| Fire | `diametru` (mm) + `rezistenta` (lbs) |
| Momeli & Năduri | `greutate` (g) + `aroma` |
| Îmbrăcăminte | `marime` (S/M/L/XL) + `culoare` |
| Încălțăminte | `marime` (EU) |
| Avertizoare | `culoare` LED (opțional) |
| Accesorii / Camping | variantă unică sau `culoare`/`marime` după caz |

**Notă terminologie:** TC = Test de Curbură (echivalentul românesc pentru "test curve"), măsurat în lbs.

### Configurare variante produs

Opțiunile de variantă (lungime, TC, mărime etc.) sunt configurate **exclusiv via Medusa Admin UI** sau seed data — nu necesită cod custom în Faza 1. Medusa `@medusajs/product` suportă nativ opțiuni arbitrare de variantă (key-value pairs). La setup inițial, seed script-ul creează categoriile + opțiunile; produsele noi se adaugă din Admin UI.

### Seed data pentru development

- 3 categorii: Lansete, Mulinete, Fire
- 10 produse cu variante, stoc și imagini placeholder
- 1 shipping option: "Curier Standard (3-5 zile) — 20 RON"
- Stripe test keys configurate

### Metodă livrare (Faza 1 — simplificat)

Rate fixe configurate în Medusa admin:
- "Curier Standard (3-5 zile) — 20 RON"
- "Curier Express (1-2 zile) — 35 RON"
- Livrare gratuită peste 300 RON — promoție automată în Medusa

---

## Secțiunea 4 — Next.js Storefront (Faza 1)

### Structura App Router

```
apps/storefront/
├── app/
│   ├── layout.tsx                  ← RootLayout (fonturi, LazyMotion, providers)
│   ├── page.tsx                    ← Homepage
│   ├── (shop)/
│   │   ├── produse/
│   │   │   ├── page.tsx            ← Listing produse (filtrare, paginare)
│   │   │   └── [handle]/
│   │   │       └── page.tsx        ← PDP
│   │   └── categorii/[slug]/
│   │       └── page.tsx            ← Listing per categorie
│   ├── (checkout)/
│   │   ├── cos/
│   │   │   └── page.tsx            ← Fallback coș (fără JS)
│   │   └── checkout/
│   │       ├── page.tsx            ← Checkout Stripe
│   │       └── confirmare/
│   │           └── [order-id]/
│   │               └── page.tsx    ← Confirmare comandă post-plată
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   └── cont/
│       ├── page.tsx                ← Dashboard cont client
│       └── comenzi/page.tsx
├── components/
│   ├── ui/                         ← shadcn/ui components
│   ├── layout/                     ← Header, Footer, Navigation, Breadcrumb
│   ├── product/                    ← ProductCard, ProductGallery, VariantSelector
│   ├── cart/                       ← CartDrawer, CartItem, CartSummary
│   └── checkout/                   ← CheckoutForm, StripeElements
├── lib/
│   ├── medusa/                     ← SDK client + query helpers
│   └── utils/                      ← cn(), formatPrice(), etc.
├── hooks/                          ← useCart, useCustomer
└── middleware.ts                   ← Protecție rute /cont/*
```

### Strategii de randare per pagină

| Pagină | Strategie | Motiv |
|---|---|---|
| Homepage | SSG + ISR (1h) | Conținut semi-static |
| Listing produse | SSR | Filtrare via searchParams |
| PDP | SSG + ISR (30min) | SEO critic, conținut schimbat rar |
| Checkout | CSR | Sesiune utilizator |
| Cont client | CSR + Server Actions | Date personale |

### State management coș

- **React Context** (fără Zustand/Jotai — suficient pentru Faza 1)
- Cart ID persistat în `localStorage`
- La fiecare încărcare: cart ID verificat cu Medusa API, recreat dacă expirat

**Flow guest → client autentificat:**
- La login din pagina de checkout: Medusa `transferCart` API apelat automat — coșul guest este transferat pe contul clientului
- Cart ID-ul din `localStorage` rămâne același, contexte React nu se resetează
- Dacă clientul era deja logat: coșul nou creat este asociat direct cu `customer_id`

### Medusa JS SDK

- Inițializat o singură dată în `lib/medusa/client.ts`
- Folosit direct în Server Components pentru date publice
- Folosit via custom hooks (`useCart`, `useCustomer`) în Client Components

---

## Secțiunea 5 — SEO Tehnic (Faza 1)

### generateMetadata dinamic

Fiecare pagină exportă funcție async `generateMetadata`:

```ts
// PDP example
export async function generateMetadata({ params }): Promise<Metadata> {
  const product = await getProduct(params.handle)
  return {
    title: `${product.title} | FirIntins`,
    description: product.description,
    openGraph: { images: [product.thumbnail] },
    alternates: { canonical: `/produse/${params.handle}` }
  }
}
```

### Schema.org (Faza 1)

Injectat via `<script type="application/ld+json">`:
- `Product` + `Offer` pe PDP (inclusiv `lowPrice` pentru Directiva Omnibus)
- `BreadcrumbList` pe listing + PDP
- `Organization` pe homepage

### Fișiere automate Next.js

- `app/sitemap.ts` — generează dinamic din produse + categorii via Medusa API
- `app/robots.ts` — blochează `/checkout`, `/cont`, `/api`

### Core Web Vitals

- Imagini via `next/image` cu `sizes` corect și `priority` pe LCP (prima imagine produs hero)
- Fonturi via `next/font` — self-hosted, `display: swap`
- Niciun layout shift pe cart drawer (spațiu rezervat via CSS)
- `loading="lazy"` implicit pe toate imaginile non-hero

### Directiva Omnibus (Legea 148/2023)

- Câmp `original_price` adăugat ca **metadata** pe produse în Medusa
- Afișat pe PDP ca preț barat cu nota: *"Cel mai mic preț din ultimele 30 de zile"*

### Breadcrumbs

- Componentă `<Breadcrumb>` în `components/layout/` sincronizată cu structura URL
- Bazată pe shadcn/ui `Breadcrumb` component
- Dublată de `BreadcrumbList` Schema.org

---

## Secțiunea 6 — Checkout Stripe & Autentificare

### Flow Checkout

```
Coș → Email (guest sau login prompt) → Adresă livrare →
Metodă livrare → Plată Stripe Elements → Confirmare comandă
```

- **Stripe Elements** embedded în `/checkout` — nu Stripe Checkout hosted (control complet pe design)
- **Guest checkout** permis — email + adresă + plată fără cont
- **Post-plată:** Medusa webhook confirmă → order creat → email confirmare SendGrid
- Pagina `/checkout/confirmare/[order-id]` — order summary

### Variabile de mediu Stripe

```
# apps/backend/.env
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# apps/storefront/.env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
```

### Autentificare client (Medusa Auth nativ)

| Acțiune | Endpoint Medusa | Implementare storefront |
|---|---|---|
| Register | `POST /store/customers` | Server Action + redirect |
| Login | `POST /store/auth/token` | Server Action → JWT în httpOnly cookie |
| Logout | `DELETE /store/auth` | Server Action → cookie șters |
| Sesiune | JWT verificat | `middleware.ts` |
| Resetare parolă | Flow Medusa built-in | Email SendGrid |

### Protecție rute (`middleware.ts`)

- Protejează `/cont/*`
- Redirect la `/login?redirect=/cont/...` dacă neautentificat
- Revenire automată la pagina originală după login
- **Open redirect prevention:** parametrul `redirect` validat — acceptate doar rute interne (startsWith `/`), niciodată URL-uri externe

### Gestionare erori plată Stripe

- Card declined / fonduri insuficiente: eroare afișată inline în Stripe Elements (componentă nativă Stripe) + toast shadcn cu mesaj explicit
- Timeout Stripe: retry automat o dată, apoi mesaj "Încearcă din nou"
- Webhook failure: Medusa retry automat (3 încercări), order rămâne în stare `pending` până la confirmare

---

## Secțiunea 7 — Decizii de implementare suplimentare

### TypeScript

- `strict: true` în ambele `tsconfig.json` (backend + storefront)
- `noImplicitAny: true`, `strictNullChecks: true`
- `noUncheckedIndexedAccess: true` în storefront (previne acces nesigur pe array-uri din API)

### Validare formulare

- **Server Actions (auth, checkout):** Zod schema pentru validare server-side
- **Client forms (adrese, date personale):** React Hook Form + Zod resolver pentru feedback instant
- Erori Zod serializate și returnate din Server Actions ca `{ errors: ZodError }` — afișate inline lângă câmpuri

### Medusa Admin (Faza 1)

- Admin UI disponibil la `https://api.firintins.ro/app` (generat automat de Medusa)
- Admin user creat via CLI: `npx medusa user -e admin@firintins.ro -p <parola>`
- Pe VPS: acces direct la URL-ul public, protejat de autentificarea Medusa admin (JWT separat de customer JWT)
- Recomandare producție: IP whitelisting în Nginx pentru `/app` — acces doar din IP-ul administratorului

### CI/CD — Injectare secrets

Variabilele de mediu ajung pe VPS astfel:
1. **GitHub Secrets** stochează: `VPS_SSH_KEY`, `VPS_HOST`, `REGISTRY_TOKEN`, toate cheile de producție
2. **GitHub Actions** generează `.env` pe VPS la fiecare deploy via SSH:
   ```bash
   ssh $VPS_HOST "echo 'DATABASE_URL=${{ secrets.DATABASE_URL }}' > /opt/firintins/apps/backend/.env"
   ```
3. Alternativ: fișier `.env` configurat manual o singură dată pe VPS, CI/CD nu îl suprascrie

### Imagini produs

- **Număr imagini per produs:** 1 thumbnail + max 5 imagini galerie (configurat în Admin UI)
- **Stocare dev:** `@medusajs/file-local` — salvate în `apps/backend/uploads/`
- **Stocare producție:** `@medusajs/file-s3` — bucket S3 (sau compatibil S3: Cloudflare R2, Hetzner Object Storage)
- **Optimizare storefront:** `next/image` cu `sizes` responsiv, format WebP automat, `srcset` generat de Next.js
- `priority` prop pe prima imagine din galerie (LCP)

### Pagini de eroare Next.js

- `app/not-found.tsx` — pagina 404 cu design consistent, link înapoi la homepage
- `app/error.tsx` — pagina 500 cu mesaj generic, fără stack trace în producție
- `app/global-error.tsx` — fallback pentru erori la nivel de layout

---

## Decizii tehnice documentate

| Decizie | Alegere | Motiv |
|---|---|---|
| Repo structure | Monorepo Turborepo + pnpm | Tipuri partajate, un singur repo |
| Arhitectură | Abordarea B (create-medusa-app + Next.js custom) | Backend corect din prima, storefront liber |
| Package manager | pnpm | Standard de facto, recomandat Medusa v2 |
| Blog & pagini legale | MDX static (Faza 3) | YAGNI — nu în Faza 1 |
| Auth | Medusa Auth nativ | Zero dependențe extra, suficient pentru cerințe |
| Limbă | Română only | Piața țintă România |
| Deployment | VPS netcup + Docker Compose | Control total, cost predictibil |
| Dev local | Docker (laptop) SAU nativ PostgreSQL+Redis (PC) | Docker nu merge pe PC |
| Cart state | React Context + localStorage | Suficient pentru Faza 1, fără overhead |
| Checkout | Stripe Elements embedded | Control complet pe design |
| Animații | `motion` pkg, imports din `"motion/react"`, LazyMotion + `m` | Bundle optimization -50% |
