"use server"

import { medusa } from "@/lib/medusa/client"

export async function addItemToCart(
  cartId: string,
  variantId: string,
  quantity: number
) {
  try {
    const { cart } = await medusa.store.cart.createLineItem(cartId, {
      variant_id: variantId,
      quantity,
    })
    return { success: true, cart }
  } catch (error) {
    console.error("addItemToCart error:", error)
    throw error
  }
}

export async function removeItemFromCart(cartId: string, lineItemId: string) {
  try {
    const response = await medusa.store.cart.deleteLineItem(cartId, lineItemId)
    // deleteLineItem returns StoreLineItemDeleteResponse with parent as the cart
    const cart = response.parent
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
    const { cart } = await medusa.store.cart.updateLineItem(cartId, lineItemId, {
      quantity,
    })
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
    const { cart } = await medusa.store.cart.retrieve(cartId)
    return cart
  } catch (error) {
    // Cart not found or expired
    return null
  }
}
