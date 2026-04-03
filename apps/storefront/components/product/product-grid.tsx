import { getProducts, SORT_ORDER_MAP } from "@/lib/medusa/queries"
import { ProductGridAnimated } from "@/components/product/product-grid-animated"

interface SearchParams {
  q?: string
  category?: string
  price_min?: string
  price_max?: string
  in_stock?: string
  sort?: string
  page?: string
}

interface Props {
  searchParams: SearchParams
}

export default async function ProductGrid({ searchParams }: Props) {
  const { q, category, price_min, price_max, in_stock, sort, page } = searchParams

  const offset = (parseInt(page ?? "1", 10) - 1) * 12

  const apiOrder = sort && SORT_ORDER_MAP[sort] ? SORT_ORDER_MAP[sort] : undefined

  let { products } = await getProducts({
    limit: 12,
    offset,
    ...(q ? { q } : {}),
    ...(category ? { category_id: [category] } : {}),
    ...(apiOrder ? { order: apiOrder } : {}),
  })

  // Post-fetch: in_stock filter
  if (in_stock === "true") {
    products = products.filter((p: any) =>
      p.variants?.some((v: any) => (v.inventory_quantity ?? 0) > 0)
    )
  }

  // Post-fetch: price range filter (URL params in RON → convert to bani ×100)
  if (price_min) {
    const minBani = parseFloat(price_min) * 100
    products = products.filter((p: any) =>
      p.variants?.some((v: any) => (v.calculated_price?.calculated_amount ?? 0) >= minBani)
    )
  }
  if (price_max) {
    const maxBani = parseFloat(price_max) * 100
    products = products.filter((p: any) =>
      p.variants?.some((v: any) => (v.calculated_price?.calculated_amount ?? Infinity) <= maxBani)
    )
  }

  // Post-fetch: price sort (price_asc / price_desc)
  if (sort === "price_asc") {
    products = [...products].sort((a: any, b: any) => {
      const aPrice = a.variants?.[0]?.calculated_price?.calculated_amount ?? 0
      const bPrice = b.variants?.[0]?.calculated_price?.calculated_amount ?? 0
      return aPrice - bPrice
    })
  } else if (sort === "price_desc") {
    products = [...products].sort((a: any, b: any) => {
      const aPrice = a.variants?.[0]?.calculated_price?.calculated_amount ?? 0
      const bPrice = b.variants?.[0]?.calculated_price?.calculated_amount ?? 0
      return bPrice - aPrice
    })
  }

  if (products.length === 0) {
    return (
      <p className="py-16 text-center text-[--color-fog]/60">
        Niciun produs găsit.
      </p>
    )
  }

  return <ProductGridAnimated products={products} />
}
