"use client"

import { useWishlist } from "@/context/wishlist-context"
import { Heart } from "lucide-react"
import { useState } from "react"

interface HeartButtonProps {
  productId: string
  variantId?: string
  className?: string
}

export function HeartButton({ productId, variantId = "", className = "" }: HeartButtonProps) {
  const { isInWishlist, addItem, removeItem, wishlist } = useWishlist()
  const [busy, setBusy] = useState(false)

  const inWishlist = variantId
    ? isInWishlist(productId, variantId)
    : isInWishlist(productId)

  const wishlistItem = wishlist?.items.find(
    (item) => item.product_id === productId && (variantId === "" || item.variant_id === variantId)
  )

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (busy) return
    setBusy(true)
    try {
      if (inWishlist && wishlistItem) {
        await removeItem(wishlistItem.id)
      } else {
        await addItem(productId, variantId || undefined)
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={busy}
      aria-label={inWishlist ? "Șterge din lista de dorinte" : "Adaugă la lista de dorinte"}
      className={`p-1.5 rounded-full bg-bg/70 backdrop-blur-sm hover:bg-bg transition-colors disabled:opacity-50 ${className}`}
    >
      <Heart
        size={18}
        className={inWishlist ? "fill-mud stroke-mud" : "stroke-cream"}
      />
    </button>
  )
}
