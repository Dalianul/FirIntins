import type { Cart, CartItem } from "@/context/cart-context"

// Set up window.gtag mock before each test
beforeEach(() => {
  window.gtag = jest.fn()
  window.dataLayer = []
})

// Import after mock setup to ensure SSR guard tests work
import {
  grantAnalyticsConsent,
  denyAnalyticsConsent,
  trackViewItem,
  trackAddToCart,
  trackBeginCheckout,
  trackPurchase,
} from "@/lib/analytics"

describe("consent management", () => {
  it("grantAnalyticsConsent calls gtag with granted storage", () => {
    grantAnalyticsConsent()
    expect(window.gtag).toHaveBeenCalledWith("consent", "update", {
      analytics_storage: "granted",
      ad_storage: "granted",
    })
  })

  it("denyAnalyticsConsent calls gtag with denied storage", () => {
    denyAnalyticsConsent()
    expect(window.gtag).toHaveBeenCalledWith("consent", "update", {
      analytics_storage: "denied",
      ad_storage: "denied",
    })
  })
})

describe("trackViewItem", () => {
  it("fires view_item with correct payload including price conversion", () => {
    trackViewItem({ id: "prod_1", title: "Lanseta Crap", price: 25000 })
    expect(window.gtag).toHaveBeenCalledWith("event", "view_item", {
      currency: "RON",
      value: 250,
      items: [{ item_id: "prod_1", item_name: "Lanseta Crap", price: 250, quantity: 1 }],
    })
  })

  it("fires view_item with value 0 when price is undefined", () => {
    trackViewItem({ id: "prod_1", title: "Lanseta Crap" })
    expect(window.gtag).toHaveBeenCalledWith("event", "view_item", {
      currency: "RON",
      value: 0,
      items: [{ item_id: "prod_1", item_name: "Lanseta Crap", price: 0, quantity: 1 }],
    })
  })
})

describe("trackAddToCart", () => {
  const item: CartItem = {
    id: "li_1",
    variant_id: "var_1",
    product_title: "Lanseta Crap",
    variant_title: "3.6m",
    quantity: 2,
    unit_price: 25000,
    total: 50000,
  }

  it("fires add_to_cart with correct payload — price conversion and item_variant", () => {
    trackAddToCart(item)
    expect(window.gtag).toHaveBeenCalledWith("event", "add_to_cart", {
      currency: "RON",
      value: 500,
      items: [
        {
          item_id: "var_1",
          item_name: "Lanseta Crap",
          item_variant: "3.6m",
          price: 250,
          quantity: 2,
        },
      ],
    })
  })

  it("omits item_variant when variant_title is null", () => {
    trackAddToCart({ ...item, variant_title: null })
    const call = (window.gtag as jest.Mock).mock.calls[0]
    expect(call[2].items[0].item_variant).toBeUndefined()
  })
})

describe("trackBeginCheckout", () => {
  const cart: Cart = {
    id: "cart_1",
    items: [
      {
        id: "li_1",
        variant_id: "var_1",
        product_title: "Lanseta Crap",
        variant_title: null,
        quantity: 1,
        unit_price: 25000,
        total: 25000,
      },
    ],
    subtotal: 25000,
    total: 25000,
  }

  it("fires begin_checkout with correct payload", () => {
    trackBeginCheckout(cart)
    expect(window.gtag).toHaveBeenCalledWith("event", "begin_checkout", {
      currency: "RON",
      value: 250,
      items: [
        {
          item_id: "var_1",
          item_name: "Lanseta Crap",
          item_variant: undefined,
          price: 250,
          quantity: 1,
        },
      ],
    })
  })
})

describe("trackPurchase", () => {
  it("fires purchase with correct payload", () => {
    trackPurchase("order_1", 25000, [
      { item_id: "prod_1", item_name: "Lanseta Crap", price: 250, quantity: 1 },
    ])
    expect(window.gtag).toHaveBeenCalledWith("event", "purchase", {
      transaction_id: "order_1",
      currency: "RON",
      value: 250,
      items: [{ item_id: "prod_1", item_name: "Lanseta Crap", price: 250, quantity: 1 }],
    })
  })
})

describe("SSR guard", () => {
  it("all functions are no-ops when window.gtag is not defined", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).gtag
    const cart: Cart = { id: "c1", items: [], subtotal: 0, total: 0 }
    expect(() => grantAnalyticsConsent()).not.toThrow()
    expect(() => denyAnalyticsConsent()).not.toThrow()
    expect(() => trackViewItem({ id: "p1", title: "T" })).not.toThrow()
    expect(() => trackPurchase("o1", 0, [])).not.toThrow()
    expect(() => trackBeginCheckout(cart)).not.toThrow()
  })
})
