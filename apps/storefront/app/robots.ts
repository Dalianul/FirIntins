import type { MetadataRoute } from "next"
import { BASE_URL } from "@/lib/constants"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/checkout", "/cont", "/api", "/admin"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
