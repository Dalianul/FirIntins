import type { GlobalConfig } from "payload"
import { isAdmin, isAdminOrEditor } from "../lib/cms/access"
import { HeroBlock } from "../blocks/HeroBlock"
import { FeaturedProductsBlock } from "../blocks/FeaturedProductsBlock"
import { OffersBlock } from "../blocks/OffersBlock"
import { FeaturesGridBlock } from "../blocks/FeaturesGridBlock"
import { TestimonialsBlock } from "../blocks/TestimonialsBlock"
import { FaqBlock } from "../blocks/FaqBlock"
import { RichTextBlock } from "../blocks/RichTextBlock"
import { CtaBlock } from "../blocks/CtaBlock"
import { ImageBannerBlock } from "../blocks/ImageBannerBlock"
import { NewsletterBlock } from "../blocks/NewsletterBlock"
import { VideoBlock } from "../blocks/VideoBlock"
import { StepsBlock } from "../blocks/StepsBlock"
import { LogosBlock } from "../blocks/LogosBlock"
import { SpacerBlock } from "../blocks/SpacerBlock"

const serverURL = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3000"

export const Homepage: GlobalConfig = {
  slug: "homepage",
  admin: {
    group: "Conținut",
    livePreview: {
      url: () => serverURL,
    },
  },
  versions: {
    drafts: true,
  },
  access: {
    read: isAdminOrEditor,
    update: isAdmin,
  },
  hooks: {
    afterChange: [
      async () => {
        try {
          const { revalidateTag } = await import("next/cache")
          revalidateTag("cms-homepage", {})
        } catch (e) {
          console.warn("cms-homepage revalidation skipped:", e)
        }
      },
    ],
  },
  fields: [
    {
      name: "title",
      type: "text",
      defaultValue: "Homepage",
      admin: { description: "Etichetă internă — nu apare pe site" },
    },
    {
      name: "blocks",
      type: "blocks",
      blocks: [
        HeroBlock,
        FeaturedProductsBlock,
        OffersBlock,
        FeaturesGridBlock,
        TestimonialsBlock,
        FaqBlock,
        RichTextBlock,
        CtaBlock,
        ImageBannerBlock,
        NewsletterBlock,
        VideoBlock,
        StepsBlock,
        LogosBlock,
        SpacerBlock,
      ],
    },
  ],
}
