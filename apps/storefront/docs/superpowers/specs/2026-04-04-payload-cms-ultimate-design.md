# PayloadCMS Ultimate Client-Friendly Enhancement — Design Spec

**Date:** 2026-04-04
**Status:** Approved
**Scope:** apps/storefront (Payload CMS v3 + Next.js 16 App Router)

---

## Goal

Make the Payload CMS admin panel fully self-sufficient for non-developer clients. After this work, a client can manage all site content — blog posts, pages, homepage layout, navigation, footer, site settings, FAQs, testimonials — without ever touching code.

---

## Approach

Payload-native Globals + Blocks. No third-party page builder plugins. Uses Payload's built-in primitives (Globals, Blocks field, Versions, Draft mode, Live Preview, Access Control functions) exclusively.

---

## 1. New Globals

### `site-settings`
**File:** `globals/SiteSettings.ts`

| Field | Type | Notes |
|---|---|---|
| `siteName` | text | Displayed in admin header |
| `logo` | upload → media | Brand logo |
| `phone` | text | Contact phone |
| `email` | email | Contact email |
| `address` | textarea | Physical address |
| `socialLinks` | array | `{ platform: select(facebook/instagram/youtube/tiktok/x), url: text }` |
| `googleAnalyticsId` | text | GA4 measurement ID (e.g. G-XXXXXXXX) |
| `defaultSeoImage` | upload → media | Fallback OG image for pages with no cover |

**Access:** Admin: full edit. Editor: read only.
**Cache tag:** `cms-globals` — invalidated on `afterChange`.

---

### `navigation`
**File:** `globals/Navigation.ts`

| Field | Type | Notes |
|---|---|---|
| `items` | array | `{ label: text, url: text, newTab: checkbox, children: array of { label, url } }` |

Max one level of nesting (dropdown menus). Client reorders via drag-and-drop.

**Access:** Admin only (full edit). Editor: no access.
**Cache tag:** `cms-globals`.

---

### `footer`
**File:** `globals/Footer.ts`

| Field | Type | Notes |
|---|---|---|
| `columns` | array | `{ heading: text, links: array of { label: text, url: text } }` |
| `legalText` | richText | Copyright line, GDPR note |
| `showNewsletter` | checkbox | Toggles newsletter widget in footer |

**Access:** Admin: full edit. Editor: no access.
**Cache tag:** `cms-globals`.

---

### `homepage`
**File:** `globals/Homepage.ts`

| Field | Type | Notes |
|---|---|---|
| `title` | text | Internal label only (never shown on frontend) |
| `blocks` | Blocks | Page builder — see Block Palette below |

**Versions + Drafts:** enabled.
**Live Preview:** enabled — preview URL: `/`.
**Access:** Admin: full edit + publish. Editor: read only.
**Cache tag:** `cms-homepage` — invalidated on `afterChange`.

---

## 2. Homepage Page Builder — Block Palette

All blocks live in `blocks/` directory (one file per block type), imported into `globals/Homepage.ts`.

### `HeroBlock`
| Field | Type |
|---|---|
| `heading` | text |
| `subheading` | textarea |
| `backgroundImage` | upload → media |
| `ctaLabel` | text |
| `ctaUrl` | text |
| `overlay` | select: none / dark / light |

---

### `FeaturedProductsBlock`
| Field | Type |
|---|---|
| `heading` | text |
| `productHandles` | array of text (Medusa product handles) |
| `layout` | select: grid / carousel |

> **Frontend note:** The block component calls `getProduct(handle)` for each handle from the Medusa API at render time. Results are cached individually via existing Medusa query helpers.

---

### `OffersBlock`
| Field | Type |
|---|---|
| `heading` | text |
| `offers` | array of `{ title, description, image: upload→media, badge: text, ctaUrl: text }` |

---

### `FeaturesGridBlock`
| Field | Type |
|---|---|
| `heading` | text |
| `items` | array of `{ icon: select(fish/hook/rod/boat/star/shield/truck/leaf), title: text, description: text }` |

---

### `TestimonialsBlock`
| Field | Type |
|---|---|
| `heading` | text |
| `items` | relationship → Testimonials (hasMany) |

---

### `FaqBlock`
| Field | Type |
|---|---|
| `heading` | text |
| `items` | relationship → Faqs (hasMany) |

---

### `RichTextBlock`
| Field | Type |
|---|---|
| `content` | richText (full Lexical editor with all existing features) |

---

### `CtaBlock`
| Field | Type |
|---|---|
| `heading` | text |
| `subheading` | textarea |
| `ctaLabel` | text |
| `ctaUrl` | text |
| `background` | select: moss / mud / dark |

---

### `ImageBannerBlock`
| Field | Type |
|---|---|
| `image` | upload → media |
| `caption` | text (optional) |
| `linkUrl` | text (optional) |

---

## 3. Upgraded Collections

### Posts
- **Versions + Drafts:** `versions: { drafts: true }` — replaces manual `status` field (removed)
- **Live Preview:** preview URL `/blog/{slug}`
- SEO plugin already present — no change

### Pages
- **SEO plugin:** added (same config as Posts, URL: `/pagini/{slug}`)
- **Versions + Drafts:** `versions: { drafts: true }` — replaces manual `status` field on Pages if any
- **Live Preview:** preview URL `/pagini/{slug}`

### Users
- **New field:** `role` (select: `admin` | `editor`, defaultValue: `editor`, required)
- Access control functions added to every collection/global referencing `req.user.role`

### Media
- **New field:** `caption` (text, optional)
- **New field:** `focalPoint` (point field — built-in Payload) — for smart image cropping

---

## 4. New Collections

### `Testimonials`
**File:** `collections/Testimonials.ts`

| Field | Type | Notes |
|---|---|---|
| `author` | text, required | Customer name |
| `role` | text | e.g. "Pescar din Cluj" |
| `quote` | textarea, required | The review text |
| `avatar` | upload → media | Optional photo |
| `rating` | number (1–5) | Star rating |

Access: Admin full CRUD, Editor full CRUD.

---

### `Faqs`
**File:** `collections/Faqs.ts`

| Field | Type | Notes |
|---|---|---|
| `question` | text, required | |
| `answer` | richText | Full Lexical editor |
| `category` | select | general / shipping / returns / products |

Access: Admin full CRUD, Editor full CRUD.

---

## 5. Versions, Drafts & Live Preview

**Enabled on:** Posts, Pages, homepage global.

**Draft behaviour:**
- Saving creates a new version automatically
- Content stays in "Draft" state until client clicks Publish
- Client can browse version history and restore any past version
- Drafts are invisible on the public frontend

**Live Preview:**
- Payload sends draft data to Next.js via a secure signed preview URL
- Next.js sets a draft mode cookie; the page renders in draft mode inside an iframe in the admin panel
- Debounced updates as the client types — near real-time
- Preview endpoints: `app/api/draft/route.ts` (enable) + `app/api/disable-draft/route.ts` (disable)
- Configured in each collection/global via `admin.livePreview.url` function

---

## 6. Role-Based Access Control

Two roles: `admin` and `editor`. Access defined via functions in `lib/cms/access.ts` — imported by each collection/global.

**Helper functions in `lib/cms/access.ts`:**
- `isAdmin(req)` → boolean
- `isAdminOrEditor(req)` → boolean
- `isAdminField(args)` → boolean (for field-level access)

**Access matrix:**

| Resource | Admin | Editor |
|---|---|---|
| Posts | full CRUD + publish | full CRUD + publish |
| Pages | full CRUD + publish | full CRUD + publish |
| Categories | full CRUD | full CRUD |
| Testimonials | full CRUD | full CRUD |
| Faqs | full CRUD | full CRUD |
| Media | full CRUD | full CRUD |
| Newsletter Subscribers | read | no access |
| site-settings | full edit | read only |
| navigation | full edit | no access |
| footer | full edit | no access |
| homepage | full edit + publish | read only |
| Users | full CRUD | no access |

---

## 7. SEO & Media Changes

**SEO plugin** extended to include Pages collection:
```ts
seoPlugin({
  collections: ['posts', 'pages'],  // was: ['posts'] only
  // ... rest unchanged
})
```

**Pages URL generation:** `/pagini/{slug}`

**Media collection additions:**
- `caption` (text) — shown under images in content
- `focalPoint` (point) — smart crop anchor

**`defaultSeoImage`** from site-settings used as fallback in all page metadata generation when no collection-level OG image is set.

---

## 8. Frontend Integration

### New CMS query functions (added to `lib/cms/client.ts`)

| Function | Cache tag | Returns |
|---|---|---|
| `getHomepage()` | `cms-homepage` | Full homepage global with populated blocks |
| `getSiteSettings()` | `cms-globals` | Site settings global |
| `getNavigation()` | `cms-globals` | Navigation global |
| `getFooter()` | `cms-globals` | Footer global |
| `getTestimonials()` | `cms-blog` | All testimonials |
| `getFaqs(category?)` | `cms-blog` | FAQs, optional category filter |

All use `"use cache"` + `cacheTag` + `cacheLife` matching existing patterns.

---

### Block renderer

**File:** `components/blocks/BlockRenderer.tsx`

A `switch` on `block.blockType` mapping each type to its component:

```
components/blocks/
  BlockRenderer.tsx       ← switch dispatcher
  HeroBlock.tsx
  FeaturedProductsBlock.tsx
  OffersBlock.tsx
  FeaturesGridBlock.tsx
  TestimonialsBlock.tsx
  FaqBlock.tsx
  RichTextBlock.tsx
  CtaBlock.tsx
  ImageBannerBlock.tsx
```

Homepage page (`app/(main)/(shop)/page.tsx`) fetches homepage global and renders `<BlockRenderer blocks={homepage.blocks} />`.

---

### Layout component updates

- **Header** — reads from `getNavigation()` instead of hardcoded links
- **Footer** — reads from `getFooter()` (replaces `getFooterPages()` + hardcoded structure)
- **Root layout** — GA ID sourced from `getSiteSettings().googleAnalyticsId`

---

### Draft mode endpoints

| Route | Purpose |
|---|---|
| `app/api/draft/route.ts` | Payload calls this to enable draft mode cookie |
| `app/api/disable-draft/route.ts` | Disables draft mode, redirects to page |

Protected by a `PAYLOAD_PREVIEW_SECRET` env var checked against the token Payload sends.

---

## 9. Environment Variables Added

```
PAYLOAD_PREVIEW_SECRET=<random secret for draft mode>
```

---

## 10. Files Changed / Created Summary

**New globals:**
- `globals/SiteSettings.ts`
- `globals/Navigation.ts`
- `globals/Footer.ts`
- `globals/Homepage.ts`

**New blocks:**
- `blocks/HeroBlock.ts`
- `blocks/FeaturedProductsBlock.ts`
- `blocks/OffersBlock.ts`
- `blocks/FeaturesGridBlock.ts`
- `blocks/TestimonialsBlock.ts`
- `blocks/FaqBlock.ts`
- `blocks/RichTextBlock.ts`
- `blocks/CtaBlock.ts`
- `blocks/ImageBannerBlock.ts`

**New collections:**
- `collections/Testimonials.ts`
- `collections/Faqs.ts`

**New lib:**
- `lib/cms/access.ts` — role helper functions

**New frontend:**
- `components/blocks/BlockRenderer.tsx` + 9 block components
- `app/api/draft/route.ts`
- `app/api/disable-draft/route.ts`

**Modified:**
- `payload.config.ts` — register globals, new collections, SEO on Pages, live preview config
- `collections/Posts.ts` — versions/drafts, live preview, remove status field
- `collections/Pages.ts` — SEO plugin, versions/drafts, live preview
- `collections/Users.ts` — role field + access control
- `collections/Media.ts` — caption + focalPoint fields
- `lib/cms/client.ts` — new query functions
- `app/(main)/(shop)/page.tsx` — block renderer
- `components/layout/Header.tsx` — dynamic navigation
- `components/layout/Footer.tsx` — dynamic footer
- `app/(main)/layout.tsx` — dynamic GA ID

---

## Out of Scope

- Scheduled publishing (can be added later via `@payloadcms/plugin-scheduled-publishing`)
- Medusa product/order data — untouched
- Checkout, cart, auth flows — untouched
- Custom admin dashboard widgets — future enhancement
