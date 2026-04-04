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
import { Testimonials } from "./collections/Testimonials"
import { Faqs } from "./collections/Faqs"

// Import globals
import { SiteSettings } from "./globals/SiteSettings"
import { Navigation } from "./globals/Navigation"
import { Footer } from "./globals/Footer"
import { Homepage } from "./globals/Homepage"

const serverURL =
  process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3000"

export default buildConfig({
  serverURL,
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
    Testimonials,
    Faqs,
    {
      slug: "media",
      upload: true,
      access: {
        read: () => true,
      },
      fields: [
        { name: "alt", type: "text" },
        { name: "caption", type: "text" },
        { name: "focalPoint", type: "point" },
      ],
    },
  ],
  globals: [SiteSettings, Navigation, Footer, Homepage],
  plugins: [
    seoPlugin({
      collections: ["posts", "pages"],
      generateTitle: ({ doc }) =>
        `${(doc as { title?: string }).title ?? ""} — FirIntins`,
      generateDescription: ({ doc }) =>
        (doc as { excerpt?: string }).excerpt ?? "",
      generateURL: ({ doc, collectionConfig }) => {
        const slug = (doc as { slug?: string }).slug ?? ""
        if (collectionConfig?.slug === "posts") return `${serverURL}/blog/${slug}`
        return `${serverURL}/pagini/${slug}`
      },
    }),
  ],
  typescript: {
    outputFile: path.resolve(process.cwd(), "payload-types.ts"),
  },
  admin: {
    user: "users",
    meta: { title: "FirIntins CMS" },
    livePreview: {
      breakpoints: [
        { label: "Mobile", name: "mobile", width: 375, height: 812 },
        { label: "Tablet", name: "tablet", width: 768, height: 1024 },
        { label: "Desktop", name: "desktop", width: 1440, height: 900 },
      ],
    },
  },
})
