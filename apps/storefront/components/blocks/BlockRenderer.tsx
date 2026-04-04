import { HeroBlock } from "./HeroBlock"
import { FeaturedProductsBlock } from "./FeaturedProductsBlock"
import { OffersBlock } from "./OffersBlock"
import { FeaturesGridBlock } from "./FeaturesGridBlock"
import { TestimonialsBlock } from "./TestimonialsBlock"
import { FaqBlock } from "./FaqBlock"
import { RichTextBlock } from "./RichTextBlock"
import { CtaBlock } from "./CtaBlock"
import { ImageBannerBlock } from "./ImageBannerBlock"

export function BlockRenderer({ blocks }: { blocks: any[] }) {
  return (
    <>
      {blocks.map((block, i) => {
        switch (block.blockType) {
          case "hero":
            return <HeroBlock key={i} block={block} />
          case "featuredProducts":
            return <FeaturedProductsBlock key={i} block={block} />
          case "offers":
            return <OffersBlock key={i} block={block} />
          case "featuresGrid":
            return <FeaturesGridBlock key={i} block={block} />
          case "testimonials":
            return <TestimonialsBlock key={i} block={block} />
          case "faq":
            return <FaqBlock key={i} block={block} />
          case "richText":
            return <RichTextBlock key={i} block={block} />
          case "cta":
            return <CtaBlock key={i} block={block} />
          case "imageBanner":
            return <ImageBannerBlock key={i} block={block} />
          default:
            return null
        }
      })}
    </>
  )
}
