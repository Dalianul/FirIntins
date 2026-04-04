// apps/storefront/lib/cms/client.ts
import { getPayload } from "payload"
import config from "@payload-config"
import { cacheTag, cacheLife } from "next/cache"

// ─── Raw DB queries (no cache) ───────────────────────────────────────────────

export async function getPosts(categorySlug?: string) {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: "posts",
    where: {
      ...(categorySlug ? { "category.slug": { equals: categorySlug } } : {}),
    },
    depth: 1,
    pagination: false,
  })
  return docs
}

export async function getPost(slug: string) {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: "posts",
    where: { slug: { equals: slug } },
    depth: 1,
    limit: 1,
  })
  return docs[0] ?? null
}

export async function getCategories() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: "categories",
    pagination: false,
  })
  return docs
}

export async function getPage(slug: string) {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: "pages",
    where: { slug: { equals: slug } },
    limit: 1,
  })
  return docs[0] ?? null
}

export async function getFooterPages() {
  try {
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: "pages",
      where: { showInFooter: { equals: true } },
      pagination: false,
    })
    return docs
  } catch {
    return []
  }
}

// ─── Cached wrappers (use cache + cacheTag + cacheLife) ──────────────────────

export async function getCachedPosts(categorySlug?: string) {
  "use cache"
  cacheTag("cms-blog")
  cacheLife({ revalidate: 3600 })
  return getPosts(categorySlug)
}

export async function getCachedPost(slug: string) {
  "use cache"
  cacheTag("cms-blog")
  cacheLife({ revalidate: 3600 })
  return getPost(slug)
}

export async function getCachedCategories() {
  "use cache"
  cacheTag("cms-blog")
  cacheLife({ revalidate: 3600 })
  return getCategories()
}

export async function getCachedPage(slug: string) {
  "use cache"
  cacheTag("cms-pages")
  cacheLife({ revalidate: 3600 })
  return getPage(slug)
}

export async function getCachedFooterPages() {
  "use cache"
  cacheTag("cms-pages")
  cacheLife({ revalidate: 3600 })
  return getFooterPages()
}

// ─── Global settings queries ──────────────────────────────────────────────────

export async function getSiteSettings() {
  const payload = await getPayload({ config })
  return payload.findGlobal({ slug: "site-settings", depth: 1 })
}

export async function getNavigation() {
  const payload = await getPayload({ config })
  return payload.findGlobal({ slug: "navigation", depth: 0 })
}

export async function getFooter() {
  const payload = await getPayload({ config })
  return payload.findGlobal({ slug: "footer", depth: 1 })
}

export async function getHomepage() {
  const payload = await getPayload({ config })
  return payload.findGlobal({ slug: "homepage", depth: 2 })
}

// ─── Collection queries ───────────────────────────────────────────────────────

export async function getTestimonials() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: "testimonials",
    pagination: false,
    depth: 1,
  })
  return docs
}

export async function getFaqs(category?: string) {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: "faqs",
    where: {
      ...(category ? { category: { equals: category } } : {}),
    },
    pagination: false,
    depth: 0,
  })
  return docs
}

// ─── Cached global settings ───────────────────────────────────────────────────

export async function getCachedSiteSettings() {
  "use cache"
  cacheTag("cms-globals")
  cacheLife({ revalidate: 3600 })
  return getSiteSettings()
}

export async function getCachedNavigation() {
  "use cache"
  cacheTag("cms-globals")
  cacheLife({ revalidate: 3600 })
  return getNavigation()
}

export async function getCachedFooter() {
  "use cache"
  cacheTag("cms-globals")
  cacheLife({ revalidate: 3600 })
  return getFooter()
}

export async function getCachedHomepage() {
  "use cache"
  cacheTag("cms-homepage")
  cacheLife({ revalidate: 3600 })
  return getHomepage()
}

// ─── Cached collection queries ────────────────────────────────────────────────

export async function getCachedTestimonials() {
  "use cache"
  cacheTag("cms-blog")
  cacheLife({ revalidate: 3600 })
  return getTestimonials()
}

export async function getCachedFaqs(category?: string) {
  "use cache"
  cacheTag("cms-blog")
  cacheLife({ revalidate: 3600 })
  return getFaqs(category)
}

// ─── Re-exports ──────────────────────────────────────────────────────────────

export { calcReadTime } from "./read-time"
