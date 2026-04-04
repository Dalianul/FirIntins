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
import { ColorFeature } from "@/features/color/feature.server"
import { FontSizeFeature } from "@/features/font-size/feature.server"
import { isAdminOrEditor } from "@/lib/cms/access"

const serverURL = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3000"

export const Posts: CollectionConfig = {
  slug: "posts",
  admin: {
    useAsTitle: "title",
    livePreview: {
      url: ({ data }) => `${serverURL}/blog/${data?.slug ?? ""}`,
    },
  },
  versions: {
    drafts: true,
  },
  access: {
    create: isAdminOrEditor,
    read: () => true,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
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
          FixedToolbarFeature(),
          InlineToolbarFeature(),
          ColorFeature(),
          FontSizeFeature(),
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
      name: "author",
      type: "text",
    },
    {
      name: "publishedAt",
      type: "date",
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
