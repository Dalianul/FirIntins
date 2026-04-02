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
  order?: Record<string, string>
}

// Maps URL `sort` param → Medusa `order` object.
// price_asc / price_desc are NOT here — they are applied post-fetch.
// relevance is NOT here — omitting `order` uses Medusa's default ranking.
export const SORT_ORDER_MAP: Record<string, Record<string, string>> = {
  newest:     { created_at: 'DESC' },
  title_asc:  { title: 'ASC' },
  title_desc: { title: 'DESC' },
}

export async function getProducts(params?: ProductParams) {
  // Medusa JS SDK TypeScript types don't expose `fields`, `q`, or `order` query params.
  // `as Function` bypasses this SDK typing limitation — revisit when SDK types are updated.
  const res = await (medusa.store.product.list as Function)({
    ...params,
    fields: '+variants.inventory_quantity',
  })
  return res // { products, count, offset, limit }
}

export async function getProduct(handle: string) {
  // retrieve by handle: pass as query param
  const res = await medusa.store.product.list({ handle })
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
