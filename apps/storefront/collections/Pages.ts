import type { CollectionConfig } from "payload"
import { lexicalEditor } from "@payloadcms/richtext-lexical"

function getRevalidateTag(): ((tag: string) => void) | null {
  try {
    // Try to load next/cache dynamically at runtime only
    const module = eval('require')("next/cache")
    return module.revalidateTag
  } catch {
    // Module not available (e.g., during generate:importmap)
    return null
  }
}

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
          const revalidate = getRevalidateTag()
          if (revalidate) {
            revalidate("cms-pages")
          }
        } catch (e) {
          console.warn("cms-pages revalidation skipped:", e)
        }
      },
    ],
  },
}
