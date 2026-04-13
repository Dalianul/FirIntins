import { ProductCard } from "@/components/product/product-card"
import { AnimatedSection } from "@/components/ui/animated-section"
import { FeaturedProductsCarousel } from "./FeaturedProductsCarousel"

interface Props {
  heading?: string
  layout?: "grid" | "carousel"
  products: any[]
}

export function FeaturedProductsBlockUI({ heading, layout, products }: Props) {
  if (products.length === 0) return null

  return (
    <section className="py-20 md:py-28 px-6 sm:px-10 bg-bg">
      <div className="max-w-7xl mx-auto">
        {heading && (
          <AnimatedSection className="mb-12">
            <span className="block text-moss text-xs font-outfit uppercase tracking-[0.25em] mb-3">
              Selecția noastră
            </span>
            <h2 className="font-cormorant text-4xl md:text-5xl text-[#1c1a15]">{heading}</h2>
          </AnimatedSection>
        )}

        {layout === "carousel" ? (
          <FeaturedProductsCarousel products={products} />
        ) : (
          <AnimatedSection delay={0.1}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </AnimatedSection>
        )}
      </div>
    </section>
  )
}
