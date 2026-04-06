# Payload CMS Ultimate Enhancement — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Payload CMS admin fully self-sufficient for non-developer clients — globals (site-settings, navigation, footer, homepage page-builder), new collections (Testimonials, Faqs), Versions/Drafts/Live Preview on Posts/Pages/Homepage, role-based access, and dynamic frontend components.

**Architecture:** Payload-native Globals + Blocks. No third-party page builder plugins. Access control via helper functions in `lib/cms/access.ts`. Frontend reads globals via new cached query functions in `lib/cms/client.ts`; homepage uses a `BlockRenderer` switch component.

**Tech Stack:** Payload CMS v3, Next.js 16 App Router, `"use cache"` + `cacheTag` + `cacheLife`, TypeScript, Jest + ts-jest

---

## File Map

**New files — CMS config:**
- `lib/cms/access.ts` — role helper functions
- `collections/Testimonials.ts`
- `collections/Faqs.ts`
- `globals/SiteSettings.ts`
- `globals/Navigation.ts`
- `globals/Footer.ts`
- `globals/Homepage.ts`
- `blocks/HeroBlock.ts`
- `blocks/FeaturedProductsBlock.ts`
- `blocks/OffersBlock.ts`
- `blocks/FeaturesGridBlock.ts`
- `blocks/TestimonialsBlock.ts`
- `blocks/FaqBlock.ts`
- `blocks/RichTextBlock.ts`
- `blocks/CtaBlock.ts`
- `blocks/ImageBannerBlock.ts`

**New files — API routes:**
- `app/(payload)/api/draft/route.ts`
- `app/(payload)/api/disable-draft/route.ts`

**New files — frontend:**
- `components/blocks/BlockRenderer.tsx`
- `components/blocks/HeroBlock.tsx`
- `components/blocks/FeaturedProductsBlock.tsx`
- `components/blocks/OffersBlock.tsx`
- `components/blocks/FeaturesGridBlock.tsx`
- `components/blocks/TestimonialsBlock.tsx`
- `components/blocks/FaqBlock.tsx`
- `components/blocks/RichTextBlock.tsx`
- `components/blocks/CtaBlock.tsx`
- `components/blocks/ImageBannerBlock.tsx`

**Modified files:**
- `collections/Users.ts` — add role field + access control
- `collections/Posts.ts` — versions/drafts, live preview, access control, remove status field
- `collections/Pages.ts` — SEO plugin, versions/drafts, live preview, access control
- `payload.config.ts` — register globals, new collections, media upgrades, SEO on pages, live preview
- `lib/cms/client.ts` — add `getHomepage`, `getSiteSettings`, `getNavigation`, `getFooter`, `getTestimonials`, `getFaqs`
- `app/(main)/page.tsx` — use `BlockRenderer`
- `components/layout/Header.tsx` — dynamic navigation
- `components/layout/Footer.tsx` — dynamic footer

---

## Task 1: Access Control Helpers

**Files:**
- Create: `apps/storefront/lib/cms/access.ts`

- [ ] **Step 1: Write the failing test**

Create `apps/storefront/__tests__/unit/cms-access.test.ts`:

```ts
import { isAdmin, isAdminOrEditor, isAdminField } from '@/lib/cms/access'

function makeReq(role?: string) {
  return { user: role ? { role } : null } as any
}

describe('isAdmin', () => {
  it('returns true when role is admin', () => {
    expect(isAdmin({ req: makeReq('admin') })).toBe(true)
  })
  it('returns false when role is editor', () => {
    expect(isAdmin({ req: makeReq('editor') })).toBe(false)
  })
  it('returns false when no user', () => {
    expect(isAdmin({ req: makeReq() })).toBe(false)
  })
})

describe('isAdminOrEditor', () => {
  it('returns true for admin', () => {
    expect(isAdminOrEditor({ req: makeReq('admin') })).toBe(true)
  })
  it('returns true for editor', () => {
    expect(isAdminOrEditor({ req: makeReq('editor') })).toBe(true)
  })
  it('returns false with no user', () => {
    expect(isAdminOrEditor({ req: makeReq() })).toBe(false)
  })
})

describe('isAdminField', () => {
  it('returns true for admin', () => {
    expect(isAdminField({ req: makeReq('admin') } as any)).toBe(true)
  })
  it('returns false for editor', () => {
    expect(isAdminField({ req: makeReq('editor') } as any)).toBe(false)
  })
})
```

- [ ] **Step 2: Run the test to confirm it fails**

```bash
pnpm --filter storefront test -- --testPathPattern="cms-access" --no-coverage
```

Expected: FAIL — module not found

- [ ] **Step 3: Write `lib/cms/access.ts`**

```ts
import type { Access, FieldAccess } from 'payload'

export const isAdmin: Access = ({ req }) =>
  req.user?.role === 'admin'

export const isAdminOrEditor: Access = ({ req }) =>
  req.user?.role === 'admin' || req.user?.role === 'editor'

export const isAdminField: FieldAccess = ({ req }) =>
  req.user?.role === 'admin'
```

- [ ] **Step 4: Run tests to confirm pass**

```bash
pnpm --filter storefront test -- --testPathPattern="cms-access" --no-coverage
```

Expected: PASS (6 tests)

- [ ] **Step 5: Commit**

```bash
git add apps/storefront/lib/cms/access.ts apps/storefront/__tests__/unit/cms-access.test.ts
git commit -m "feat(cms): add role-based access control helpers"
```

---

## Task 2: Users Collection — Role Field

**Files:**
- Modify: `apps/storefront/collections/Users.ts`

- [ ] **Step 1: Update `Users.ts` to add role field and access control**

```ts
import type { CollectionConfig } from 'payload'
import { isAdmin } from '@/lib/cms/access'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
  },
  access: {
    create: isAdmin,
    read: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
      ],
    },
  ],
}
```

- [ ] **Step 2: Run existing tests to confirm no regression**

```bash
pnpm --filter storefront test --no-coverage
```

Expected: all previously passing tests still pass

- [ ] **Step 3: Commit**

```bash
git add apps/storefront/collections/Users.ts
git commit -m "feat(cms): add role field to Users and restrict access to admins"
```

---

## Task 3: Testimonials and Faqs Collections

**Files:**
- Create: `apps/storefront/collections/Testimonials.ts`
- Create: `apps/storefront/collections/Faqs.ts`

- [ ] **Step 1: Create `collections/Testimonials.ts`**

```ts
import type { CollectionConfig } from 'payload'
import { isAdminOrEditor } from '@/lib/cms/access'
import {
  lexicalEditor, BoldFeature, ItalicFeature, ParagraphFeature,
} from '@payloadcms/richtext-lexical'

export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  admin: {
    useAsTitle: 'author',
  },
  access: {
    create: isAdminOrEditor,
    read: () => true,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    {
      name: 'author',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'text',
      admin: { description: 'e.g. Pescar din Cluj' },
    },
    {
      name: 'quote',
      type: 'textarea',
      required: true,
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'rating',
      type: 'number',
      min: 1,
      max: 5,
    },
  ],
}
```

- [ ] **Step 2: Create `collections/Faqs.ts`**

```ts
import type { CollectionConfig } from 'payload'
import { isAdminOrEditor } from '@/lib/cms/access'
import {
  lexicalEditor,
  BoldFeature,
  ItalicFeature,
  LinkFeature,
  ParagraphFeature,
  FixedToolbarFeature,
} from '@payloadcms/richtext-lexical'

export const Faqs: CollectionConfig = {
  slug: 'faqs',
  admin: {
    useAsTitle: 'question',
  },
  access: {
    create: isAdminOrEditor,
    read: () => true,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    {
      name: 'question',
      type: 'text',
      required: true,
    },
    {
      name: 'answer',
      type: 'richText',
      editor: lexicalEditor({
        features: [
          FixedToolbarFeature(),
          ParagraphFeature(),
          BoldFeature(),
          ItalicFeature(),
          LinkFeature({ enabledCollections: [] }),
        ],
      }),
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'General', value: 'general' },
        { label: 'Livrare', value: 'shipping' },
        { label: 'Retururi', value: 'returns' },
        { label: 'Produse', value: 'products' },
      ],
    },
  ],
}
```

- [ ] **Step 3: Run tests to confirm no regression**

```bash
pnpm --filter storefront test --no-coverage
```

Expected: all previously passing tests still pass

- [ ] **Step 4: Commit**

```bash
git add apps/storefront/collections/Testimonials.ts apps/storefront/collections/Faqs.ts
git commit -m "feat(cms): add Testimonials and Faqs collections"
```

---

## Task 4: Upgrade Posts and Pages (Versions, Drafts, Live Preview, Access)

**Files:**
- Modify: `apps/storefront/collections/Posts.ts`
- Modify: `apps/storefront/collections/Pages.ts`

- [ ] **Step 1: Update `collections/Posts.ts`**

Replace the entire file with:

```ts
import type { CollectionConfig } from 'payload'
import {
  lexicalEditor,
  HeadingFeature, BoldFeature, ItalicFeature, UnderlineFeature,
  StrikethroughFeature, BlockquoteFeature, LinkFeature, UploadFeature,
  HorizontalRuleFeature, OrderedListFeature, UnorderedListFeature,
  ChecklistFeature, AlignFeature, IndentFeature, FixedToolbarFeature,
  InlineToolbarFeature, InlineCodeFeature, SuperscriptFeature,
  SubscriptFeature, ParagraphFeature,
} from '@payloadcms/richtext-lexical'
import { ColorFeature } from '@/features/color/feature.server'
import { FontSizeFeature } from '@/features/font-size/feature.server'
import { isAdminOrEditor } from '@/lib/cms/access'

const serverURL = process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    livePreview: {
      url: ({ data }) => `${serverURL}/blog/${data?.slug ?? ''}`,
    },
  },
  versions: {
    drafts: true,
  },
  access: {
    create: isAdminOrEditor,
    read: () => true,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Auto-generated from title. URL-friendly, e.g. ghid-pescuit-crap',
      },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'excerpt',
      type: 'textarea',
      maxLength: 200,
    },
    {
      name: 'content',
      type: 'richText',
      editor: lexicalEditor({
        features: [
          FixedToolbarFeature(),
          InlineToolbarFeature(),
          ColorFeature(),
          FontSizeFeature(),
          ParagraphFeature(),
          HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
          BoldFeature(),
          ItalicFeature(),
          UnderlineFeature(),
          StrikethroughFeature(),
          InlineCodeFeature(),
          SuperscriptFeature(),
          SubscriptFeature(),
          AlignFeature(),
          IndentFeature(),
          BlockquoteFeature(),
          LinkFeature({ enabledCollections: [] }),
          UploadFeature({
            collections: { media: { fields: [{ name: 'alt', type: 'text' }] } },
          }),
          HorizontalRuleFeature(),
          OrderedListFeature(),
          UnorderedListFeature(),
          ChecklistFeature(),
        ],
      }),
    },
    {
      name: 'author',
      type: 'text',
    },
    {
      name: 'publishedAt',
      type: 'date',
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data?.title && !data?.slug) {
          data.slug = (data.title as string)
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '')
        }
        return data
      },
    ],
    afterChange: [
      async () => {
        try {
          const { revalidateTag } = await import('next/cache')
          revalidateTag('cms-blog', {})
        } catch (e) {
          console.warn('cms-blog revalidation skipped:', e)
        }
      },
    ],
  },
}
```

Key changes from original: removed `status` field, added `versions: { drafts: true }`, added `admin.livePreview`, added `access` block.

- [ ] **Step 2: Update `collections/Pages.ts`**

Replace the entire file with:

```ts
import type { CollectionConfig } from 'payload'
import {
  lexicalEditor,
  HeadingFeature, BoldFeature, ItalicFeature, UnderlineFeature,
  StrikethroughFeature, BlockquoteFeature, LinkFeature, UploadFeature,
  HorizontalRuleFeature, OrderedListFeature, UnorderedListFeature,
  ChecklistFeature, AlignFeature, IndentFeature, FixedToolbarFeature,
  InlineToolbarFeature, InlineCodeFeature, SuperscriptFeature,
  SubscriptFeature, ParagraphFeature,
} from '@payloadcms/richtext-lexical'
import { ColorFeature } from '@/features/color/feature.server'
import { FontSizeFeature } from '@/features/font-size/feature.server'
import { isAdminOrEditor } from '@/lib/cms/access'

const serverURL = process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    livePreview: {
      url: ({ data }) => `${serverURL}/pagini/${data?.slug ?? ''}`,
    },
  },
  versions: {
    drafts: true,
  },
  access: {
    create: isAdminOrEditor,
    read: () => true,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL slug, e.g. despre-noi, gdpr, termeni-si-conditii, retur',
      },
    },
    {
      name: 'content',
      type: 'richText',
      editor: lexicalEditor({
        features: [
          FixedToolbarFeature(),
          InlineToolbarFeature(),
          ColorFeature(),
          FontSizeFeature(),
          ParagraphFeature(),
          HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
          BoldFeature(),
          ItalicFeature(),
          UnderlineFeature(),
          StrikethroughFeature(),
          InlineCodeFeature(),
          SuperscriptFeature(),
          SubscriptFeature(),
          AlignFeature(),
          IndentFeature(),
          BlockquoteFeature(),
          LinkFeature({ enabledCollections: [] }),
          UploadFeature({
            collections: { media: { fields: [{ name: 'alt', type: 'text' }] } },
          }),
          HorizontalRuleFeature(),
          OrderedListFeature(),
          UnorderedListFeature(),
          ChecklistFeature(),
        ],
      }),
    },
    {
      name: 'showInFooter',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Show link to this page in the footer Informații column',
      },
    },
  ],
  hooks: {
    afterChange: [
      async () => {
        try {
          const { revalidateTag } = await import('next/cache')
          revalidateTag('cms-pages', {})
        } catch (e) {
          console.warn('cms-pages revalidation skipped:', e)
        }
      },
    ],
  },
}
```

- [ ] **Step 3: Update `getPosts` / `getPost` in `lib/cms/client.ts` to stop filtering by status**

The `status` field is gone — Payload's draft system handles publication state. The `where` clause in `getPosts` and `getPost` must be updated to remove the `status` filter. Payload auto-filters to published docs when `draft: false` (the default).

In `apps/storefront/lib/cms/client.ts`, change `getPosts`:

```ts
export async function getPosts(categorySlug?: string) {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'posts',
    where: {
      ...(categorySlug ? { 'category.slug': { equals: categorySlug } } : {}),
    },
    depth: 1,
    pagination: false,
  })
  return docs
}
```

And `getPost`:

```ts
export async function getPost(slug: string) {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'posts',
    where: { slug: { equals: slug } },
    depth: 1,
    limit: 1,
  })
  return docs[0] ?? null
}
```

- [ ] **Step 4: Run tests**

```bash
pnpm --filter storefront test --no-coverage
```

Expected: all passing

- [ ] **Step 5: Commit**

```bash
git add apps/storefront/collections/Posts.ts apps/storefront/collections/Pages.ts apps/storefront/lib/cms/client.ts
git commit -m "feat(cms): add versions/drafts, live preview, and access control to Posts and Pages"
```

---

## Task 5: Block Definitions

**Files (all new):**
- `apps/storefront/blocks/HeroBlock.ts`
- `apps/storefront/blocks/FeaturedProductsBlock.ts`
- `apps/storefront/blocks/OffersBlock.ts`
- `apps/storefront/blocks/FeaturesGridBlock.ts`
- `apps/storefront/blocks/TestimonialsBlock.ts`
- `apps/storefront/blocks/FaqBlock.ts`
- `apps/storefront/blocks/RichTextBlock.ts`
- `apps/storefront/blocks/CtaBlock.ts`
- `apps/storefront/blocks/ImageBannerBlock.ts`

- [ ] **Step 1: Create `blocks/HeroBlock.ts`**

```ts
import type { Block } from 'payload'

export const HeroBlock: Block = {
  slug: 'hero',
  labels: { singular: 'Hero', plural: 'Hero Blocks' },
  fields: [
    { name: 'heading', type: 'text', required: true },
    { name: 'subheading', type: 'textarea' },
    { name: 'backgroundImage', type: 'upload', relationTo: 'media' },
    { name: 'ctaLabel', type: 'text' },
    { name: 'ctaUrl', type: 'text' },
    {
      name: 'overlay',
      type: 'select',
      defaultValue: 'dark',
      options: [
        { label: 'Fără overlay', value: 'none' },
        { label: 'Întunecat', value: 'dark' },
        { label: 'Luminos', value: 'light' },
      ],
    },
  ],
}
```

- [ ] **Step 2: Create `blocks/FeaturedProductsBlock.ts`**

```ts
import type { Block } from 'payload'

export const FeaturedProductsBlock: Block = {
  slug: 'featuredProducts',
  labels: { singular: 'Produse Recomandate', plural: 'Produse Recomandate' },
  fields: [
    { name: 'heading', type: 'text' },
    {
      name: 'productHandles',
      type: 'array',
      fields: [{ name: 'handle', type: 'text', required: true }],
    },
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'grid',
      options: [
        { label: 'Grilă', value: 'grid' },
        { label: 'Carusel', value: 'carousel' },
      ],
    },
  ],
}
```

- [ ] **Step 3: Create `blocks/OffersBlock.ts`**

```ts
import type { Block } from 'payload'

export const OffersBlock: Block = {
  slug: 'offers',
  labels: { singular: 'Oferte', plural: 'Oferte' },
  fields: [
    { name: 'heading', type: 'text' },
    {
      name: 'offers',
      type: 'array',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea' },
        { name: 'image', type: 'upload', relationTo: 'media' },
        { name: 'badge', type: 'text' },
        { name: 'ctaUrl', type: 'text' },
      ],
    },
  ],
}
```

- [ ] **Step 4: Create `blocks/FeaturesGridBlock.ts`**

```ts
import type { Block } from 'payload'

export const FeaturesGridBlock: Block = {
  slug: 'featuresGrid',
  labels: { singular: 'Grilă Caracteristici', plural: 'Grilă Caracteristici' },
  fields: [
    { name: 'heading', type: 'text' },
    {
      name: 'items',
      type: 'array',
      fields: [
        {
          name: 'icon',
          type: 'select',
          options: [
            { label: 'Pește', value: 'fish' },
            { label: 'Cârlig', value: 'hook' },
            { label: 'Undița', value: 'rod' },
            { label: 'Barcă', value: 'boat' },
            { label: 'Stea', value: 'star' },
            { label: 'Scut', value: 'shield' },
            { label: 'Camion', value: 'truck' },
            { label: 'Frunză', value: 'leaf' },
          ],
        },
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea' },
      ],
    },
  ],
}
```

- [ ] **Step 5: Create `blocks/TestimonialsBlock.ts`**

```ts
import type { Block } from 'payload'

export const TestimonialsBlock: Block = {
  slug: 'testimonials',
  labels: { singular: 'Testimoniale', plural: 'Testimoniale' },
  fields: [
    { name: 'heading', type: 'text' },
    {
      name: 'items',
      type: 'relationship',
      relationTo: 'testimonials',
      hasMany: true,
    },
  ],
}
```

- [ ] **Step 6: Create `blocks/FaqBlock.ts`**

```ts
import type { Block } from 'payload'

export const FaqBlock: Block = {
  slug: 'faq',
  labels: { singular: 'FAQ', plural: 'FAQ-uri' },
  fields: [
    { name: 'heading', type: 'text' },
    {
      name: 'items',
      type: 'relationship',
      relationTo: 'faqs',
      hasMany: true,
    },
  ],
}
```

- [ ] **Step 7: Create `blocks/RichTextBlock.ts`**

```ts
import type { Block } from 'payload'
import {
  lexicalEditor,
  HeadingFeature, BoldFeature, ItalicFeature, UnderlineFeature,
  StrikethroughFeature, BlockquoteFeature, LinkFeature, UploadFeature,
  HorizontalRuleFeature, OrderedListFeature, UnorderedListFeature,
  ChecklistFeature, AlignFeature, IndentFeature, FixedToolbarFeature,
  InlineToolbarFeature, InlineCodeFeature, SuperscriptFeature,
  SubscriptFeature, ParagraphFeature,
} from '@payloadcms/richtext-lexical'
import { ColorFeature } from '@/features/color/feature.server'
import { FontSizeFeature } from '@/features/font-size/feature.server'

export const RichTextBlock: Block = {
  slug: 'richText',
  labels: { singular: 'Text Rich', plural: 'Text Rich' },
  fields: [
    {
      name: 'content',
      type: 'richText',
      editor: lexicalEditor({
        features: [
          FixedToolbarFeature(), InlineToolbarFeature(),
          ColorFeature(), FontSizeFeature(),
          ParagraphFeature(),
          HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
          BoldFeature(), ItalicFeature(), UnderlineFeature(),
          StrikethroughFeature(), InlineCodeFeature(),
          SuperscriptFeature(), SubscriptFeature(),
          AlignFeature(), IndentFeature(), BlockquoteFeature(),
          LinkFeature({ enabledCollections: [] }),
          UploadFeature({ collections: { media: { fields: [{ name: 'alt', type: 'text' }] } } }),
          HorizontalRuleFeature(), OrderedListFeature(),
          UnorderedListFeature(), ChecklistFeature(),
        ],
      }),
    },
  ],
}
```

- [ ] **Step 8: Create `blocks/CtaBlock.ts`**

```ts
import type { Block } from 'payload'

export const CtaBlock: Block = {
  slug: 'cta',
  labels: { singular: 'CTA', plural: 'CTA-uri' },
  fields: [
    { name: 'heading', type: 'text', required: true },
    { name: 'subheading', type: 'textarea' },
    { name: 'ctaLabel', type: 'text' },
    { name: 'ctaUrl', type: 'text' },
    {
      name: 'background',
      type: 'select',
      defaultValue: 'moss',
      options: [
        { label: 'Verde (Moss)', value: 'moss' },
        { label: 'Maro (Mud)', value: 'mud' },
        { label: 'Închis (Dark)', value: 'dark' },
      ],
    },
  ],
}
```

- [ ] **Step 9: Create `blocks/ImageBannerBlock.ts`**

```ts
import type { Block } from 'payload'

export const ImageBannerBlock: Block = {
  slug: 'imageBanner',
  labels: { singular: 'Banner Imagine', plural: 'Bannere Imagini' },
  fields: [
    { name: 'image', type: 'upload', relationTo: 'media', required: true },
    { name: 'caption', type: 'text' },
    { name: 'linkUrl', type: 'text' },
  ],
}
```

- [ ] **Step 10: Commit**

```bash
git add apps/storefront/blocks/
git commit -m "feat(cms): add 9 homepage page-builder block definitions"
```

---

## Task 6: New Globals — SiteSettings, Navigation, Footer

**Files:**
- Create: `apps/storefront/globals/SiteSettings.ts`
- Create: `apps/storefront/globals/Navigation.ts`
- Create: `apps/storefront/globals/Footer.ts`

- [ ] **Step 1: Create `globals/SiteSettings.ts`**

```ts
import type { GlobalConfig } from 'payload'
import { isAdmin, isAdminOrEditor } from '@/lib/cms/access'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  admin: { group: 'Setări Site' },
  access: {
    read: isAdminOrEditor,
    update: isAdmin,
  },
  hooks: {
    afterChange: [
      async () => {
        try {
          const { revalidateTag } = await import('next/cache')
          revalidateTag('cms-globals', {})
        } catch (e) {
          console.warn('cms-globals revalidation skipped:', e)
        }
      },
    ],
  },
  fields: [
    { name: 'siteName', type: 'text' },
    { name: 'logo', type: 'upload', relationTo: 'media' },
    { name: 'phone', type: 'text' },
    { name: 'email', type: 'email' },
    { name: 'address', type: 'textarea' },
    {
      name: 'socialLinks',
      type: 'array',
      fields: [
        {
          name: 'platform',
          type: 'select',
          options: [
            { label: 'Facebook', value: 'facebook' },
            { label: 'Instagram', value: 'instagram' },
            { label: 'YouTube', value: 'youtube' },
            { label: 'TikTok', value: 'tiktok' },
            { label: 'X (Twitter)', value: 'x' },
          ],
        },
        { name: 'url', type: 'text' },
      ],
    },
    {
      name: 'googleAnalyticsId',
      type: 'text',
      admin: { description: 'e.g. G-XXXXXXXX' },
    },
    { name: 'defaultSeoImage', type: 'upload', relationTo: 'media' },
  ],
}
```

- [ ] **Step 2: Create `globals/Navigation.ts`**

```ts
import type { GlobalConfig } from 'payload'
import { isAdmin } from '@/lib/cms/access'

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  admin: { group: 'Setări Site' },
  access: {
    read: isAdmin,
    update: isAdmin,
  },
  hooks: {
    afterChange: [
      async () => {
        try {
          const { revalidateTag } = await import('next/cache')
          revalidateTag('cms-globals', {})
        } catch (e) {
          console.warn('cms-globals revalidation skipped:', e)
        }
      },
    ],
  },
  fields: [
    {
      name: 'items',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'url', type: 'text', required: true },
        { name: 'newTab', type: 'checkbox', defaultValue: false },
        {
          name: 'children',
          type: 'array',
          fields: [
            { name: 'label', type: 'text', required: true },
            { name: 'url', type: 'text', required: true },
          ],
        },
      ],
    },
  ],
}
```

- [ ] **Step 3: Create `globals/Footer.ts`**

```ts
import type { GlobalConfig } from 'payload'
import { isAdmin } from '@/lib/cms/access'
import {
  lexicalEditor, BoldFeature, ItalicFeature, LinkFeature,
  ParagraphFeature, FixedToolbarFeature,
} from '@payloadcms/richtext-lexical'

export const Footer: GlobalConfig = {
  slug: 'footer',
  admin: { group: 'Setări Site' },
  access: {
    read: isAdmin,
    update: isAdmin,
  },
  hooks: {
    afterChange: [
      async () => {
        try {
          const { revalidateTag } = await import('next/cache')
          revalidateTag('cms-globals', {})
        } catch (e) {
          console.warn('cms-globals revalidation skipped:', e)
        }
      },
    ],
  },
  fields: [
    {
      name: 'columns',
      type: 'array',
      fields: [
        { name: 'heading', type: 'text', required: true },
        {
          name: 'links',
          type: 'array',
          fields: [
            { name: 'label', type: 'text', required: true },
            { name: 'url', type: 'text', required: true },
          ],
        },
      ],
    },
    {
      name: 'legalText',
      type: 'richText',
      editor: lexicalEditor({
        features: [
          FixedToolbarFeature(), ParagraphFeature(),
          BoldFeature(), ItalicFeature(),
          LinkFeature({ enabledCollections: [] }),
        ],
      }),
    },
    {
      name: 'showNewsletter',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
}
```

- [ ] **Step 4: Run tests**

```bash
pnpm --filter storefront test --no-coverage
```

Expected: all passing

- [ ] **Step 5: Commit**

```bash
git add apps/storefront/globals/SiteSettings.ts apps/storefront/globals/Navigation.ts apps/storefront/globals/Footer.ts
git commit -m "feat(cms): add SiteSettings, Navigation, and Footer globals"
```

---

## Task 7: Homepage Global with Page Builder

**Files:**
- Create: `apps/storefront/globals/Homepage.ts`

- [ ] **Step 1: Create `globals/Homepage.ts`**

```ts
import type { GlobalConfig } from 'payload'
import { isAdmin, isAdminOrEditor } from '@/lib/cms/access'
import { HeroBlock } from '@/blocks/HeroBlock'
import { FeaturedProductsBlock } from '@/blocks/FeaturedProductsBlock'
import { OffersBlock } from '@/blocks/OffersBlock'
import { FeaturesGridBlock } from '@/blocks/FeaturesGridBlock'
import { TestimonialsBlock } from '@/blocks/TestimonialsBlock'
import { FaqBlock } from '@/blocks/FaqBlock'
import { RichTextBlock } from '@/blocks/RichTextBlock'
import { CtaBlock } from '@/blocks/CtaBlock'
import { ImageBannerBlock } from '@/blocks/ImageBannerBlock'

const serverURL = process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000'

export const Homepage: GlobalConfig = {
  slug: 'homepage',
  admin: {
    group: 'Conținut',
    livePreview: {
      url: () => serverURL,
    },
  },
  versions: {
    drafts: true,
  },
  access: {
    read: isAdminOrEditor,
    update: isAdmin,
  },
  hooks: {
    afterChange: [
      async () => {
        try {
          const { revalidateTag } = await import('next/cache')
          revalidateTag('cms-homepage', {})
        } catch (e) {
          console.warn('cms-homepage revalidation skipped:', e)
        }
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      defaultValue: 'Homepage',
      admin: { description: 'Etichetă internă — nu apare pe site' },
    },
    {
      name: 'blocks',
      type: 'blocks',
      blocks: [
        HeroBlock,
        FeaturedProductsBlock,
        OffersBlock,
        FeaturesGridBlock,
        TestimonialsBlock,
        FaqBlock,
        RichTextBlock,
        CtaBlock,
        ImageBannerBlock,
      ],
    },
  ],
}
```

- [ ] **Step 2: Run tests**

```bash
pnpm --filter storefront test --no-coverage
```

Expected: all passing

- [ ] **Step 3: Commit**

```bash
git add apps/storefront/globals/Homepage.ts
git commit -m "feat(cms): add Homepage global with 9-block page builder"
```

---

## Task 8: Register Everything in payload.config.ts

**Files:**
- Modify: `apps/storefront/payload.config.ts`

- [ ] **Step 1: Replace `payload.config.ts`**

```ts
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { seoPlugin } from '@payloadcms/plugin-seo'
import path from 'path'

import { Users } from './collections/Users'
import { Posts } from './collections/Posts'
import { Pages } from './collections/Pages'
import { Categories } from './collections/Categories'
import { NewsletterSubscribers } from './collections/NewsletterSubscribers'
import { Testimonials } from './collections/Testimonials'
import { Faqs } from './collections/Faqs'

import { SiteSettings } from './globals/SiteSettings'
import { Navigation } from './globals/Navigation'
import { Footer } from './globals/Footer'
import { Homepage } from './globals/Homepage'

const serverURL = process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000'

export default buildConfig({
  serverURL,
  secret: process.env.PAYLOAD_SECRET ?? '',
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
    Testimonials,
    Faqs,
    {
      slug: 'media',
      upload: true,
      access: {
        read: () => true,
      },
      fields: [
        { name: 'alt', type: 'text' },
        { name: 'caption', type: 'text' },
        { name: 'focalPoint', type: 'point' },
      ],
    },
  ],
  globals: [
    SiteSettings,
    Navigation,
    Footer,
    Homepage,
  ],
  plugins: [
    seoPlugin({
      collections: ['posts', 'pages'],
      generateTitle: ({ doc }) =>
        `${(doc as { title?: string }).title ?? ''} — FirIntins`,
      generateDescription: ({ doc }) =>
        (doc as { excerpt?: string }).excerpt ?? '',
      generateURL: ({ doc, collectionConfig }) => {
        const slug = (doc as { slug?: string }).slug ?? ''
        if (collectionConfig?.slug === 'posts') {
          return `${serverURL}/blog/${slug}`
        }
        return `${serverURL}/pagini/${slug}`
      },
    }),
  ],
  typescript: {
    outputFile: path.resolve(process.cwd(), 'payload-types.ts'),
  },
  admin: {
    user: 'users',
    meta: { title: 'FirIntins CMS' },
    livePreview: {
      breakpoints: [
        { label: 'Mobile', name: 'mobile', width: 375, height: 812 },
        { label: 'Tablet', name: 'tablet', width: 768, height: 1024 },
        { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
      ],
    },
  },
})
```

- [ ] **Step 2: Run tests**

```bash
pnpm --filter storefront test --no-coverage
```

Expected: all passing

- [ ] **Step 3: Commit**

```bash
git add apps/storefront/payload.config.ts
git commit -m "feat(cms): register globals, Testimonials, Faqs, media upgrades, SEO on pages in payload.config"
```

---

## Task 9: Draft Mode API Routes

**Files:**
- Create: `apps/storefront/app/(payload)/api/draft/route.ts`
- Create: `apps/storefront/app/(payload)/api/disable-draft/route.ts`

- [ ] **Step 1: Create `app/(payload)/api/draft/route.ts`**

```ts
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const secret = searchParams.get('secret')
  const slug = searchParams.get('slug') ?? '/'
  const collectionSlug = searchParams.get('collectionSlug') ?? ''

  if (secret !== process.env.PAYLOAD_PREVIEW_SECRET) {
    return new Response('Invalid token', { status: 401 })
  }

  const draft = await draftMode()
  draft.enable()

  let redirectPath = slug
  if (collectionSlug === 'posts') {
    redirectPath = `/blog/${slug}`
  } else if (collectionSlug === 'pages') {
    redirectPath = `/pagini/${slug}`
  }

  redirect(redirectPath)
}
```

- [ ] **Step 2: Create `app/(payload)/api/disable-draft/route.ts`**

```ts
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const path = searchParams.get('path') ?? '/'

  const draft = await draftMode()
  draft.disable()

  redirect(path)
}
```

- [ ] **Step 3: Add `PAYLOAD_PREVIEW_SECRET` to env example**

Add to `apps/storefront/.env.local` (if you have one) or document in CLAUDE.md. The variable must exist for draft mode to work. Generate with: `openssl rand -hex 32`.

- [ ] **Step 4: Run tests**

```bash
pnpm --filter storefront test --no-coverage
```

Expected: all passing

- [ ] **Step 5: Commit**

```bash
git add "apps/storefront/app/(payload)/api/draft/route.ts" "apps/storefront/app/(payload)/api/disable-draft/route.ts"
git commit -m "feat(cms): add draft mode enable/disable API routes"
```

---

## Task 10: CMS Query Functions for Globals

**Files:**
- Modify: `apps/storefront/lib/cms/client.ts`

- [ ] **Step 1: Add global query functions to `lib/cms/client.ts`**

Append after the existing `getCachedFooterPages` export and before the re-exports section:

```ts
// ─── Global query functions ───────────────────────────────────────────────────

export async function getSiteSettings() {
  const payload = await getPayload({ config })
  return payload.findGlobal({ slug: 'site-settings', depth: 1 })
}

export async function getNavigation() {
  const payload = await getPayload({ config })
  return payload.findGlobal({ slug: 'navigation', depth: 0 })
}

export async function getFooter() {
  const payload = await getPayload({ config })
  return payload.findGlobal({ slug: 'footer', depth: 1 })
}

export async function getHomepage() {
  const payload = await getPayload({ config })
  return payload.findGlobal({ slug: 'homepage', depth: 2 })
}

export async function getTestimonials() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({ collection: 'testimonials', pagination: false, depth: 1 })
  return docs
}

export async function getFaqs(category?: string) {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'faqs',
    where: category ? { category: { equals: category } } : {},
    pagination: false,
    depth: 0,
  })
  return docs
}

// ─── Cached wrappers for globals ─────────────────────────────────────────────

export async function getCachedSiteSettings() {
  'use cache'
  cacheTag('cms-globals')
  cacheLife({ revalidate: 3600 })
  return getSiteSettings()
}

export async function getCachedNavigation() {
  'use cache'
  cacheTag('cms-globals')
  cacheLife({ revalidate: 3600 })
  return getNavigation()
}

export async function getCachedFooter() {
  'use cache'
  cacheTag('cms-globals')
  cacheLife({ revalidate: 3600 })
  return getFooter()
}

export async function getCachedHomepage() {
  'use cache'
  cacheTag('cms-homepage')
  cacheLife({ revalidate: 3600 })
  return getHomepage()
}

export async function getCachedTestimonials() {
  'use cache'
  cacheTag('cms-blog')
  cacheLife({ revalidate: 3600 })
  return getTestimonials()
}

export async function getCachedFaqs(category?: string) {
  'use cache'
  cacheTag('cms-blog')
  cacheLife({ revalidate: 3600 })
  return getFaqs(category)
}
```

- [ ] **Step 2: Run tests**

```bash
pnpm --filter storefront test --no-coverage
```

Expected: all passing

- [ ] **Step 3: Commit**

```bash
git add apps/storefront/lib/cms/client.ts
git commit -m "feat(cms): add cached query functions for globals and new collections"
```

---

## Task 11: Regenerate Payload Types and Import Map

**Files:**
- Modified auto-generated: `payload-types.ts`, `admin/importMap.js`

- [ ] **Step 1: Generate Payload types**

```bash
pnpm --filter storefront generate:types
```

Expected: `payload-types.ts` updated — no TypeScript errors

- [ ] **Step 2: Generate import map**

```bash
pnpm --filter storefront generate:importmap
```

Expected: `admin/importMap.js` updated — no errors

- [ ] **Step 3: Run full test suite**

```bash
pnpm --filter storefront test --no-coverage
```

Expected: all passing

- [ ] **Step 4: Commit**

```bash
git add apps/storefront/payload-types.ts apps/storefront/admin/importMap.js
git commit -m "chore(cms): regenerate payload-types and importMap after new globals/collections/blocks"
```

---

## Task 12: Block Renderer Components

**Files (all new):**
- `apps/storefront/components/blocks/BlockRenderer.tsx`
- `apps/storefront/components/blocks/HeroBlock.tsx`
- `apps/storefront/components/blocks/FeaturedProductsBlock.tsx`
- `apps/storefront/components/blocks/OffersBlock.tsx`
- `apps/storefront/components/blocks/FeaturesGridBlock.tsx`
- `apps/storefront/components/blocks/TestimonialsBlock.tsx`
- `apps/storefront/components/blocks/FaqBlock.tsx`
- `apps/storefront/components/blocks/RichTextBlock.tsx`
- `apps/storefront/components/blocks/CtaBlock.tsx`
- `apps/storefront/components/blocks/ImageBannerBlock.tsx`

After Task 11 you have correct generated types in `payload-types.ts`. Use the type `Homepage['blocks']` (imported from `@/payload-types`) for the blocks array.

- [ ] **Step 1: Create `components/blocks/HeroBlock.tsx`**

```tsx
import Image from 'next/image'
import Link from 'next/link'
import type { HeroBlock as HeroBlockType } from '@/payload-types'

export function HeroBlock({ block }: { block: HeroBlockType & { blockType: 'hero' } }) {
  const { heading, subheading, backgroundImage, ctaLabel, ctaUrl, overlay } = block

  const imgSrc = backgroundImage && typeof backgroundImage === 'object'
    ? new URL(backgroundImage.url!).pathname
    : null

  const overlayClass =
    overlay === 'dark' ? 'bg-black/50' :
    overlay === 'light' ? 'bg-white/30' :
    ''

  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      {imgSrc && (
        <Image
          src={imgSrc}
          alt={heading}
          fill
          className="object-cover"
          priority
        />
      )}
      {overlay !== 'none' && <div className={`absolute inset-0 ${overlayClass}`} />}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <h1 className="font-cormorant text-5xl md:text-7xl text-white mb-4">{heading}</h1>
        {subheading && (
          <p className="text-xl text-white/90 mb-8">{subheading}</p>
        )}
        {ctaLabel && ctaUrl && (
          <Link
            href={ctaUrl}
            className="inline-block bg-[--color-moss] hover:bg-[--color-moss-light] text-white px-8 py-3 font-outfit transition-colors"
          >
            {ctaLabel}
          </Link>
        )}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Create `components/blocks/OffersBlock.tsx`**

```tsx
import Image from 'next/image'
import Link from 'next/link'
import type { OffersBlock as OffersBlockType } from '@/payload-types'

export function OffersBlock({ block }: { block: OffersBlockType & { blockType: 'offers' } }) {
  const { heading, offers } = block
  return (
    <section className="py-16 px-6 max-w-7xl mx-auto">
      {heading && (
        <h2 className="font-cormorant text-4xl text-[--color-white] mb-8 text-center">{heading}</h2>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers?.map((offer, i) => {
          const imgSrc = offer.image && typeof offer.image === 'object'
            ? new URL((offer.image as any).url!).pathname
            : null
          return (
            <div key={i} className="bg-[--color-surface] rounded overflow-hidden">
              {imgSrc && (
                <div className="relative h-48">
                  <Image src={imgSrc} alt={offer.title ?? ''} fill className="object-cover" />
                  {offer.badge && (
                    <span className="absolute top-3 left-3 bg-[--color-mud] text-white text-xs px-2 py-1">
                      {offer.badge}
                    </span>
                  )}
                </div>
              )}
              <div className="p-4">
                <h3 className="font-cormorant text-xl text-[--color-white]">{offer.title}</h3>
                {offer.description && (
                  <p className="text-[--color-fog] text-sm mt-2">{offer.description}</p>
                )}
                {offer.ctaUrl && (
                  <Link href={offer.ctaUrl} className="inline-block mt-4 text-[--color-moss] text-sm hover:underline">
                    Află mai mult →
                  </Link>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Create `components/blocks/FeaturesGridBlock.tsx`**

```tsx
import type { FeaturesGridBlock as FeaturesGridBlockType } from '@/payload-types'

const ICONS: Record<string, string> = {
  fish: '🐟', hook: '🪝', rod: '🎣', boat: '⛵',
  star: '⭐', shield: '🛡️', truck: '🚚', leaf: '🌿',
}

export function FeaturesGridBlock({ block }: { block: FeaturesGridBlockType & { blockType: 'featuresGrid' } }) {
  const { heading, items } = block
  return (
    <section className="py-16 px-6 max-w-7xl mx-auto">
      {heading && (
        <h2 className="font-cormorant text-4xl text-[--color-white] mb-10 text-center">{heading}</h2>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {items?.map((item, i) => (
          <div key={i} className="text-center">
            <div className="text-4xl mb-3">{ICONS[item.icon ?? ''] ?? '•'}</div>
            <h3 className="font-outfit font-semibold text-[--color-white] mb-1">{item.title}</h3>
            {item.description && (
              <p className="text-[--color-fog] text-sm">{item.description}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Create `components/blocks/TestimonialsBlock.tsx`**

```tsx
import Image from 'next/image'
import type { TestimonialsBlock as TestimonialsBlockType, Testimonial } from '@/payload-types'

export function TestimonialsBlock({ block }: { block: TestimonialsBlockType & { blockType: 'testimonials' } }) {
  const { heading, items } = block
  const testimonials = (items ?? []).filter((t): t is Testimonial => typeof t === 'object')

  return (
    <section className="py-16 px-6 max-w-7xl mx-auto">
      {heading && (
        <h2 className="font-cormorant text-4xl text-[--color-white] mb-10 text-center">{heading}</h2>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((t) => {
          const avatarSrc = t.avatar && typeof t.avatar === 'object'
            ? new URL((t.avatar as any).url!).pathname
            : null
          return (
            <div key={t.id} className="bg-[--color-surface] p-6 rounded">
              <div className="flex items-center gap-3 mb-4">
                {avatarSrc && (
                  <Image src={avatarSrc} alt={t.author} width={48} height={48} className="rounded-full object-cover" />
                )}
                <div>
                  <p className="font-semibold text-[--color-white]">{t.author}</p>
                  {t.role && <p className="text-[--color-fog] text-sm">{t.role}</p>}
                </div>
              </div>
              {t.rating && (
                <div className="text-[--color-mud] mb-2">{'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}</div>
              )}
              <p className="text-[--color-cream] text-sm italic">"{t.quote}"</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
```

- [ ] **Step 5: Create `components/blocks/FaqBlock.tsx`**

```tsx
'use client'
import { useState } from 'react'
import type { FaqBlock as FaqBlockType, Faq } from '@/payload-types'
import { RichText } from '@payloadcms/richtext-lexical/react'

export function FaqBlock({ block }: { block: FaqBlockType & { blockType: 'faq' } }) {
  const { heading, items } = block
  const faqs = (items ?? []).filter((f): f is Faq => typeof f === 'object')
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section className="py-16 px-6 max-w-4xl mx-auto">
      {heading && (
        <h2 className="font-cormorant text-4xl text-[--color-white] mb-10 text-center">{heading}</h2>
      )}
      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <div key={faq.id} className="border border-[--color-border] rounded">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full text-left px-5 py-4 font-outfit text-[--color-white] flex justify-between items-center"
            >
              <span>{faq.question}</span>
              <span className="text-[--color-moss] ml-4">{open === i ? '−' : '+'}</span>
            </button>
            {open === i && faq.answer && (
              <div className="px-5 pb-4 text-[--color-fog]">
                <RichText data={faq.answer} />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 6: Create `components/blocks/RichTextBlock.tsx`**

```tsx
import type { RichTextBlock as RichTextBlockType } from '@/payload-types'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { richTextConverters } from '@/lib/cms/rich-text-converters'

export function RichTextBlock({ block }: { block: RichTextBlockType & { blockType: 'richText' } }) {
  if (!block.content) return null
  return (
    <section className="py-12 px-6 max-w-4xl mx-auto prose prose-invert">
      <RichText data={block.content} converters={richTextConverters} />
    </section>
  )
}
```

- [ ] **Step 7: Create `components/blocks/CtaBlock.tsx`**

```tsx
import Link from 'next/link'
import type { CtaBlock as CtaBlockType } from '@/payload-types'

const BG: Record<string, string> = {
  moss: 'bg-[--color-moss]',
  mud: 'bg-[--color-mud]',
  dark: 'bg-[--color-surface]',
}

export function CtaBlock({ block }: { block: CtaBlockType & { blockType: 'cta' } }) {
  const { heading, subheading, ctaLabel, ctaUrl, background } = block
  return (
    <section className={`${BG[background ?? 'moss']} py-16 px-6`}>
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="font-cormorant text-4xl text-white mb-4">{heading}</h2>
        {subheading && <p className="text-white/80 text-lg mb-8">{subheading}</p>}
        {ctaLabel && ctaUrl && (
          <Link
            href={ctaUrl}
            className="inline-block border-2 border-white text-white px-8 py-3 hover:bg-white hover:text-[--color-bg] transition-colors"
          >
            {ctaLabel}
          </Link>
        )}
      </div>
    </section>
  )
}
```

- [ ] **Step 8: Create `components/blocks/ImageBannerBlock.tsx`**

```tsx
import Image from 'next/image'
import Link from 'next/link'
import type { ImageBannerBlock as ImageBannerBlockType } from '@/payload-types'

export function ImageBannerBlock({ block }: { block: ImageBannerBlockType & { blockType: 'imageBanner' } }) {
  const { image, caption, linkUrl } = block
  if (!image || typeof image !== 'object') return null
  const imgSrc = new URL((image as any).url!).pathname

  const content = (
    <div className="relative w-full h-64 md:h-96">
      <Image src={imgSrc} alt={caption ?? ''} fill className="object-cover" />
      {caption && (
        <p className="absolute bottom-4 left-4 bg-black/60 text-white text-sm px-3 py-1">{caption}</p>
      )}
    </div>
  )

  return (
    <section className="py-8">
      {linkUrl ? <Link href={linkUrl}>{content}</Link> : content}
    </section>
  )
}
```

- [ ] **Step 9: Create `components/blocks/FeaturedProductsBlock.tsx`**

This block fetches Medusa products at render time. It is a server component.

```tsx
import type { FeaturedProductsBlock as FeaturedProductsBlockType } from '@/payload-types'
import { getProduct } from '@/lib/medusa/queries'
import { ProductCard } from '@/components/product/product-card'

export async function FeaturedProductsBlock({
  block,
}: {
  block: FeaturedProductsBlockType & { blockType: 'featuredProducts' }
}) {
  const { heading, productHandles, layout } = block
  const handles = (productHandles ?? []).map((h) => h.handle).filter(Boolean)

  const products = (
    await Promise.all(handles.map((handle) => getProduct(handle!).catch(() => null)))
  ).filter(Boolean)

  if (products.length === 0) return null

  return (
    <section className="py-16 px-6 max-w-7xl mx-auto">
      {heading && (
        <h2 className="font-cormorant text-4xl text-[--color-white] mb-8 text-center">{heading}</h2>
      )}
      <div
        className={
          layout === 'carousel'
            ? 'flex gap-6 overflow-x-auto pb-4'
            : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'
        }
      >
        {products.map((product) => (
          <ProductCard key={(product as any).id} product={product as any} />
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 10: Create `components/blocks/BlockRenderer.tsx`**

```tsx
import type { Homepage } from '@/payload-types'
import { HeroBlock } from './HeroBlock'
import { FeaturedProductsBlock } from './FeaturedProductsBlock'
import { OffersBlock } from './OffersBlock'
import { FeaturesGridBlock } from './FeaturesGridBlock'
import { TestimonialsBlock } from './TestimonialsBlock'
import { FaqBlock } from './FaqBlock'
import { RichTextBlock } from './RichTextBlock'
import { CtaBlock } from './CtaBlock'
import { ImageBannerBlock } from './ImageBannerBlock'

type Block = NonNullable<Homepage['blocks']>[number]

export function BlockRenderer({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((block, i) => {
        switch (block.blockType) {
          case 'hero':
            return <HeroBlock key={i} block={block as any} />
          case 'featuredProducts':
            return <FeaturedProductsBlock key={i} block={block as any} />
          case 'offers':
            return <OffersBlock key={i} block={block as any} />
          case 'featuresGrid':
            return <FeaturesGridBlock key={i} block={block as any} />
          case 'testimonials':
            return <TestimonialsBlock key={i} block={block as any} />
          case 'faq':
            return <FaqBlock key={i} block={block as any} />
          case 'richText':
            return <RichTextBlock key={i} block={block as any} />
          case 'cta':
            return <CtaBlock key={i} block={block as any} />
          case 'imageBanner':
            return <ImageBannerBlock key={i} block={block as any} />
          default:
            return null
        }
      })}
    </>
  )
}
```

- [ ] **Step 11: Run tests**

```bash
pnpm --filter storefront test --no-coverage
```

Expected: all passing

- [ ] **Step 12: Commit**

```bash
git add apps/storefront/components/blocks/
git commit -m "feat(storefront): add block renderer components for homepage page builder"
```

---

## Task 13: Wire Homepage to Block Renderer

**Files:**
- Modify: `apps/storefront/app/(main)/page.tsx`

- [ ] **Step 1: Replace `app/(main)/page.tsx`**

```tsx
import type { Metadata } from 'next'
import { connection } from 'next/server'
import { BASE_URL } from '@/lib/constants'
import { getCachedHomepage } from '@/lib/cms/client'
import { BlockRenderer } from '@/components/blocks/BlockRenderer'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'FirIntins — Echipamente pescuit la crap',
  description: 'Lansete, muliete și accesorii de pescuit la crap premium',
  alternates: { canonical: `${BASE_URL}/` },
  openGraph: {
    title: 'FirIntins',
    description: 'Echipamente premium de pescuit la crap',
    url: `${BASE_URL}/`,
    images: [{ url: `${BASE_URL}/og-default.jpg` }],
  },
}

export default async function HomePage() {
  await connection()
  const homepage = await getCachedHomepage()
  const blocks = homepage?.blocks ?? []

  return (
    <main className="bg-bg">
      <BlockRenderer blocks={blocks as any} />
    </main>
  )
}
```

- [ ] **Step 2: Run tests**

```bash
pnpm --filter storefront test --no-coverage
```

Expected: all passing

- [ ] **Step 3: Commit**

```bash
git add "apps/storefront/app/(main)/page.tsx"
git commit -m "feat(storefront): wire homepage to CMS block renderer"
```

---

## Task 14: Dynamic Header (Navigation Global)

**Files:**
- Modify: `apps/storefront/components/layout/Header.tsx`

The header is currently a `"use client"` component. We need to split it: a server wrapper fetches navigation, a client shell handles cart/interactions.

- [ ] **Step 1: Create `components/layout/HeaderNav.tsx` (server, renders nav links)**

```tsx
import Link from 'next/link'
import { getCachedNavigation } from '@/lib/cms/client'

export async function HeaderNav() {
  let items: Array<{ label: string; url: string; newTab?: boolean | null }> = []
  try {
    const nav = await getCachedNavigation()
    items = (nav?.items ?? []) as typeof items
  } catch {
    // fallback to empty — header still renders without nav items
  }

  if (items.length === 0) {
    // Static fallback links
    items = [
      { label: 'Produse', url: '/produse' },
      { label: 'Categorii', url: '/categorii' },
      { label: 'Blog', url: '/blog' },
      { label: 'Oferte', url: '/oferte' },
    ]
  }

  return (
    <div className="hidden md:flex gap-8">
      {items.map((item) => (
        <Link
          key={item.url}
          href={item.url}
          target={item.newTab ? '_blank' : undefined}
          rel={item.newTab ? 'noopener noreferrer' : undefined}
          className="text-[--color-cream] hover:text-[--color-moss] transition-colors"
        >
          {item.label}
        </Link>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Update `components/layout/Header.tsx` to use `HeaderNav`**

```tsx
'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useCart } from '@/hooks/use-cart'
import { CartDrawer } from '@/components/cart/cart-drawer'
import SearchButton from '@/components/layout/search-button'
import { HeaderNav } from '@/components/layout/HeaderNav'

export default function Header() {
  const { itemCount } = useCart()
  const [isCartOpen, setIsCartOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 bg-[--color-bg] border-b border-[--color-border] transition-all duration-300">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-semibold font-cormorant text-[--color-white]"
        >
          FirIntins
        </Link>

        {/* Dynamic Nav (server component wrapped in Suspense) */}
        <Suspense
          fallback={
            <div className="hidden md:flex gap-8">
              {['Produse', 'Categorii', 'Blog', 'Oferte'].map((label) => (
                <span key={label} className="text-[--color-cream] opacity-50">{label}</span>
              ))}
            </div>
          }
        >
          <HeaderNav />
        </Suspense>

        {/* Right Actions */}
        <div className="flex gap-4 items-center">
          <Suspense>
            <SearchButton />
          </Suspense>
          <Link
            href="/cont"
            className="text-[--color-cream] hover:text-[--color-moss] transition-colors"
          >
            Cont
          </Link>
          <div className="relative">
            <button
              onClick={() => setIsCartOpen(!isCartOpen)}
              className="relative text-[--color-cream] hover:text-[--color-moss] transition-colors"
            >
              🛒
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[--color-moss] text-[--color-white] text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  )
}
```

- [ ] **Step 3: Run tests**

```bash
pnpm --filter storefront test --no-coverage
```

Expected: all passing

- [ ] **Step 4: Commit**

```bash
git add apps/storefront/components/layout/Header.tsx apps/storefront/components/layout/HeaderNav.tsx
git commit -m "feat(storefront): dynamic navigation from CMS Navigation global"
```

---

## Task 15: Dynamic Footer (Footer Global)

**Files:**
- Modify: `apps/storefront/components/layout/Footer.tsx`

- [ ] **Step 1: Replace `components/layout/Footer.tsx`**

```tsx
import Link from 'next/link'
import { connection } from 'next/server'
import { getCachedFooter, getCachedSiteSettings } from '@/lib/cms/client'
import { RichText } from '@payloadcms/richtext-lexical/react'

export default async function Footer() {
  await connection()

  let columns: Array<{ heading: string; links: Array<{ label: string; url: string }> }> = []
  let legalText: unknown = null
  let showNewsletter = true
  let socialLinks: Array<{ platform?: string | null; url?: string | null }> = []
  let phone = '+40 751 234 567'
  let email = 'info@firintins.ro'

  try {
    const [footer, settings] = await Promise.all([
      getCachedFooter(),
      getCachedSiteSettings(),
    ])
    columns = (footer?.columns ?? []) as typeof columns
    legalText = footer?.legalText ?? null
    showNewsletter = footer?.showNewsletter ?? true
    socialLinks = (settings?.socialLinks ?? []) as typeof socialLinks
    if (settings?.phone) phone = settings.phone
    if (settings?.email) email = settings.email
  } catch {
    // use hardcoded fallbacks above
  }

  const currentYear = new Date().getFullYear()

  const PLATFORM_LABELS: Record<string, string> = {
    facebook: 'Facebook', instagram: 'Instagram', youtube: 'YouTube',
    tiktok: 'TikTok', x: 'X',
  }

  return (
    <footer className="bg-[--color-surface] border-t border-[--color-border] mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-semibold font-cormorant text-[--color-white] mb-4">
              FirIntins
            </h3>
            <p className="text-[--color-fog] text-sm">
              E-commerce ultra-premium echipamente pescuit la crap în România.
            </p>
            {socialLinks.length > 0 && (
              <div className="flex gap-4 mt-4 flex-wrap">
                {socialLinks.map((link, i) => (
                  link.url && (
                    <a
                      key={i}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[--color-moss] hover:text-[--color-moss-light] text-sm"
                    >
                      {PLATFORM_LABELS[link.platform ?? ''] ?? link.platform}
                    </a>
                  )
                ))}
              </div>
            )}
          </div>

          {/* CMS-driven columns */}
          {columns.map((col, i) => (
            <div key={i}>
              <h4 className="text-sm font-semibold text-[--color-white] mb-4 uppercase">
                {col.heading}
              </h4>
              <ul className="space-y-2 text-sm">
                {col.links.map((link, j) => (
                  <li key={j}>
                    <Link href={link.url} className="text-[--color-fog] hover:text-[--color-moss]">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact fallback if no columns */}
          {columns.length === 0 && (
            <div>
              <h4 className="text-sm font-semibold text-[--color-white] mb-4 uppercase">Contact</h4>
              <p className="text-[--color-fog] text-sm">
                Email:{' '}
                <a href={`mailto:${email}`} className="text-[--color-moss]">{email}</a>
              </p>
              <p className="text-[--color-fog] text-sm mt-2">
                Telefon:{' '}
                <a href={`tel:${phone.replace(/\s/g, '')}`} className="text-[--color-moss]">{phone}</a>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[--color-border] bg-[--color-bg]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[--color-fog]">
          {legalText ? (
            <div className="prose prose-sm prose-invert">
              <RichText data={legalText as any} />
            </div>
          ) : (
            <p>&copy; {currentYear} FirIntins. Toate drepturile rezervate.</p>
          )}
          <div className="flex gap-4">
            <Link href="/pagini/gdpr" className="hover:text-[--color-moss]">
              Politica de Confidențialitate
            </Link>
            <Link href="/pagini/termeni-si-conditii" className="hover:text-[--color-moss]">
              Termeni și Condiții
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
```

- [ ] **Step 2: Run tests**

```bash
pnpm --filter storefront test --no-coverage
```

Expected: all passing

- [ ] **Step 3: Commit**

```bash
git add apps/storefront/components/layout/Footer.tsx
git commit -m "feat(storefront): dynamic footer from CMS Footer and SiteSettings globals"
```

---

## Task 16: Database Migration

- [ ] **Step 1: Run the Payload migration**

With the dev server stopped, run:

```bash
pnpm --filter storefront generate:types
```

Then start the server once to auto-run migrations (Payload applies schema changes on startup when using `postgresAdapter`):

```bash
pnpm --filter storefront dev
```

Watch the terminal for:
```
[Payload] Starting Payload...
[Payload] Connected to Postgres
[Payload] Migrated database
```

If you see migration errors, run:

```bash
pnpm --filter storefront payload migrate
```

- [ ] **Step 2: Verify admin panel**

Navigate to `http://localhost:3000/admin`:
- Globals menu shows: Site Settings, Navigation, Footer, Homepage
- Collections menu shows: Testimonials, Faqs (in addition to existing ones)
- Posts and Pages show "Save Draft" + "Publish" + "Versions" buttons
- Media upload form has Caption and Focal Point fields
- Users collection has Role field

- [ ] **Step 3: Final test run**

```bash
pnpm --filter storefront test --no-coverage
```

Expected: all passing

- [ ] **Step 4: Final commit**

```bash
git add apps/storefront/payload-types.ts apps/storefront/admin/importMap.js
git commit -m "chore(cms): final type regeneration after full schema migration"
```

---

## Self-Review Checklist

**Spec coverage:**
- [x] site-settings global → Task 6
- [x] navigation global → Task 6
- [x] footer global → Task 6
- [x] homepage global with page builder → Task 7
- [x] 9 block types → Task 5
- [x] Testimonials collection → Task 3
- [x] Faqs collection → Task 3
- [x] Media caption + focalPoint → Task 8 (payload.config)
- [x] Users role field → Task 2
- [x] Posts: versions/drafts/live preview/access → Task 4
- [x] Pages: SEO plugin/versions/drafts/live preview/access → Task 4 + Task 8
- [x] Access control helpers → Task 1
- [x] Draft mode API routes → Task 9
- [x] CMS query functions → Task 10
- [x] Block renderer components → Task 12
- [x] Homepage wired to BlockRenderer → Task 13
- [x] Dynamic header → Task 14
- [x] Dynamic footer → Task 15
- [x] DB migration → Task 16
- [x] Type + importMap regeneration → Task 11 + Task 16

**Spec items that are intentionally deferred (out of scope per spec):**
- Scheduled publishing
- Custom admin dashboard widgets
