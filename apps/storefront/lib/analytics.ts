import type { Cart, CartItem } from "@/context/cart-context"

export interface GA4Item {
  item_id: string
  item_name: string
  item_variant?: string
  price: number
  quantity: number
}

function safeGtag(...args: unknown[]): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return
  window.gtag(...args)
}

export function grantAnalyticsConsent(): void {
  safeGtag("consent", "update", {
    analytics_storage: "granted",
    ad_storage: "granted",
  })
}

export function denyAnalyticsConsent(): void {
  safeGtag("consent", "update", {
    analytics_storage: "denied",
    ad_storage: "denied",
  })
}

export function trackViewItem(product: {
  id: string
  title: string
  price?: number
}): void {
  const price = product.price ? product.price / 100 : 0
  safeGtag("event", "view_item", {
    currency: "RON",
    value: price,
    items: [{ item_id: product.id, item_name: product.title, price, quantity: 1 }],
  })
}

export function trackAddToCart(item: CartItem): void {
  const price = item.unit_price / 100
  safeGtag("event", "add_to_cart", {
    currency: "RON",
    value: price * item.quantity,
    items: [
      {
        item_id: item.variant_id,
        item_name: item.product_title,
        item_variant: item.variant_title ?? undefined,
        price,
        quantity: item.quantity,
      },
    ],
  })
}

export function trackBeginCheckout(cart: Cart): void {
  const items: GA4Item[] = cart.items.map((item) => ({
    item_id: item.variant_id,
    item_name: item.product_title,
    item_variant: item.variant_title ?? undefined,
    price: item.unit_price / 100,
    quantity: item.quantity,
  }))
  safeGtag("event", "begin_checkout", {
    currency: "RON",
    value: cart.total / 100,
    items,
  })
}

export function trackPurchase(
  orderId: string,
  total: number,
  items: GA4Item[]
): void {
  safeGtag("event", "purchase", {
    transaction_id: orderId,
    currency: "RON",
    value: total / 100,
    items,
  })
}
