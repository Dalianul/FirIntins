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

export const Posts: CollectionConfig = {
  slug: "posts",
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
        description: "Auto-generated from title. URL-friendly, e.g. ghid-pescuit-crap",
      },
    },
    {
      name: "category",
      type: "relationship",
      relationTo: "categories",
      required: true,
    },
    {
      name: "coverImage",
      type: "upload",
      relationTo: "media",
      required: true,
    },
    {
      name: "excerpt",
      type: "textarea",
      maxLength: 200,
    },
    {
      name: "content",
      type: "richText",
      editor: lexicalEditor({}),
    },
    {
      name: "author",
      type: "text",
    },
    {
      name: "publishedAt",
      type: "date",
    },
    {
      name: "status",
      type: "select",
      defaultValue: "draft",
      options: [
        { label: "Draft", value: "draft" },
        { label: "Published", value: "published" },
      ],
    },
  ],
  hooks: {
    afterChange: [
      () => {
        try {
          const revalidate = getRevalidateTag()
          if (revalidate) {
            revalidate("cms-blog")
          }
        } catch (e) {
          console.warn("cms-blog revalidation skipped:", e)
        }
      },
    ],
  },
}
