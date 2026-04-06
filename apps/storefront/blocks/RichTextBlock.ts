import type { Block } from "payload"
import {
  lexicalEditor,
  HeadingFeature, BoldFeature, ItalicFeature, UnderlineFeature,
  StrikethroughFeature, BlockquoteFeature, LinkFeature, UploadFeature,
  HorizontalRuleFeature, OrderedListFeature, UnorderedListFeature,
  ChecklistFeature, AlignFeature, IndentFeature, FixedToolbarFeature,
  InlineToolbarFeature, InlineCodeFeature, SuperscriptFeature,
  SubscriptFeature, ParagraphFeature,
} from "@payloadcms/richtext-lexical"
import { ColorFeature } from "../features/color/feature.server"
import { FontSizeFeature } from "../features/font-size/feature.server"

export const RichTextBlock: Block = {
  slug: "richText",
  labels: { singular: "Text Rich — Conținut formatat", plural: "Blocuri Text Rich" },
  admin: { images: { thumbnail: { url: "/block-thumbnails/rich-text.svg", alt: "Rich text block preview" } } },
  fields: [
    {
      name: "content",
      type: "richText",
      editor: lexicalEditor({
        features: [
          FixedToolbarFeature(), InlineToolbarFeature(),
          ColorFeature(), FontSizeFeature(),
          ParagraphFeature(),
          HeadingFeature({ enabledHeadingSizes: ["h1", "h2", "h3", "h4"] }),
          BoldFeature(), ItalicFeature(), UnderlineFeature(),
          StrikethroughFeature(), InlineCodeFeature(),
          SuperscriptFeature(), SubscriptFeature(),
          AlignFeature(), IndentFeature(), BlockquoteFeature(),
          LinkFeature({ enabledCollections: [] }),
          UploadFeature({ collections: { media: { fields: [{ name: "alt", type: "text" }] } } }),
          HorizontalRuleFeature(), OrderedListFeature(),
          UnorderedListFeature(), ChecklistFeature(),
        ],
      }),
    },
  ],
}
