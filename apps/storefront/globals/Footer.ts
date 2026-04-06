import type { GlobalConfig } from "payload"
import { isAdmin, isAdminOrEditor } from "../lib/cms/access"
import {
  lexicalEditor,
  BoldFeature,
  ItalicFeature,
  LinkFeature,
  ParagraphFeature,
  FixedToolbarFeature,
} from "@payloadcms/richtext-lexical"

export const Footer: GlobalConfig = {
  slug: "footer",
  admin: { group: "Setări Site" },
  access: {
    read: isAdminOrEditor,
    update: isAdminOrEditor,
  },
  hooks: {
    afterChange: [
      async () => {
        try {
          const { revalidateTag } = await import("next/cache")
          revalidateTag("cms-globals", {})
        } catch (e) {
          console.warn("cms-globals revalidation skipped:", e)
        }
      },
    ],
  },
  fields: [
    {
      name: "columns",
      type: "array",
      fields: [
        { name: "heading", type: "text", required: true },
        {
          name: "links",
          type: "array",
          fields: [
            { name: "label", type: "text", required: true },
            { name: "url", type: "text", required: true },
          ],
        },
      ],
    },
    {
      name: "legalText",
      type: "richText",
      editor: lexicalEditor({
        features: [
          FixedToolbarFeature(),
          ParagraphFeature(),
          BoldFeature(),
          ItalicFeature(),
          LinkFeature({ enabledCollections: [] }),
        ],
      }),
    },
    {
      name: "showNewsletter",
      type: "checkbox",
      defaultValue: true,
    },
  ],
}
