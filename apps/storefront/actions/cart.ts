"use server"

import { medusa } from "@/lib/medusa/client"

const CART_FIELDS = "+items.thumbnail"

export async function addItemToCart(
  cartId: string,
  variantId: string,
  quantity: number
) {
  try {
    const { cart } = await (medusa.store.cart.createLineItem as Function)(cartId, {
      variant_id: variantId,
      quantity,
    }, { fields: CART_FIELDS })
    return { success: true, cart }
  } catch (error) {
    console.error("addItemToCart error:", error)
    throw error
  }
}

export async function removeItemFromCart(cartId: string, lineItemId: string) {
  try {
    await medusa.store.cart.deleteLineItem(cartId, lineItemId)
    // deleteLineItem has no query params — retrieve fresh cart with fields expanded
    const cart = await retrieveCart(cartId)
    return { success: true, cart }
  } catch (error) {
    console.error("removeItemFromCart error:", error)
    throw error
  }
}

export async function updateCartQuantity(
  cartId: string,
  lineItemId: string,
  quantity: number
) {
  try {
    const { cart } = await (medusa.store.cart.updateLineItem as Function)(cartId, lineItemId, {
      quantity,
    }, { fields: CART_FIELDS })
    return { success: true, cart }
  } catch (error) {
    console.error("updateCartQuantity error:", error)
    throw error
  }
}

export async function createCart() {
  try {
    const { regions } = await medusa.store.region.list()
    const region_id = regions[0]?.id
    const { cart } = await medusa.store.cart.create({ region_id })
    return cart
  } catch (error) {
    console.error("createCart error:", error)
    throw error
  }
}

export async function retrieveCart(cartId: string) {
  try {
    const { cart } = await (medusa.store.cart.retrieve as Function)(cartId, { fields: CART_FIELDS })
    return cart
  } catch (error) {
    // Cart not found or expired
    return null
  }
}
