import { buildConfig } from "payload"
import { postgresAdapter } from "@payloadcms/db-postgres"
import { lexicalEditor } from "@payloadcms/richtext-lexical"
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
  typescript: {
    outputFile: path.resolve(process.cwd(), "payload-types.ts"),
  },
  admin: {
    user: "users",
    meta: { title: "FirIntins CMS" },
  },
})
