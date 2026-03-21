"use server"

import { medusa } from "@/lib/medusa/client"
import type { AddressInput } from "@/lib/schema/checkout"

export async function updateAddressAction(cartId: string, input: AddressInput) {
  try {
    await medusa.store.cart.update(cartId, {
      shipping_address: {
        first_name: input.firstName,
        last_name: input.lastName,
        address_1: input.address1,
        city: input.city,
        postal_code: input.postalCode,
        country_code: input.countryCode,
        phone: input.phone,
      },
    })
    return { success: true }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "A apărut o eroare"
    return { success: false, error: message }
  }
}

export async function selectShippingAction(cartId: string, shippingOptionId: string) {
  try {
    await medusa.store.cart.addShippingMethod(cartId, { option_id: shippingOptionId })
    return { success: true }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "A apărut o eroare"
    return { success: false, error: message }
  }
}

export async function initiatePaymentAction(cartId: string) {
  try {
    const { cart } = await medusa.store.cart.retrieve(cartId)
    await medusa.store.payment.initiatePaymentSession(cart, {
      provider_id: "pp_stripe_stripe",
    })
    // Retrieve cart again to get the updated payment collection
    const { cart: updatedCart } = await medusa.store.cart.retrieve(cartId)
    const paymentSession = updatedCart?.payment_collection?.payment_sessions?.[0]
    const clientSecret = (paymentSession?.data as Record<string, unknown>)?.client_secret as string
    return { success: true, clientSecret }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "A apărut o eroare"
    return { success: false, error: message, clientSecret: "" }
  }
}

export async function completeCheckoutAction(cartId: string) {
  try {
    const result = await medusa.store.cart.complete(cartId)
    const order = (result as { order?: { id: string } }).order
    return { success: true, orderId: order?.id ?? "" }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "A apărut o eroare"
    return { success: false, error: message, orderId: "" }
  }
}
