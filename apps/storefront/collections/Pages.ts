import type { CollectionConfig } from "payload"
import {
  lexicalEditor,
  HeadingFeature,
  BoldFeature,
  ItalicFeature,
  UnderlineFeature,
  StrikethroughFeature,
  BlockquoteFeature,
  LinkFeature,
  UploadFeature,
  HorizontalRuleFeature,
  OrderedListFeature,
  UnorderedListFeature,
  ChecklistFeature,
  AlignFeature,
  IndentFeature,
  FixedToolbarFeature,
  InlineToolbarFeature,
  InlineCodeFeature,
  SuperscriptFeature,
  SubscriptFeature,
  ParagraphFeature,
} from "@payloadcms/richtext-lexical"

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
      editor: lexicalEditor({
        features: [
          FixedToolbarFeature(),
          InlineToolbarFeature(),
          ParagraphFeature(),
          HeadingFeature({ enabledHeadingSizes: ["h1", "h2", "h3", "h4"] }),
          BoldFeature(),
          ItalicFeature(),
          UnderlineFeature(),
          StrikethroughFeature(),
          InlineCodeFeature(),
          SuperscriptFeature(),
          SubscriptFeature(),
          AlignFeature(),
          IndentFeature(),
          BlockquoteFeature(),
          LinkFeature({ enabledCollections: [] }),
          UploadFeature({
            collections: {
              media: {
                fields: [{ name: "alt", type: "text" }],
              },
            },
          }),
          HorizontalRuleFeature(),
          OrderedListFeature(),
          UnorderedListFeature(),
          ChecklistFeature(),
        ],
      }),
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
      async () => {
        try {
          const { revalidateTag } = await import("next/cache")
          revalidateTag("cms-pages", {})
        } catch (e) {
          console.warn("cms-pages revalidation skipped:", e)
        }
      },
    ],
  },
}
