import { getProduct } from "@/lib/medusa/queries"
import { ProductCard } from "@/components/product/product-card"
import { AnimatedSection } from "@/components/ui/animated-section"
import { FeaturedProductsCarousel } from "./FeaturedProductsCarousel"

interface FeaturedProductsBlockData {
  blockType: "featuredProducts"
  heading?: string
  productHandles?: Array<{ handle: string }>
  layout?: "grid" | "carousel"
}

export async function FeaturedProductsBlock({ block }: { block: FeaturedProductsBlockData }) {
  const { heading, productHandles, layout } = block
  const handles = (productHandles ?? []).map((h) => h.handle).filter(Boolean)

  const products = (
    await Promise.all(handles.map((handle) => getProduct(handle).catch(() => null)))
  ).filter(Boolean)

  if (products.length === 0) return null

  return (
    <section className="py-20 md:py-28 px-6 sm:px-10 bg-[--color-bg]">
      <div className="max-w-7xl mx-auto">
        {heading && (
          <AnimatedSection className="mb-12">
            <span className="block text-[--color-moss] text-xs font-outfit uppercase tracking-[0.25em] mb-3">
              Selecția noastră
            </span>
            <h2 className="font-cormorant text-4xl md:text-5xl text-[--color-white]">{heading}</h2>
          </AnimatedSection>
        )}

        {layout === "carousel" ? (
          <FeaturedProductsCarousel products={products as any[]} />
        ) : (
          <AnimatedSection delay={0.1}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={(product as any).id} product={product as any} />
              ))}
            </div>
          </AnimatedSection>
        )}
      </div>
    </section>
  )
}
