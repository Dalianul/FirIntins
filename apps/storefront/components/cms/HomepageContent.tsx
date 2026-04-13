"use client"

import { useLivePreview } from "@payloadcms/live-preview-react"
import { HeroBlock } from "@/components/blocks/HeroBlock"
import { FeaturedProductsBlockUI } from "@/components/blocks/FeaturedProductsBlockUI"
import { OffersBlock } from "@/components/blocks/OffersBlock"
import { FeaturesGridBlock } from "@/components/blocks/FeaturesGridBlock"
import { TestimonialsBlock } from "@/components/blocks/TestimonialsBlock"
import { FaqBlock } from "@/components/blocks/FaqBlock"
import { RichTextBlock } from "@/components/blocks/RichTextBlock"
import { CtaBlock } from "@/components/blocks/CtaBlock"
import { ImageBannerBlock } from "@/components/blocks/ImageBannerBlock"
import { NewsletterBlock } from "@/components/blocks/NewsletterBlock"
import { VideoBlock } from "@/components/blocks/VideoBlock"
import { StepsBlock } from "@/components/blocks/StepsBlock"
import { LogosBlock } from "@/components/blocks/LogosBlock"
import { SpacerBlock } from "@/components/blocks/SpacerBlock"

interface Props {
  initialData: any
  serverURL: string
  /** Pre-fetched Medusa products keyed by Payload block ID */
  prefetchedProducts: Record<string, any[]>
}

export function HomepageContent({ initialData, serverURL, prefetchedProducts }: Props) {
  const { data } = useLivePreview({ initialData, serverURL, depth: 2 })
  const blocks = (data?.blocks ?? []) as any[]

  return (
    <>
      {blocks.map((block: any, i: number) => {
        const key = block.id ?? i
        switch (block.blockType) {
          case "hero":
            return <HeroBlock key={key} block={block} />
          case "featuredProducts":
            return (
              <FeaturedProductsBlockUI
                key={key}
                heading={block.heading}
                layout={block.layout}
                products={prefetchedProducts[block.id] ?? []}
              />
            )
          case "offers":
            return <OffersBlock key={key} block={block} />
          case "featuresGrid":
            return <FeaturesGridBlock key={key} block={block} />
          case "testimonials":
            return <TestimonialsBlock key={key} block={block} />
          case "faq":
            return <FaqBlock key={key} block={block} />
          case "richText":
            return <RichTextBlock key={key} block={block} />
          case "cta":
            return <CtaBlock key={key} block={block} />
          case "imageBanner":
            return <ImageBannerBlock key={key} block={block} />
          case "newsletter":
            return <NewsletterBlock key={key} block={block} />
          case "video":
            return <VideoBlock key={key} block={block} />
          case "steps":
            return <StepsBlock key={key} block={block} />
          case "logos":
            return <LogosBlock key={key} block={block} />
          case "spacer":
            return <SpacerBlock key={key} block={block} />
          default:
            return null
        }
      })}
    </>
  )
}
