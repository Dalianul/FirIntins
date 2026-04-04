import type { CollectionConfig } from "payload"
import { isAdminOrEditor } from "@/lib/cms/access"
import {
  lexicalEditor,
  BoldFeature,
  ItalicFeature,
  LinkFeature,
  ParagraphFeature,
  FixedToolbarFeature,
} from "@payloadcms/richtext-lexical"

export const Faqs: CollectionConfig = {
  slug: "faqs",
  admin: {
    useAsTitle: "question",
  },
  access: {
    create: isAdminOrEditor,
    read: () => true,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    {
      name: "question",
      type: "text",
      required: true,
    },
    {
      name: "answer",
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
      name: "category",
      type: "select",
      options: [
        { label: "General", value: "general" },
        { label: "Livrare", value: "shipping" },
        { label: "Retururi", value: "returns" },
        { label: "Produse", value: "products" },
      ],
    },
  ],
}
