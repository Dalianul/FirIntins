"use client"

import React, { createContext, ReactNode, useEffect, useState } from "react"
import {
  addItemToCart,
  removeItemFromCart,
  updateCartQuantity,
  createCart,
  retrieveCart,
} from "@/actions/cart"

export interface CartItem {
  id: string
  variant_id: string
  product_title: string
  variant_title: string | null
  quantity: number
  unit_price: number
  total: number
}

export interface Cart {
  id: string
  items: CartItem[]
  subtotal: number
  total: number
}

export interface CartContextValue {
  cart: Cart | null
  itemCount: number
  addItem: (variantId: string, quantity: number) => Promise<void>
  removeItem: (lineItemId: string) => Promise<void>
  updateQuantity: (lineItemId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  loading: boolean
}

export const CartContext = createContext<CartContextValue | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(true)

  // Mount: restore cart from localStorage or create new
  useEffect(() => {
    async function initCart() {
      try {
        const storedCartId = localStorage.getItem("firintins_cart_id")

        if (storedCartId) {
          const existingCart = await retrieveCart(storedCartId)
          if (existingCart) {
            setCart(existingCart as unknown as Cart)
            setLoading(false)
            return
          }
        }

        // Cart not found or expired, create new
        const newCart = await createCart()
        const cartId = newCart.id
        localStorage.setItem("firintins_cart_id", cartId)
        setCart(newCart as unknown as Cart)
      } catch (error) {
        console.error("initCart error:", error)
      } finally {
        setLoading(false)
      }
    }

    initCart()
  }, [])

  const addItem = async (variantId: string, quantity: number) => {
    if (!cart) return
    try {
      const result = await addItemToCart(cart.id, variantId, quantity)
      if (result.success) {
        setCart(result.cart as unknown as Cart)
      }
    } catch (error) {
      console.error("addItem error:", error)
      // Recovery: recreate cart if 404
      if (error instanceof Error && error.message.includes("404")) {
        const newCart = await createCart()
        localStorage.setItem("firintins_cart_id", newCart.id)
        setCart(newCart as unknown as Cart)
        await addItemToCart(newCart.id, variantId, quantity)
      }
    }
  }

  const removeItem = async (lineItemId: string) => {
    if (!cart) return
    try {
      const result = await removeItemFromCart(cart.id, lineItemId)
      if (result.success) {
        setCart(result.cart as unknown as Cart)
      }
    } catch (error) {
      console.error("removeItem error:", error)
    }
  }

  const updateQuantity = async (lineItemId: string, quantity: number) => {
    if (!cart) return
    try {
      const result = await updateCartQuantity(cart.id, lineItemId, quantity)
      if (result.success) {
        setCart(result.cart as unknown as Cart)
      }
    } catch (error) {
      console.error("updateQuantity error:", error)
    }
  }

  const clearCart = async () => {
    if (!cart) return
    try {
      const newCart = await createCart()
      localStorage.setItem("firintins_cart_id", newCart.id)
      setCart(newCart as unknown as Cart)
    } catch (error) {
      console.error("clearCart error:", error)
    }
  }

  const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}
