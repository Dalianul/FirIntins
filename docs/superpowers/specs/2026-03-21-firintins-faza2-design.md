# FirIntins — Spec Faza 2
**Data:** 2026-03-21
**Proiect:** FirIntins — E-commerce ultra-premium echipamente pescuit la crap
**Faza:** 2 din 4 — Wishlist + Reviews + Cont complet

---

## Context

Faza 1 a livrat: Medusa v2 backend complet + Next.js storefront cu homepage, listing, PDP, coș, checkout Stripe, auth, pagini cont de bază (dashboard, comenzi), SEO, teste.

Faza 2 adaugă trei features noi, implementate **feature-by-feature** (Wishlist → Reviews → Cont complet):

| Feature | Conținut |
|---|---|
| **Wishlist** | Custom Medusa module + storefront UI (heart icon, /cont/wishlist) |
| **Product Reviews** | Custom Medusa module + storefront tab PDP + Admin UI widget cu moderare + reply |
| **Cont complet** | Profil, adrese, securitate (schimbare parolă), wishlist integrat |

---

## Secțiunea 1 — Wishlist (Backend)

### Custom Medusa Module: `wishlist`

**Data models:**

```
Wishlist
  id            string (PK)
  customer_id   string (FK → Customer via Module Link)
  created_at    Date

WishlistItem
  id            string (PK)
  wishlist_id   string (FK → Wishlist)
  product_id    string (FK → Product via Module Link)
  variant_id    string (nullable — NULL = produs salvat fără variantă specifică)
  created_at    Date

Constraint: UNIQUE (wishlist_id, product_id, variant_id)
  — NOTE: în PostgreSQL, NULL != NULL în unique constraints, deci două rânduri cu
    același product_id și variant_id = NULL ar fi permise. Soluție: use partial index
    sau coalesce variant_id la '' (string gol) în unique constraint.
    Decizie: variant_id NULL se stochează ca string gol '' pentru a permite
    constraint-ul UNIQUE corect.
```

Un customer = un singur Wishlist, creat automat la primul add.

**Reguli variant handling:**
- `variant_id = ''` (string gol) = produsul salvat generic, fără variantă specifică
- `variant_id = 'var_xyz'` = o variantă specifică salvată
- Același produs cu variante diferite = WishlistItems separate
- `isInWishlist(productId, variantId?)`: dacă `variantId` omis, returnează `true` dacă există orice item cu `product_id` matching (indiferent de variantă)
- Pe `/cont/wishlist`: fiecare WishlistItem = un card separat; dacă `variant_id` este '', se afișează toate variantele produsului cu un dropdown de selecție; dacă `variant_id` există, se afișează doar acea variantă
- Butonul "Adaugă în coș" din wishlist folosește varianta selectată (sau prima disponibilă dacă variant_id = '')

**Module Links:**
- `WishlistItem.product_id` → `@medusajs/product` (Product)
- `Wishlist.customer_id` → `@medusajs/customer` (Customer)

### Store API Endpoints

```
GET    /store/wishlists              ← returnează wishlist-ul meu + items (auth required)
POST   /store/wishlists/items        ← add item { product_id, variant_id? } (auth required)
DELETE /store/wishlists/items/:id    ← remove item (auth required)
```

### Workflows

- `addToWishlistWorkflow` — verifică dacă wishlist există (creează dacă nu), verifică duplicat, adaugă item
- `removeFromWishlistWorkflow` — verifică ownership, șterge item

### Structura module (`src/modules/wishlist/`)

```
src/modules/wishlist/
├── index.ts          ← defineModule()
├── models/
│   ├── wishlist.ts
│   └── wishlist-item.ts
└── service.ts        ← WishlistModuleService

src/api/store/wishlists/
├── route.ts          ← GET (list my wishlist)
└── items/
    ├── route.ts      ← POST (add item)
    └── [id]/
        └── route.ts  ← DELETE (remove item)

src/workflows/
├── add-to-wishlist.ts
└── remove-from-wishlist.ts

src/links/
└── wishlist-customer.ts  ← Module Link: Wishlist ↔ Customer
└── wishlist-product.ts   ← Module Link: WishlistItem ↔ Product
```

---

## Secțiunea 2 — Wishlist (Storefront)

### `useWishlist` hook

Client hook care fetches `GET /store/wishlists`. Expune:

```ts
{
  items: WishlistItem[]
  addItem: (productId: string, variantId?: string) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  isInWishlist: (productId: string, variantId?: string) => boolean
  isLoading: boolean
}
```

Optimistic updates — UI se actualizează imediat, API call în background. Dacă API call eșuează, se revine la starea anterioară.

### Heart Icon (ProductCard + PDP)

- Toggle heart filled (roșu `#dc2626`) / outline pe hover/activ
- Click când **neautentificat** → redirect `/login?redirect=<current-page>`
- Click când **autentificat** → optimistic toggle + API call în background
- Dacă API call eșuează → revert la starea anterioară + toast eroare
- La adăugare: toast "Adăugat în lista de dorințe" (3s)
- La eliminare: toast "Eliminat din lista de dorințe" (3s) — ambele metode (heart icon + buton "Elimină")
- Poziționat absolut top-right pe `ProductCard`, inline lângă titlu pe PDP

### `/cont/wishlist`

- Grid de produse salvate — fiecare `WishlistItem` = un card
- Dacă `variant_id = ''`: `ProductCard` cu dropdown variantă + "Adaugă în coș" (varianta selectată)
- Dacă `variant_id` specificat: `ProductCard` cu varianta fixată afișată explicit + "Adaugă în coș"
- Buton "Elimină" per card — optimistic remove + toast
- Empty state: text "Nu ai produse salvate" + link "Explorează produsele"
- Server Component: fetch wishlist cu token din cookie, hydrate `useWishlist` cu date inițiale

### Data Layer

```ts
// lib/medusa/queries.ts — adăugat
export async function getWishlist(token: string): Promise<Wishlist>
```

```ts
// actions/wishlist.ts — nou
export async function addToWishlistAction(productId: string, variantId?: string)
export async function removeFromWishlistAction(itemId: string)
```

---

## Secțiunea 3 — Product Reviews (Backend)

### Custom Medusa Module: `product-review`

**Data model:**

```
ProductReview
  id            string (PK)
  product_id    string (FK → Product via Module Link)
  customer_id   string (NOT NULL — guest reviews interzise)
  order_id      string (nullable — dacă există: badge "Cumpărător verificat")
  rating        int (1-5, NOT NULL)
  title         string (max 100 chars, NOT NULL)
  body          text (max 2000 chars, NOT NULL)
  status        enum: "pending" | "approved" | "rejected"  (default: "pending")
  admin_reply   text (nullable)
  created_at    Date
  updated_at    Date
```

Reviews noi intră cu `status: "pending"` — nu sunt publice până la aprobare de admin.

**State machine — tranziții permise:**
```
pending  → approved  (admin publică review-ul)
pending  → rejected  (spam/abuz — rămâne ascuns)
approved → rejected  (admin retrage un review publicat)
rejected → approved  (admin reconsideră — permite corecție)
```
Un review `rejected` nu este vizibil pe PDP. Un review `approved` → `rejected` dispare imediat din PDP (ISR-ul paginii se revalidează via `revalidatePath` din Server Action de moderare).

**Vizibilitate reviews pe storefront:**
- `GET /store/products/:id/reviews` returnează **exclusiv** reviews cu `status: "approved"`
- Reviews `pending` și `rejected` sunt invizibile pentru clienți
- Admin vede toate statusurile în `/admin/product-reviews`

**Module Link:** `ProductReview.product_id` → `@medusajs/product` (Product)

### Store API Endpoints

```
GET  /store/products/:id/reviews    ← reviews aprobate (public, no auth)
POST /store/products/:id/reviews    ← submit review { rating, title, body } (auth required)
```

### Admin API Endpoints

```
GET /admin/product-reviews          ← toate reviews, filtre: ?status=&product_id=
PUT /admin/product-reviews/:id      ← moderare: { status } + { admin_reply }
```

### Workflows

- `submitProductReviewWorkflow` — validare, creare review cu `status: "pending"`, verificare opțională `order_id` (dacă customer a cumpărat produsul)
- `moderateProductReviewWorkflow` — schimbă status + salvează reply

### Structura module (`src/modules/product-review/`)

```
src/modules/product-review/
├── index.ts
├── models/
│   └── product-review.ts
└── service.ts

src/api/store/products/[id]/reviews/
└── route.ts          ← GET (public) + POST (auth)

src/api/admin/product-reviews/
├── route.ts          ← GET (list + filter)
└── [id]/
    └── route.ts      ← PUT (moderate + reply)

src/workflows/
├── submit-product-review.ts
└── moderate-product-review.ts

src/links/
└── review-product.ts  ← Module Link: ProductReview ↔ Product
```

---

## Secțiunea 4 — Product Reviews (Storefront + Admin UI)

### Storefront — Tab sistem pe PDP

Tab-uri: **"Descriere"** (existent) | **"Recenzii (N)"** — N = count reviews aprobate.

**Conținut tab Recenzii:**

1. **Rating agregat** — medie (ex: "4.3 / 5") + 5 bare CSS pentru distribuție stele
2. **Lista reviews** — per review:
   - Stele (1-5 vizual)
   - Titlu (bold) + body
   - Autor: `${firstName} ${lastName[0]}.` + dată relativă
   - Badge "Cumpărător verificat" dacă `order_id` există
   - Răspuns admin (dacă `admin_reply` există): bloc distinct cu label "Răspuns FirIntins", border-left `--color-moss`
3. **Formular submit** (autentificat):
   - Star picker interactiv (hover + click) — toate câmpurile required
   - Input titlu (max 100 chars)
   - Textarea body (max 2000 chars)
   - Buton submit: disabled în timp ce loading (spinner), re-enable la eroare
   - La succes: formular se golește, toast "Recenzia ta a fost trimisă și va fi publicată după aprobare" (5s), formularul se ascunde (replaced cu mesaj "Mulțumim pentru recenzie!")
   - Client-side validation Zod înainte de submit (nu se face request cu câmpuri goale)
   - Un customer poate trimite o singură recenzie per produs — dacă există deja o recenzie pending/approved, formularul se înlocuiește cu "Ai deja o recenzie pentru acest produs"
4. **Banner neautentificat:** "Autentifică-te pentru a lăsa o recenzie" + link `/login?redirect=/produse/[handle]#recenzii`

### Data Layer

```ts
// lib/medusa/queries.ts — adăugat
export async function getProductReviews(productId: string): Promise<ProductReview[]>
```

```ts
// actions/reviews.ts — nou
export async function submitReviewAction(productId: string, data: {
  rating: number
  title: string
  body: string
})
```

**Zod schema:**
```ts
const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().min(1).max(100),
  body: z.string().min(10).max(2000),
})
```

### Admin UI

**Livrare via Medusa Admin UI Extensions** — widget-urile sunt extensii ale dashboard-ului Medusa existent (`http://localhost:9000/app`), nu o aplicație separată și nu o pagină de storefront.

Fișierele de extensie se plasează în `src/admin/` conform convenției Medusa v2.

**Widget pe pagina produsului** — injectat în Medusa Admin la pagina unui produs via `defineWidgetConfig({ zone: "product.details.after" })`:
- Table cu reviews produsului: rating (stele), autor, status (badge), preview body (truncat 80 chars), dată
- Per row: buton "Aprobă" / "Respinge" + textarea inline pentru reply
- Submit reply → `PUT /admin/product-reviews/:id`

**Pagină admin standalone** — custom page Medusa Admin via `defineRouteConfig`, accesibilă la `/extensions/reviews` în dashboard:
- Toate reviews din toate produsele
- Coloane: rating, autor, titlu produs (link → pagina produsului în admin), status, preview body, dată
- Filtru: dropdown status (Toate / În așteptare / Aprobate / Respinse) — default: `pending` first
- Aceleași acțiuni de moderare ca widget-ul de produs

**Structura fișiere admin:**
```
src/admin/
├── widgets/
│   └── product-reviews.tsx     ← widget injectat pe pagina produsului
└── routes/
    └── reviews/
        └── page.tsx            ← pagina standalone /extensions/reviews
```

---

## Secțiunea 5 — Cont complet

### Navigație `/cont/layout.tsx` (extinsă)

```
- Dashboard          /cont
- Comenzile mele     /cont/comenzi
- Lista de dorințe   /cont/wishlist       ← nou (Feature 1)
- Adresele mele      /cont/adrese         ← nou
- Profilul meu       /cont/profil         ← nou
- Securitate         /cont/securitate     ← nou
```

### `/cont/profil`

Formular cu câmpuri: `firstName`, `lastName`, `email`.
Server Action `updateProfileAction` → `medusa.store.customer.update()`.
Zod schema + inline errors. Toast confirmare la succes.

### `/cont/adrese`

Lista adrese salvate (carduri cu: nume, adresă, oraș, cod poștal, țară, telefon).
Buton "Adaugă adresă nouă" → formular (Sheet/Dialog):
- Câmpuri: `firstName`, `lastName`, `address1`, `address2` (opțional), `city`, `postalCode`, `countryCode` (dropdown, default "ro"), `phone`
- Buton edit + delete per card existent
- Checkbox "Setează ca adresă implicită" per card (și în formular add/edit)

**Adresă implicită:**
- Stocată ca `customer.metadata.default_address_id` via `medusa.store.customer.update({ metadata: { default_address_id: id } })`
- Dacă userul șterge adresa implicită: `default_address_id` se șterge din metadata; checkout va afișa formularul gol
- Pe checkout (Pasul 1 — Adresă): dacă `default_address_id` există, câmpurile se pre-completează cu datele acelei adrese (Server Action preia customer + addresses la load)

Server Actions în `actions/account.ts`:
```ts
export async function addAddressAction(data: AddressFormData)
export async function updateAddressAction(addressId: string, data: AddressFormData)
export async function deleteAddressAction(addressId: string)
export async function setDefaultAddressAction(addressId: string)
```

Zod schema `addressSchema` — toate câmpurile required exceptând `address2` și `phone`.

### `/cont/securitate`

Formular schimbare parolă: `currentPassword`, `newPassword` (min 8), `confirmNewPassword`.
Zod: `.refine(d => d.newPassword === d.confirmNewPassword, { message: "Parolele nu coincid", path: ["confirmNewPassword"] })`.

**Flow schimbare parolă (two-step):**
1. Server Action `changePasswordAction(currentPassword, newPassword)`:
   - Pasul 1: re-autentificare cu parola curentă — `medusa.auth.login("customer", "emailpass", { email, password: currentPassword })` — verifică că parola curentă este corectă
   - Dacă login eșuează (401): returnează eroare `"Parola actuală este incorectă"`
   - Pasul 2: update parolă — `medusa.store.customer.update({ password: newPassword }, { Authorization: \`Bearer ${token}\` })`
   - La succes: toast "Parola a fost schimbată", sesiunea rămâne activă (cookie-ul JWT nu se schimbă în Faza 2)

**Notă implementare:** Dacă Medusa v2 nu expune `customer.update({ password })` via store SDK, fallback: custom API route `POST /store/customers/me/change-password` pe backend cu aceeași logică two-step. De verificat în planning cu MCP docs.

### `/cont/wishlist`

Integrat din Feature 1 — grid produse salvate cu `ProductCard` + buton Elimină.

### Pattern comun toate paginile cont

- Server Components cu fetch autentificat (token din cookie `_medusa_jwt`)
- `Suspense` boundaries cu `Skeleton` loaders (shadcn)
- Redirect la `/login` dacă token lipsește (middleware existent)

---

## Secțiunea 6 — Testing

### Unit tests (Jest)

- `WishlistModule` service — add/remove/duplicate prevention
- `ProductReviewModule` service — submit, status transitions
- Zod schemas: `reviewSchema`, `addressSchema`, `profileSchema`, `passwordSchema`
- `useWishlist` hook — optimistic updates, error rollback

### Smoke tests (contra dev server)

- Add to wishlist (autentificat) → verifică în `/cont/wishlist`
- Submit review → verifică `status: "pending"` în Admin
- Approve review → verifică apare pe PDP tab Recenzii
- Add/edit/delete adresă în cont

---

## Ordine de implementare (feature-by-feature)

```
Faza 2.1 — Wishlist
  1. Backend: wishlist module + module links + migrations
  2. Backend: API routes + workflows
  3. Storefront: useWishlist hook + heart icon pe ProductCard + PDP
  4. Storefront: /cont/wishlist page + nav update
  5. Tests

Faza 2.2 — Product Reviews
  1. Backend: product-review module + module links + migrations
  2. Backend: Store API routes + Admin API routes + workflows
  3. Admin UI: widget pe product page + pagină /extensions/reviews
  4. Storefront: tab sistem PDP + lista reviews + formular submit
  5. Tests

Faza 2.3 — Cont complet
  1. /cont/profil
  2. /cont/adrese (CRUD adrese)
  3. /cont/securitate (schimbare parolă)
  4. Actualizare nav layout.tsx
  5. Tests
```

---

## Decizii tehnice

| Decizie | Alegere | Motiv |
|---|---|---|
| Wishlist storage | Custom Medusa module | Date persistente cross-device, legate de customer |
| Wishlist per customer | Un singur wishlist | YAGNI — multiple wishlists = Faza 4+ |
| Reviews moderare | pending → approved/rejected | Prevenire spam, control calitate |
| Guest reviews | Interzise | Calitate + spam prevention |
| Admin reply | Câmp `admin_reply` pe review | Simplu, fără model separat |
| Implementare | Feature-by-feature | Fiecare feature shippable independent |
| UI reviews | Tab pe PDP | Nu întrerupe flow-ul de cumpărare |
| Cont navigație | Sidebar extins | Pattern consistent cu ce există |
