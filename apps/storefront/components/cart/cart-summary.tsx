"use client"

import Link from "next/link"
import { useCart } from "@/hooks/use-cart"
import { Button } from "@/components/ui/button"

export function CartSummary() {
  const { cart, itemCount, loading } = useCart()

  if (!cart || itemCount === 0) {
    return null
  }

  const formatPrice = (price: number) => {
    return (price / 100).toLocaleString("ro-RO", {
      minimumFractionDigits: 2,
    }) + " lei"
  }

  return (
    <div className="border-t border-[--color-border] pt-4">
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-[--color-cream]">Subtotal</span>
        <span className="text-lg font-semibold text-[--color-white]">
          {formatPrice(cart.subtotal)}
        </span>
      </div>

      <Link href="/cos" className="block w-full">
        <Button
          disabled={loading}
          className="w-full bg-[--color-moss] hover:bg-[--color-moss]/90 text-[--color-white]"
        >
          {loading ? "Se încarcă..." : "Mergi la coș"}
        </Button>
      </Link>
    </div>
  )
}
