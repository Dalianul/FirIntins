import type { MetadataRoute } from "next"
import { BASE_URL } from "@/lib/constants"
import { getProducts, getCategories } from "@/lib/medusa/queries"
import { getPosts, getFooterPages } from "@/lib/cms/client"

export const revalidate = 3600

const FALLBACK_DATE = new Date("2026-03-25")

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      changeFrequency: "weekly",
      priority: 1.0,
      lastModified: FALLBACK_DATE,
    },
    {
      url: `${BASE_URL}/produse`,
      changeFrequency: "daily",
      priority: 0.9,
      lastModified: FALLBACK_DATE,
    },
    {
      url: `${BASE_URL}/blog`,
      changeFrequency: "weekly",
      priority: 0.7,
      lastModified: FALLBACK_DATE,
    },
  ]

  const productUrls: MetadataRoute.Sitemap = await (async () => {
    try {
      const { products } = await getProducts({ limit: 200 })
      return products.map((p: any) => ({
        url: `${BASE_URL}/produse/${p.handle}`,
        changeFrequency: "weekly" as const,
        priority: 0.8,
        lastModified: (p as any).updated_at
          ? new Date((p as any).updated_at)
          : FALLBACK_DATE,
      }))
    } catch {
      return []
    }
  })()

  const categoryUrls: MetadataRoute.Sitemap = await (async () => {
    try {
      const categories = await getCategories()
      return categories.map((c: any) => ({
        url: `${BASE_URL}/categorii/${c.handle}`,
        changeFrequency: "monthly" as const,
        priority: 0.6,
        lastModified: (c as any).updated_at
          ? new Date((c as any).updated_at)
          : FALLBACK_DATE,
      }))
    } catch {
      return []
    }
  })()

  const blogUrls: MetadataRoute.Sitemap = await (async () => {
    try {
      const posts = await getPosts()
      return posts.map((p: any) => ({
        url: `${BASE_URL}/blog/${p.slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.7,
        lastModified: p.updatedAt ? new Date(p.updatedAt) : FALLBACK_DATE,
      }))
    } catch {
      return []
    }
  })()

  const pageUrls: MetadataRoute.Sitemap = await (async () => {
    try {
      const pages = await getFooterPages()
      return pages.map((p: any) => ({
        url: `${BASE_URL}/pagini/${p.slug}`,
        changeFrequency: "monthly" as const,
        priority: 0.5,
        lastModified: p.updatedAt ? new Date(p.updatedAt) : FALLBACK_DATE,
      }))
    } catch {
      return []
    }
  })()

  return [...staticPages, ...productUrls, ...categoryUrls, ...blogUrls, ...pageUrls]
}
