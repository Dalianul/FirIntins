import { getProducts } from "@/lib/medusa/queries"
import { ProductCard } from "@/components/product/product-card"

export async function NewsSection() {
  const { products } = await getProducts({ limit: 4 })

  return (
    <section className="py-20 px-4 bg-surface">
      <h2 className="font-cormorant text-5xl text-cream mb-12 max-w-6xl mx-auto">
        Noutăți
      </h2>
      <div className="flex gap-6 overflow-x-auto pb-4 px-4 max-w-6xl mx-auto">
        {products.map((product: any) => (
          <div key={product.id} className="flex-shrink-0 w-64">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  )
}
