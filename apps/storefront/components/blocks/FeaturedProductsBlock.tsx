import { getProduct } from "@/lib/medusa/queries"
import { FeaturedProductsBlockUI } from "./FeaturedProductsBlockUI"

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

  return <FeaturedProductsBlockUI heading={heading} layout={layout} products={products as any[]} />
}
