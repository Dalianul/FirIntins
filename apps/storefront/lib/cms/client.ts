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
      status: { equals: "published" },
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
    where: { slug: { equals: slug }, status: { equals: "published" } },
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

// ─── Re-exports ──────────────────────────────────────────────────────────────

export { calcReadTime } from "./read-time"
