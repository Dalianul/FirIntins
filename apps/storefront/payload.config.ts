import { buildConfig } from "payload"
import { postgresAdapter } from "@payloadcms/db-postgres"
import { lexicalEditor } from "@payloadcms/richtext-lexical"
import { seoPlugin } from "@payloadcms/plugin-seo"
import path from "path"

// Import collections
import { Users } from "./collections/Users.ts"
import { Posts } from "./collections/Posts.ts"
import { Pages } from "./collections/Pages.ts"
import { Categories } from "./collections/Categories.ts"
import { NewsletterSubscribers } from "./collections/NewsletterSubscribers.ts"

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
