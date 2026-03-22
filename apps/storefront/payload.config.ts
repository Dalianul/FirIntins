import { buildConfig } from "payload"
import { postgresAdapter } from "@payloadcms/db-postgres"
import { lexicalEditor } from "@payloadcms/richtext-lexical"
import path from "path"
import { fileURLToPath } from "url"

// Import collections
import { Users } from "./collections/Users.ts"
import { Posts } from "./collections/Posts.ts"
import { Pages } from "./collections/Pages.ts"
import { Categories } from "./collections/Categories.ts"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default buildConfig({
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
    {
      slug: "media",
      upload: true,
      fields: [{ name: "alt", type: "text" }],
    },
  ],
  typescript: {
    outputFile: path.resolve(__dirname, "payload-types.ts"),
  },
  admin: {
    user: "users",
    meta: { title: "FirIntins CMS" },
  },
})
