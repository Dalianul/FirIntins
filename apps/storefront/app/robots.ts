import { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/produse", "/categorii", "/login", "/register"],
        disallow: ["/checkout", "/cont", "/api"],
      },
    ],
    sitemap: "https://firintins.ro/sitemap.xml",
  }
}
