"use client"

import React, { createContext, ReactNode, useContext, useEffect, useState } from "react"
import { getWishlistAction, addToWishlistAction, removeFromWishlistAction } from "@/actions/wishlist"

export interface WishlistItem {
  id: string
  product_id: string
  variant_id: string
}

export interface Wishlist {
  id: string
  items: WishlistItem[]
}

export interface WishlistContextValue {
  wishlist: Wishlist | null
  itemCount: number
  isInWishlist: (productId: string, variantId?: string) => boolean
  addItem: (productId: string, variantId?: string) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  loading: boolean
  error: string | null
  clearError: () => void
}

export const WishlistContext = createContext<WishlistContextValue | undefined>(undefined)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<Wishlist | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function init() {
      try {
        const data = await getWishlistAction()
        setWishlist(data.wishlist)
      } catch {
        setError("Nu am putut încărca lista de dorinte.")
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const isInWishlist = (productId: string, variantId?: string) => {
    if (variantId === undefined) {
      return wishlist?.items.some((item) => item.product_id === productId) ?? false
    }
    return (
      wishlist?.items.some(
        (item) => item.product_id === productId && item.variant_id === variantId
      ) ?? false
    )
  }

  const addItem = async (productId: string, variantId?: string) => {
    setError(null)
    const result = await addToWishlistAction({ product_id: productId, variant_id: variantId })
    if (result.success && result.item) {
      setWishlist((prev) => {
        if (!prev) return { id: "", items: [result.item] }
        return { ...prev, items: [...prev.items, result.item] }
      })
    } else {
      setError(result.error ?? "Eroare la adăugare")
    }
  }

  const removeItem = async (itemId: string) => {
    setError(null)
    const prevWishlist = wishlist
    setWishlist((prev) =>
      prev ? { ...prev, items: prev.items.filter((i) => i.id !== itemId) } : null
    )

    const result = await removeFromWishlistAction(itemId)
    if (!result.success) {
      setWishlist(prevWishlist)
      setError(result.error ?? "Eroare la ștergere")
    }
  }

  const clearError = () => setError(null)

  const itemCount = wishlist?.items.length ?? 0

  return (
    <WishlistContext.Provider
      value={{ wishlist, itemCount, isInWishlist, addItem, removeItem, loading, error, clearError }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error("useWishlist must be used inside WishlistProvider")
  return ctx
}
