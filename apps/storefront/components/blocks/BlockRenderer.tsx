import { HeroBlock } from "./HeroBlock"
import { FeaturedProductsBlock } from "./FeaturedProductsBlock"
import { OffersBlock } from "./OffersBlock"
import { FeaturesGridBlock } from "./FeaturesGridBlock"
import { TestimonialsBlock } from "./TestimonialsBlock"
import { FaqBlock } from "./FaqBlock"
import { RichTextBlock } from "./RichTextBlock"
import { CtaBlock } from "./CtaBlock"
import { ImageBannerBlock } from "./ImageBannerBlock"
import { NewsletterBlock } from "./NewsletterBlock"
import { VideoBlock } from "./VideoBlock"
import { StepsBlock } from "./StepsBlock"
import { LogosBlock } from "./LogosBlock"
import { SpacerBlock } from "./SpacerBlock"

export function BlockRenderer({ blocks }: { blocks: any[] }) {
  return (
    <>
      {blocks.map((block, i) => {
        switch (block.blockType) {
          case "hero":
            return <HeroBlock key={block.id ?? i} block={block} />
          case "featuredProducts":
            return <FeaturedProductsBlock key={block.id ?? i} block={block} />
          case "offers":
            return <OffersBlock key={block.id ?? i} block={block} />
          case "featuresGrid":
            return <FeaturesGridBlock key={block.id ?? i} block={block} />
          case "testimonials":
            return <TestimonialsBlock key={block.id ?? i} block={block} />
          case "faq":
            return <FaqBlock key={block.id ?? i} block={block} />
          case "richText":
            return <RichTextBlock key={block.id ?? i} block={block} />
          case "cta":
            return <CtaBlock key={block.id ?? i} block={block} />
          case "imageBanner":
            return <ImageBannerBlock key={block.id ?? i} block={block} />
          case "newsletter":
            return <NewsletterBlock key={block.id ?? i} block={block} />
          case "video":
            return <VideoBlock key={block.id ?? i} block={block} />
          case "steps":
            return <StepsBlock key={block.id ?? i} block={block} />
          case "logos":
            return <LogosBlock key={block.id ?? i} block={block} />
          case "spacer":
            return <SpacerBlock key={block.id ?? i} block={block} />
          default:
            return null
        }
      })}
    </>
  )
}
