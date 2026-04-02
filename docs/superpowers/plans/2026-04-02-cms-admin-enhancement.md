# CMS Admin Enhancement + Frontend Polish — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade Payload CMS editor, add SEO plugin on Posts, install Tailwind typography, add Framer Motion B-scope animations, and polish UI with cursor/contrast/safe-area fixes.

**Architecture:** Each task is self-contained and independently deployable. No shared state between tasks. Backend changes (Lexical, SEO) run in the same Next.js process as the storefront via Payload v3's embedded model.

**Tech Stack:** Payload CMS v3 · `@payloadcms/richtext-lexical` · `@payloadcms/plugin-seo` · `@tailwindcss/typography` · Tailwind v4 · `motion/react` (Framer Motion v12) · Base UI · Next.js 16 App Router

---

## File Map

| File | Change |
|------|--------|
| `apps/storefront/collections/Posts.ts` | Replace empty `lexicalEditor({})` with full feature set |
| `apps/storefront/collections/Pages.ts` | Same lexical upgrade |
| `apps/storefront/payload.config.ts` | Add `seoPlugin` to plugins array |
| `apps/storefront/app/(main)/(shop)/blog/[slug]/page.tsx` | Prefer `post.meta.*` fields in `generateMetadata` |
| `apps/storefront/payload-types.ts` | Regenerated — do not hand-edit |
| `apps/storefront/app/globals.css` | Add `@plugin "@tailwindcss/typography"`, cursor-pointer rules, safe area CSS |
| `apps/storefront/components/blog/post-content.tsx` | Full prose theming + iframe handling |
| `apps/storefront/components/ui/sheet.tsx` | Fix slide distance (`translate-x-full`) + darken backdrop |
| `apps/storefront/components/cart/cart-drawer.tsx` | Brand-theme SheetContent |
| `apps/storefront/app/(main)/layout.tsx` | Wrap `<main>` in `m.main` fade; add `viewport-fit=cover` |
| `apps/storefront/components/product/product-grid.tsx` | Pass products to new animated client component |
| `apps/storefront/components/product/product-grid-animated.tsx` | **Create** — "use client" stagger wrapper |
| `apps/storefront/app/(main)/(shop)/blog/blog-listing.tsx` | Add motion stagger + re-stagger on filter change |
| `apps/storefront/components/product/product-card.tsx` | `aspect-[4/3]` + compare_at_price crossed-out |
| `apps/storefront/components/layout/header.tsx` | `pt-[env(safe-area-inset-top)]` |
| `apps/storefront/components/layout/footer.tsx` | `pb-[env(safe-area-inset-bottom)]` |

---

## Task 1: Lexical Editor Upgrade

**Files:**
- Modify: `apps/storefront/collections/Posts.ts`
- Modify: `apps/storefront/collections/Pages.ts`

The current `lexicalEditor({})` has no features — the admin editor is a blank box. This task gives the client a fully capable rich text editor.

- [ ] **Step 1: Update Posts.ts**

Replace the entire file content:

```ts
import type { CollectionConfig } from "payload"
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

export const Posts: CollectionConfig = {
  slug: "posts",
  admin: {
    useAsTitle: "title",
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: {
        description: "Auto-generated from title. URL-friendly, e.g. ghid-pescuit-crap",
      },
    },
    {
      name: "category",
      type: "relationship",
      relationTo: "categories",
      required: true,
    },
    {
      name: "coverImage",
      type: "upload",
      relationTo: "media",
      required: true,
    },
    {
      name: "excerpt",
      type: "textarea",
      maxLength: 200,
    },
    {
      name: "content",
      type: "richText",
      editor: lexicalEditor({
        features: [
          HeadingFeature({ enabledHeadingSizes: ["h2", "h3", "h4"] }),
          BoldFeature(),
          ItalicFeature(),
          UnderlineFeature(),
          StrikethroughFeature(),
          BlockquoteFeature(),
          LinkFeature({ enabledCollections: [] }),
          UploadFeature({
            collections: {
              media: {
                fields: [{ name: "alt", type: "text" }],
              },
            },
          }),
          YouTubeFeature(),
          HorizontalRuleFeature(),
          OrderedListFeature(),
          UnorderedListFeature(),
          ChecklistFeature(),
        ],
      }),
    },
    {
      name: "author",
      type: "text",
    },
    {
      name: "publishedAt",
      type: "date",
    },
    {
      name: "status",
      type: "select",
      defaultValue: "draft",
      options: [
        { label: "Draft", value: "draft" },
        { label: "Published", value: "published" },
      ],
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data?.title && !data?.slug) {
          data.slug = (data.title as string)
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "")
        }
        return data
      },
    ],
    afterChange: [
      async () => {
        try {
          const { revalidateTag } = await import("next/cache")
          revalidateTag("cms-blog", {})
        } catch (e) {
          console.warn("cms-blog revalidation skipped:", e)
        }
      },
    ],
  },
}
```

- [ ] **Step 2: Update Pages.ts**

Replace the entire file content:

```ts
import type { CollectionConfig } from "payload"
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

export const Pages: CollectionConfig = {
  slug: "pages",
  admin: {
    useAsTitle: "title",
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: {
        description: "URL slug, e.g. despre-noi, gdpr, termeni-si-conditii, retur",
      },
    },
    {
      name: "content",
      type: "richText",
      editor: lexicalEditor({
        features: [
          HeadingFeature({ enabledHeadingSizes: ["h2", "h3", "h4"] }),
          BoldFeature(),
          ItalicFeature(),
          UnderlineFeature(),
          StrikethroughFeature(),
          BlockquoteFeature(),
          LinkFeature({ enabledCollections: [] }),
          UploadFeature({
            collections: {
              media: {
                fields: [{ name: "alt", type: "text" }],
              },
            },
          }),
          YouTubeFeature(),
          HorizontalRuleFeature(),
          OrderedListFeature(),
          UnorderedListFeature(),
          ChecklistFeature(),
        ],
      }),
    },
    {
      name: "showInFooter",
      type: "checkbox",
      defaultValue: false,
      admin: {
        description: "Show link to this page in the footer Informații column",
      },
    },
  ],
  hooks: {
    afterChange: [
      async () => {
        try {
          const { revalidateTag } = await import("next/cache")
          revalidateTag("cms-pages", {})
        } catch (e) {
          console.warn("cms-pages revalidation skipped:", e)
        }
      },
    ],
  },
}
```

- [ ] **Step 3: Verify**

Start the storefront dev server (`pnpm --filter storefront dev`). Open `http://localhost:3000/admin`, navigate to Posts → create or edit a post, confirm the editor toolbar shows: headings dropdown (H2/H3/H4), bold, italic, underline, strikethrough, blockquote, link, upload, YouTube, horizontal rule, ordered list, unordered list, checklist.

- [ ] **Step 4: Commit**

```bash
git add apps/storefront/collections/Posts.ts apps/storefront/collections/Pages.ts
git commit -m "feat(cms): upgrade Lexical editor with full feature set on Posts and Pages"
```

---

## Task 2: SEO Plugin

**Files:**
- Modify: `apps/storefront/payload.config.ts`
- Modify: `apps/storefront/app/(main)/(shop)/blog/[slug]/page.tsx`
- Regenerate: `apps/storefront/payload-types.ts`

The SEO plugin adds a dedicated **SEO tab** to every post with metaTitle (character counter), metaDescription (textarea with counter), OG image upload, and a live Google search preview.

- [ ] **Step 1: Install the package**

```bash
pnpm add @payloadcms/plugin-seo --filter storefront
```

Expected: package added to `apps/storefront/package.json`, no errors.

- [ ] **Step 2: Update payload.config.ts**

Replace the full file:

```ts
import { buildConfig } from "payload"
import { postgresAdapter } from "@payloadcms/db-postgres"
import { lexicalEditor } from "@payloadcms/richtext-lexical"
import { seoPlugin } from "@payloadcms/plugin-seo"
import path from "path"

// Import collections
import { Users } from "./collections/Users"
import { Posts } from "./collections/Posts"
import { Pages } from "./collections/Pages"
import { Categories } from "./collections/Categories"
import { NewsletterSubscribers } from "./collections/NewsletterSubscribers"

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3000",
  secret: process.env.PAYLOAD_SECRET ?? "",
  db: postgresAdapter({
    pool: {
      connectionString: process.env.PAYLOAD_DATABASE_URL,
    },
  }),
  editor: lexicalEditor({}),
  collections: [
    Users,
    Categories,
    Posts,
    Pages,
    NewsletterSubscribers,
    {
      slug: "media",
      upload: true,
      access: {
        read: () => true,
      },
      fields: [{ name: "alt", type: "text" }],
    },
  ],
  plugins: [
    seoPlugin({
      collections: ["posts"],
      generateTitle: ({ doc }) =>
        `${(doc as { title?: string }).title ?? ""} — FirIntins Blog`,
      generateDescription: ({ doc }) =>
        (doc as { excerpt?: string }).excerpt ?? "",
      generateURL: ({ doc }) =>
        `${process.env.NEXT_PUBLIC_SERVER_URL ?? "https://firintins.ro"}/blog/${(doc as { slug?: string }).slug ?? ""}`,
    }),
  ],
  typescript: {
    outputFile: path.resolve(process.cwd(), "payload-types.ts"),
  },
  admin: {
    user: "users",
    meta: { title: "FirIntins CMS" },
  },
})
```

- [ ] **Step 3: Regenerate payload-types.ts**

```bash
pnpm --filter storefront generate:types
```

Expected: `apps/storefront/payload-types.ts` is updated with `meta` fields on the `Post` type. Look for something like:
```ts
meta?: {
  title?: string | null
  description?: string | null
  image?: (number | null) | Media
} | null
```

- [ ] **Step 4: Update blog post generateMetadata**

In `apps/storefront/app/(main)/(shop)/blog/[slug]/page.tsx`, replace the `generateMetadata` function:

```ts
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getCachedPost(slug)
  if (!post) return {}

  const metaTitle = (post as any).meta?.title as string | null | undefined
  const metaDescription = (post as any).meta?.description as string | null | undefined
  const metaImageRaw = (post as any).meta?.image
  const metaImageUrl =
    typeof metaImageRaw === "object" && metaImageRaw?.url
      ? mediaUrl(metaImageRaw.url as string)
      : null

  return {
    title: metaTitle ?? `${post.title} — FirIntins Blog`,
    description: metaDescription ?? post.excerpt ?? undefined,
    alternates: { canonical: `${BASE_URL}/blog/${slug}` },
    openGraph: {
      title: metaTitle ?? post.title,
      description: metaDescription ?? post.excerpt ?? undefined,
      url: `${BASE_URL}/blog/${slug}`,
      images: metaImageUrl
        ? [{ url: metaImageUrl }]
        : [{ url: `${BASE_URL}/og-default.jpg` }],
    },
  }
}
```

- [ ] **Step 5: Verify**

Start the dev server. Open a post in the admin panel. Confirm a new **SEO** tab is visible with: Meta Title field (with character counter), Meta Description textarea (with counter), Image upload field, and a live Google preview at the bottom. Auto-populate should pre-fill Meta Title from the post title.

Note: Payload's postgres adapter automatically creates the new `meta_*` columns on first server start in dev mode. No manual migration needed.

- [ ] **Step 6: Commit**

```bash
git add apps/storefront/payload.config.ts apps/storefront/app/(main)/(shop)/blog/[slug]/page.tsx apps/storefront/payload-types.ts apps/storefront/package.json pnpm-lock.yaml
git commit -m "feat(cms): add SEO plugin to Posts collection with meta title/description/image fields"
```

---

## Task 3: Tailwind Typography + PostContent

**Files:**
- Modify: `apps/storefront/app/globals.css`
- Modify: `apps/storefront/components/blog/post-content.tsx`

**Critical context:** `PostContent` uses `prose prose-invert` Tailwind classes, but `@tailwindcss/typography` is not installed. Every single prose class in that component (`prose-headings:*`, `prose-p:*`, etc.) is currently a no-op — blog posts render with zero prose styling. This task fixes that.

- [ ] **Step 1: Install the package**

```bash
pnpm add -D @tailwindcss/typography --filter storefront
```

Expected: package added to devDependencies in `apps/storefront/package.json`.

- [ ] **Step 2: Register the plugin in globals.css**

In `apps/storefront/app/globals.css`, add `@plugin "@tailwindcss/typography";` after the existing `@import` lines (Tailwind v4 uses CSS-based plugin registration — there is no tailwind.config.ts):

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";
@plugin "@tailwindcss/typography";
```

The rest of the file (`:root`, `@theme inline`, `@layer base`, `.dark`) stays unchanged.

- [ ] **Step 3: Upgrade PostContent**

Replace `apps/storefront/components/blog/post-content.tsx`:

```tsx
import { RichText } from "@payloadcms/richtext-lexical/react"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function PostContent({ content }: { content: any }) {
  if (!content) return null
  return (
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
  )
}
```

- [ ] **Step 4: Verify**

Navigate to any blog post (`/blog/<slug>`). The body text should now render with proper typography: paragraphs spaced correctly, headings styled with Cormorant Garamond font, links in moss-light color, blockquotes with left border. If a post has embedded YouTube content, the iframe should be full-width with a 16:9 aspect ratio. Before this task the prose classes did absolutely nothing.

- [ ] **Step 5: Commit**

```bash
git add apps/storefront/app/globals.css apps/storefront/components/blog/post-content.tsx apps/storefront/package.json pnpm-lock.yaml
git commit -m "feat(blog): install @tailwindcss/typography and apply full brand prose theming to PostContent"
```

---

## Task 4: Cart Drawer Enhancement

**Files:**
- Modify: `apps/storefront/components/ui/sheet.tsx`
- Modify: `apps/storefront/components/cart/cart-drawer.tsx`

**Context:** The Sheet component (Base UI Dialog) has a CSS-based slide animation via `data-starting-style` / `data-ending-style` attributes. Two problems:
1. The slide distance is `translate-x-[2.5rem]` (40px) — far too subtle for a drawer that should feel like it's entering from off-screen.
2. The backdrop is `bg-black/10` — nearly invisible.

The cart drawer itself uses SheetContent but doesn't apply brand colors. The `AnimatePresence` + `m.div` already present in cart-drawer.tsx is for cart _items_ animation — keep it as-is.

- [ ] **Step 1: Fix sheet.tsx slide distance and backdrop**

In `apps/storefront/components/ui/sheet.tsx`, there are two changes:

**Change 1** — In `SheetOverlay`, change `bg-black/10` to `bg-black/60`:
```tsx
function SheetOverlay({ className, ...props }: SheetPrimitive.Backdrop.Props) {
  return (
    <SheetPrimitive.Backdrop
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/60 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-xs",
        className
      )}
      {...props}
    />
  )
}
```

**Change 2** — In `SheetContent`, replace all four occurrences of `translate-x-[2.5rem]` / `translate-y-[2.5rem]` with full-screen equivalents. The long className string on `SheetPrimitive.Popup` needs these replacements:
- `data-[side=bottom]:data-ending-style:translate-y-[2.5rem]` → `data-[side=bottom]:data-ending-style:translate-y-full`
- `data-[side=bottom]:data-starting-style:translate-y-[2.5rem]` → `data-[side=bottom]:data-starting-style:translate-y-full`
- `data-[side=left]:data-ending-style:translate-x-[-2.5rem]` → `data-[side=left]:data-ending-style:-translate-x-full`
- `data-[side=left]:data-starting-style:translate-x-[-2.5rem]` → `data-[side=left]:data-starting-style:-translate-x-full`
- `data-[side=right]:data-ending-style:translate-x-[2.5rem]` → `data-[side=right]:data-ending-style:translate-x-full`
- `data-[side=right]:data-starting-style:translate-x-[2.5rem]` → `data-[side=right]:data-starting-style:translate-x-full`
- `data-[side=top]:data-ending-style:translate-y-[-2.5rem]` → `data-[side=top]:data-ending-style:-translate-y-full`
- `data-[side=top]:data-starting-style:translate-y-[-2.5rem]` → `data-[side=top]:data-starting-style:-translate-y-full`

The complete updated `SheetContent` component (showing only the className change, all other code stays the same):

```tsx
function SheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
  ...props
}: SheetPrimitive.Popup.Props & {
  side?: "top" | "right" | "bottom" | "left"
  showCloseButton?: boolean
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Popup
        data-slot="sheet-content"
        data-side={side}
        className={cn(
          "fixed z-50 flex flex-col gap-4 bg-background bg-clip-padding text-sm shadow-lg transition duration-200 ease-in-out data-ending-style:opacity-0 data-starting-style:opacity-0 data-[side=bottom]:inset-x-0 data-[side=bottom]:bottom-0 data-[side=bottom]:h-auto data-[side=bottom]:border-t data-[side=bottom]:data-ending-style:translate-y-full data-[side=bottom]:data-starting-style:translate-y-full data-[side=left]:inset-y-0 data-[side=left]:left-0 data-[side=left]:h-full data-[side=left]:w-3/4 data-[side=left]:border-r data-[side=left]:data-ending-style:-translate-x-full data-[side=left]:data-starting-style:-translate-x-full data-[side=right]:inset-y-0 data-[side=right]:right-0 data-[side=right]:h-full data-[side=right]:w-3/4 data-[side=right]:border-l data-[side=right]:data-ending-style:translate-x-full data-[side=right]:data-starting-style:translate-x-full data-[side=top]:inset-x-0 data-[side=top]:top-0 data-[side=top]:h-auto data-[side=top]:border-b data-[side=top]:data-ending-style:-translate-y-full data-[side=top]:data-starting-style:-translate-y-full data-[side=left]:sm:max-w-sm data-[side=right]:sm:max-w-sm",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <SheetPrimitive.Close
            data-slot="sheet-close"
            render={
              <Button
                variant="ghost"
                className="absolute top-3 right-3"
                size="icon-sm"
              />
            }
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Popup>
    </SheetPortal>
  )
}
```

- [ ] **Step 2: Brand-theme the CartDrawer SheetContent**

In `apps/storefront/components/cart/cart-drawer.tsx`, pass a `className` to `SheetContent` to apply the brand dark background:

```tsx
<SheetContent side="right" className="bg-[--color-bg-light] border-[--color-border] max-w-md">
```

Full updated file:

```tsx
"use client"

import { m, AnimatePresence } from "motion/react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { drawerVariants } from "@/variants/drawer"
import { CartItem } from "./cart-item"
import { CartSummary } from "./cart-summary"
import { useCart } from "@/hooks/use-cart"

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cart, itemCount, loading } = useCart()

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="bg-[--color-bg-light] border-[--color-border] max-w-md">
        <SheetHeader>
          <SheetTitle className="text-[--color-white]">
            Coș de cumpărături
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {/* Content */}
          <div className="flex-1 overflow-y-auto py-4">
            {loading ? (
              <div className="text-center py-8 text-[--color-cream]">
                Se încarcă...
              </div>
            ) : !cart || itemCount === 0 ? (
              <div className="text-center py-8 text-[--color-cream]">
                Coșul tău este gol
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                <m.div
                  variants={drawerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {cart.items.map((item, index) => (
                    <CartItem
                      key={item.id}
                      item={item}
                      index={index}
                    />
                  ))}
                </m.div>
              </AnimatePresence>
            )}
          </div>

          {/* Summary at bottom */}
          {!loading && cart && itemCount > 0 && (
            <CartSummary />
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
```

- [ ] **Step 3: Verify**

Open the storefront, click the cart icon. The drawer should:
- Slide in fully from the right edge (not just 40px)
- Have a dark semi-transparent backdrop (should visibly dim the page behind it)
- The drawer panel itself should have the dark brand background (`--color-bg-light` = `#1a1814`), not default white

- [ ] **Step 4: Commit**

```bash
git add apps/storefront/components/ui/sheet.tsx apps/storefront/components/cart/cart-drawer.tsx
git commit -m "fix(cart): full-width drawer slide animation and dark brand backdrop"
```

---

## Task 5: Page Fade Transition

**Files:**
- Modify: `apps/storefront/app/(main)/layout.tsx`

Wrap `<main>` in a `m.main` with a 200ms opacity fade. `LazyMotion` + `domAnimation` is already set up in this layout — no additional setup needed. Import `m` from `"motion/react"` (NOT `"framer-motion"`).

- [ ] **Step 1: Update layout.tsx**

Replace `apps/storefront/app/(main)/layout.tsx`:

```tsx
import type { Metadata } from "next"
import { Cormorant_Garamond, Outfit } from "next/font/google"
import { Suspense } from "react"
import { LazyMotion, domAnimation, m } from "motion/react"
import { BASE_URL } from "@/lib/constants"
import { CartProvider } from "@/context/cart-context"
import { WishlistProvider } from "@/context/wishlist-context"
import { Analytics } from "@/components/analytics/analytics"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { CookieConsent } from "@/components/cookie-consent/cookie-consent"
import "../globals.css"

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
})

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-outfit",
  display: "swap",
})

export const metadata: Metadata = {
  title: "FirIntins — Echipamente Pescuit Premium",
  description: "E-commerce ultra-premium echipamente pescuit la crap în România.",
  openGraph: {
    title: "FirIntins",
    description: "Echipamente pescuit premium",
    url: BASE_URL,
    type: "website",
  },
}

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ro" className={`${cormorant.variable} ${outfit.variable}`} suppressHydrationWarning>
      <body className="bg-[--color-bg] text-[--color-cream]" suppressHydrationWarning>
        <LazyMotion features={domAnimation}>
          <CartProvider>
            <WishlistProvider>
              <Header />
              <m.main
                className="min-h-screen"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {children}
              </m.main>
              <Suspense fallback={null}>
                <Footer />
              </Suspense>
              <Analytics />
              <CookieConsent />
            </WishlistProvider>
          </CartProvider>
        </LazyMotion>
      </body>
    </html>
  )
}
```

Note: `m` is a server-importable subset of motion. Because `LazyMotion` is the parent, this works correctly — `m.main` is the lazy variant. This layout file is a server component, but `m.main` renders on the client side via LazyMotion.

- [ ] **Step 2: Verify**

Navigate between pages in the storefront (e.g., home → products → blog). Each navigation should produce a subtle 200ms fade-in of the page content. The transition should feel smooth and quick, not slow or dramatic.

- [ ] **Step 3: Commit**

```bash
git add apps/storefront/app/(main)/layout.tsx
git commit -m "feat(animations): add 200ms page fade transition on route change"
```

---

## Task 6: Product Grid Stagger

**Files:**
- Create: `apps/storefront/components/product/product-grid-animated.tsx`
- Modify: `apps/storefront/components/product/product-grid.tsx`

**Critical constraint:** `product-grid.tsx` is an `async` server component (it fetches from Medusa). You CANNOT add `"use client"` to it or use `m.*` / hooks directly. The solution is to extract a thin client component that receives the already-fetched `products` array and renders the animated grid.

- [ ] **Step 1: Create product-grid-animated.tsx**

Create `apps/storefront/components/product/product-grid-animated.tsx`:

```tsx
"use client"

import { m } from "motion/react"
import { ProductCard } from "@/components/product/product-card"

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

interface Props {
  products: unknown[]
}

export function ProductGridAnimated({ products }: Props) {
  return (
    <m.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
    >
      {products.map((product) => {
        const prod = product as { id: string }
        return (
          <m.div key={prod.id} variants={item}>
            <ProductCard product={product} />
          </m.div>
        )
      })}
    </m.div>
  )
}
```

- [ ] **Step 2: Update product-grid.tsx to use the animated wrapper**

Replace only the return statement at the bottom of `product-grid.tsx` (the `if (products.length === 0)` block and the final return). Add the import at the top. The data-fetching logic stays completely unchanged.

Add this import after the existing imports:
```ts
import { ProductGridAnimated } from "@/components/product/product-grid-animated"
```

Replace the final return block (lines 69-83 in the original):
```tsx
  if (products.length === 0) {
    return (
      <p className="py-16 text-center text-[--color-fog]/60">
        Niciun produs găsit.
      </p>
    )
  }

  return <ProductGridAnimated products={products} />
}
```

- [ ] **Step 3: Verify**

Navigate to `/produse`. The product cards should appear one after another with a staggered fade-up animation (60ms apart). Apply a filter or change the sort — the products should re-appear with the stagger animation since the server component re-fetches and remounts.

- [ ] **Step 4: Commit**

```bash
git add apps/storefront/components/product/product-grid-animated.tsx apps/storefront/components/product/product-grid.tsx
git commit -m "feat(animations): add stagger-reveal animation to product grid cards"
```

---

## Task 7: Blog Listing Stagger

**Files:**
- Modify: `apps/storefront/app/(main)/(shop)/blog/blog-listing.tsx`

This component is already `"use client"` (uses `useState` for category filter). The cards are rendered in a grid div — wrap that grid in a `m.div` with stagger variants. The `key={selected ?? "all"}` trick on the container forces React to remount the element when the filter changes, triggering a fresh stagger animation.

- [ ] **Step 1: Update blog-listing.tsx**

Replace `apps/storefront/app/(main)/(shop)/blog/blog-listing.tsx`:

```tsx
"use client"

import { useState } from "react"
import { m } from "motion/react"
import { PostCard } from "@/components/blog/post-card"
import { CategoryFilter } from "@/components/blog/category-filter"

type Category = { id: string; slug: string; name: string }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Post = any

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

export function BlogListing({
  posts,
  categories,
}: {
  posts: Post[]
  categories: Category[]
}) {
  const [selected, setSelected] = useState<string | null>(null)

  const filtered = selected
    ? posts.filter(
        (p) =>
          typeof p.category === "object" && p.category?.slug === selected
      )
    : posts

  return (
    <>
      {categories.length > 0 && (
        <div className="mb-8">
          <CategoryFilter
            categories={categories}
            selected={selected}
            onSelect={setSelected}
          />
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-[--color-fog] text-center py-16">
          Niciun articol în această categorie.
        </p>
      ) : (
        <m.div
          key={selected ?? "all"}
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filtered.map((post) => (
            <m.div key={post.id} variants={item}>
              <PostCard post={post} />
            </m.div>
          ))}
        </m.div>
      )}
    </>
  )
}
```

Note: `priority` prop removed from `PostCard` — it was only used on index 0 to prioritize the first image load, which is a minor optimization. The stagger animation means all cards animate in anyway. If you want to keep it, pass `priority={filtered.indexOf(post) === 0}` instead.

- [ ] **Step 2: Verify**

Navigate to `/blog`. Cards should stagger in (60ms apart). Click a category filter button — the cards for that category should re-stagger in with the animation (because the `key` on the container changes).

- [ ] **Step 3: Commit**

```bash
git add apps/storefront/app/(main)/(shop)/blog/blog-listing.tsx
git commit -m "feat(animations): add stagger-reveal to blog listing with re-stagger on filter change"
```

---

## Task 8: ProductCard Polish

**Files:**
- Modify: `apps/storefront/components/product/product-card.tsx`

Two changes:
1. Replace fixed height `h-48` with `aspect-[4/3]` for a proper aspect-ratio image container
2. Show a crossed-out original price when `calculatedPrice.original_amount` is higher than `calculatedPrice.calculated_amount`

**Context on Medusa price structure:** `variant.calculated_price.calculated_amount` is the final price (after discounts). `variant.calculated_price.original_amount` is the undiscounted price. If `original_amount > calculated_amount`, show the original crossed out.

- [ ] **Step 1: Update product-card.tsx**

Replace `apps/storefront/components/product/product-card.tsx`:

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
  const firstVariant = variants?.[0] as Record<string, unknown> | undefined
  const calculatedPrice = firstVariant?.calculated_price as Record<string, unknown> | undefined
  const price = calculatedPrice?.calculated_amount as number | undefined ?? 0
  const originalPrice = calculatedPrice?.original_amount as number | undefined
  const hasDiscount = originalPrice != null && originalPrice > price

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
          whileHover={{ scale: 1.02 }}
          className="group rounded border border-border hover:border-moss transition-colors overflow-hidden bg-surface"
        >
          <div className="relative aspect-[4/3] overflow-hidden bg-surface-2">
            <Image
              src={`https://picsum.photos/300/200?random=${id}`}
              alt={title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
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
            <div className="flex items-baseline gap-2 mt-2">
              {hasDiscount && (
                <span className="line-through text-[--color-fog] text-sm">
                  {formatPrice(originalPrice!)}
                </span>
              )}
              <span className={`font-cormorant text-lg ${hasDiscount ? "text-[--color-moss-light]" : "text-mud"}`}>
                {formatPrice(price)}
              </span>
            </div>
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

- [ ] **Step 2: Verify**

Navigate to `/produse`. Product card images should now maintain a 4:3 aspect ratio regardless of screen width (previously they were fixed at `h-48` = 192px). If any Medusa products in your test data have discounts (`original_amount > calculated_amount`), they should show a crossed-out original price alongside the discounted price in moss-light color.

- [ ] **Step 3: Commit**

```bash
git add apps/storefront/components/product/product-card.tsx
git commit -m "feat(product): aspect-ratio image container and compare_at_price crossed-out display"
```

---

## Task 9: Global Cursor + iOS Safe Areas

**Files:**
- Modify: `apps/storefront/app/globals.css`
- Modify: `apps/storefront/components/layout/header.tsx`
- Modify: `apps/storefront/components/layout/footer.tsx`
- Modify: `apps/storefront/app/(main)/layout.tsx`

- [ ] **Step 1: Add cursor-pointer rules and safe area CSS to globals.css**

Add at the end of `apps/storefront/app/globals.css` (after the `.dark` block):

```css
/* Cursor pointer for all interactive elements */
button,
[role="button"],
a,
select,
label[for],
input[type="checkbox"],
input[type="radio"] {
  cursor: pointer;
}

/* iOS safe area insets */
header {
  padding-top: env(safe-area-inset-top);
}

footer {
  padding-bottom: env(safe-area-inset-bottom);
}
```

- [ ] **Step 2: Add viewport-fit=cover to layout.tsx**

In `apps/storefront/app/(main)/layout.tsx`, update the `metadata` export to include viewport configuration. Add a `viewport` export just after the `metadata` export:

```ts
export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
}
```

This produces `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">` which is required for `env(safe-area-inset-*)` to work on iOS.

The full layout.tsx after this change (only adds the `viewport` export — everything else from Task 5 stays):

```tsx
import type { Metadata, Viewport } from "next"
import { Cormorant_Garamond, Outfit } from "next/font/google"
import { Suspense } from "react"
import { LazyMotion, domAnimation, m } from "motion/react"
import { BASE_URL } from "@/lib/constants"
import { CartProvider } from "@/context/cart-context"
import { WishlistProvider } from "@/context/wishlist-context"
import { Analytics } from "@/components/analytics/analytics"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { CookieConsent } from "@/components/cookie-consent/cookie-consent"
import "../globals.css"

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
})

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-outfit",
  display: "swap",
})

export const metadata: Metadata = {
  title: "FirIntins — Echipamente Pescuit Premium",
  description: "E-commerce ultra-premium echipamente pescuit la crap în România.",
  openGraph: {
    title: "FirIntins",
    description: "Echipamente pescuit premium",
    url: BASE_URL,
    type: "website",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
}

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ro" className={`${cormorant.variable} ${outfit.variable}`} suppressHydrationWarning>
      <body className="bg-[--color-bg] text-[--color-cream]" suppressHydrationWarning>
        <LazyMotion features={domAnimation}>
          <CartProvider>
            <WishlistProvider>
              <Header />
              <m.main
                className="min-h-screen"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {children}
              </m.main>
              <Suspense fallback={null}>
                <Footer />
              </Suspense>
              <Analytics />
              <CookieConsent />
            </WishlistProvider>
          </CartProvider>
        </LazyMotion>
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Verify**

In a desktop browser, buttons throughout the site (add to cart, filter buttons, nav links) should show pointer cursor on hover. On an iOS device or Chrome DevTools with iPhone simulation (with the notch area visible), the header should not overlap the status bar and the footer should not be cut off by the home indicator.

- [ ] **Step 4: Commit**

```bash
git add apps/storefront/app/globals.css apps/storefront/app/(main)/layout.tsx
git commit -m "feat(ui): global cursor-pointer, iOS safe area insets, viewport-fit=cover"
```

---

## Self-Review Checklist

After writing this plan, checking spec coverage:

**Spec section 1 (Lexical):** ✅ Task 1 covers both Posts.ts and Pages.ts with the exact feature list from the spec including `HeadingFeature({ enabledHeadingSizes: ["h2", "h3", "h4"] })`, `UploadFeature`, `YouTubeFeature`, `ChecklistFeature`. `LinkFeature({ enabledCollections: [] })` — spec said "simple URL input, no custom components" — using empty array for collections keeps it simple.

**Spec section 2 (SEO):** ✅ Task 2 covers install, plugin config in payload.config.ts with all three generators, generateMetadata update in blog/[slug]/page.tsx, types regeneration. OG image fallback included.

**Spec section 3 (Typography):** ✅ Task 3 covers install, `@plugin` directive in globals.css, PostContent with full prose theming including blockquote, iframe aspect-video handling, `prose-li:marker:text-[--color-moss]`.

**Spec section 4 (Framer Motion B scope):** Cart drawer ✅ Task 4. Page fade ✅ Task 5. Product grid stagger ✅ Task 6. Blog listing stagger ✅ Task 7.

**Spec section 5 (UI Polish):** Cursor-pointer ✅ Task 9. ProductCard `aspect-[4/3]` + hover scale ✅ Task 8. Compare price ✅ Task 8. iOS safe areas ✅ Task 9. Contrast audit items (placeholders, filter buttons, footer links) — these are verified visually during execution, the CSS cursor rules cover global interactive elements.

**Placeholder scan:** No TBDs or TODOs found.

**Type consistency:** `Post` type used in blog-listing.tsx stays as `any` — compatible with getCachedPost return. `unknown[]` in ProductGridAnimated cast to `{ id: string }` for the key only — correct. SEO meta fields accessed with `(post as any).meta?.title` — safe given types are regenerated.
