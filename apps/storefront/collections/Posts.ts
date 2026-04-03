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
  YouTubeFeature,
  HorizontalRuleFeature,
  OrderedListFeature,
  UnorderedListFeature,
  ChecklistFeature,
} from "@payloadcms/richtext-lexical"

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
      editor: lexicalEditor({
        features: [
          HeadingFeature({ enabledHeadingSizes: ["h2", "h3", "h4"] }),
          BoldFeature(),
          ItalicFeature(),
          UnderlineFeature(),
          StrikethroughFeature(),
          BlockquoteFeature(),
          LinkFeature({ enabledCollections: [] }),
          UploadFeature({
            collections: {
              media: {
                fields: [{ name: "alt", type: "text" }],
              },
            },
          }),
          YouTubeFeature(),
          HorizontalRuleFeature(),
          OrderedListFeature(),
          UnorderedListFeature(),
          ChecklistFeature(),
        ],
      }),
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
    beforeValidate: [
      ({ data }) => {
        if (data?.title && !data?.slug) {
          data.slug = (data.title as string)
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "")
        }
        return data
      },
    ],
    afterChange: [
      async () => {
        try {
          const { revalidateTag } = await import("next/cache")
          revalidateTag("cms-blog", {})
        } catch (e) {
          console.warn("cms-blog revalidation skipped:", e)
        }
      },
    ],
  },
}
