import type { CollectionConfig } from "payload"
import { lexicalEditor } from "@payloadcms/richtext-lexical"
import { revalidateTag } from "next/cache"

export const Pages: CollectionConfig = {
  slug: "pages",
  admin: {
    useAsTitle: "title",
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: {
        description: "URL slug, e.g. despre-noi, gdpr, termeni-si-conditii, retur",
      },
    },
    {
      name: "content",
      type: "richText",
      editor: lexicalEditor({}),
    },
    {
      name: "showInFooter",
      type: "checkbox",
      defaultValue: false,
      admin: {
        description: "Show link to this page in the footer Informații column",
      },
    },
  ],
  hooks: {
    afterChange: [
      () => {
        try {
          revalidateTag("cms-pages")
        } catch (e) {
          console.warn("cms-pages revalidation skipped:", e)
        }
      },
    ],
  },
}
