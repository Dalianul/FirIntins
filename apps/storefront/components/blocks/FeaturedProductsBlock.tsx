import { getProduct } from "@/lib/medusa/queries"
import { ProductCard } from "@/components/product/product-card"

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
    <section className="py-16 px-6 max-w-7xl mx-auto">
      {heading && (
        <h2 className="font-cormorant text-4xl text-[--color-white] mb-8 text-center">{heading}</h2>
      )}
      <div
        className={
          layout === "carousel"
            ? "flex gap-6 overflow-x-auto pb-4"
            : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        }
      >
        {products.map((product) => (
          <ProductCard key={(product as any).id} product={product as any} />
        ))}
      </div>
    </section>
  )
}
