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
}

export async function getProducts(params?: ProductParams) {
  const res = await medusa.store.product.list(params)
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
  const res = await medusa.store.cart.create({})
  return res.cart
}
