import { medusa } from "./client"

// SDK response shapes (Medusa v2):
// store.product.list()      → { products: Product[], count, offset, limit }
// store.product.retrieve()  → { product: Product }
// store.category.list()     → { product_categories: ProductCategory[], count }
// store.category.retrieve() → { product_category: ProductCategory }
// store.cart.retrieve()     → { cart: Cart }
// store.cart.create()       → { cart: Cart }

export interface ProductParams {
  limit?: number
  offset?: number
  category_id?: string[]
  region_id?: string
  handle?: string
  q?: string
  order?: string
}

// Maps URL `sort` param → Medusa v2 `order` string.
// Prefix `-` means DESC. No prefix = ASC.
// price_asc / price_desc are NOT here — they are applied post-fetch.
// relevance is NOT here — omitting `order` uses Medusa's default ranking.
export const SORT_ORDER_MAP: Record<string, string> = {
  newest:     '-created_at',
  title_asc:  'title',
  title_desc: '-title',
}

// Lazily fetched and cached — region_id is required by Medusa v2 to compute calculated_price.
let cachedRegionId: string | undefined

async function getRegionId(): Promise<string | undefined> {
  if (cachedRegionId) return cachedRegionId
  try {
    const { regions } = await medusa.store.region.list()
    cachedRegionId = regions[0]?.id
    return cachedRegionId
  } catch {
    return undefined
  }
}

// Medusa v2 pricing: variant.prices does NOT exist at runtime.
// Prices are at variant.calculated_price.calculated_amount (in bani).
// Requires region_id param + *variants.calculated_price field expansion.
const PRODUCT_FIELDS = '*variants.calculated_price,+variants.inventory_quantity,+metadata'

export async function getProducts(params?: ProductParams) {
  // Medusa JS SDK TypeScript types don't expose `fields`, `q`, or `order` query params.
  // `as Function` bypasses this SDK typing limitation — revisit when SDK types are updated.
  const region_id = params?.region_id ?? await getRegionId()
  const res = await (medusa.store.product.list as Function)({
    ...params,
    region_id,
    fields: PRODUCT_FIELDS,
  })
  return res // { products, count, offset, limit }
}

export async function getProduct(handle: string) {
  // retrieve by handle: pass as query param
  // Use Function cast to pass `fields` (same pattern as getProducts — SDK types don't expose it)
  const region_id = await getRegionId()
  const res = await (medusa.store.product.list as Function)({
    handle,
    region_id,
    fields: PRODUCT_FIELDS,
  })
  return res.products[0] ?? null // returns Product | null
}

export async function getCategories() {
  const res = await medusa.store.category.list()
  return res.product_categories
}

export async function getCategory(slug: string) {
  const res = await medusa.store.category.list({ handle: slug })
  return res.product_categories[0] ?? null
}

export async function getCart(cartId: string) {
  const res = await medusa.store.cart.retrieve(cartId)
  return res.cart
}

export async function createCart() {
  const { regions } = await medusa.store.region.list()
  const region_id = regions[0]?.id
  const res = await medusa.store.cart.create({ region_id })
  return res.cart
}

export async function getOfferProducts() {
  const region_id = await getRegionId()
  const res = await (medusa.store.product.list as Function)({
    limit: 100,
    region_id,
    fields: PRODUCT_FIELDS,
  })
  return (res.products as any[]).filter(
    (p) =>
      p.metadata?.is_oferta === true ||
      (p.metadata?.discount_percentage != null &&
        Number(p.metadata.discount_percentage) > 0)
  )
}
