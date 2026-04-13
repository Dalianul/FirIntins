"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useCart } from "@/hooks/use-cart"
import { formatPrice } from "@/lib/utils"

export function CartSummary() {
  const { cart, itemCount } = useCart()

  if (!cart || itemCount === 0) {
    return null
  }

  const shippingTotal = cart.shipping_total ?? 0

  return (
    <div className="border-t border-border bg-surface-2 px-5 py-4 flex flex-col gap-3">
      {/* Totals */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-center">
          <span className="text-[12px] font-outfit text-fog/50 tracking-wide">Subtotal</span>
          <span className="text-[12px] font-outfit text-fog/70">{formatPrice(cart.subtotal)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[12px] font-outfit text-fog/50 tracking-wide">Transport</span>
          <span className="text-[12px] font-outfit text-fog/70">
            {shippingTotal === 0 ? "Gratuit" : formatPrice(shippingTotal)}
          </span>
        </div>
        <div className="flex justify-between items-center pt-2 mt-0.5 border-t border-border">
          <span className="text-[14px] font-outfit font-medium text-[#1c1a15]">Total</span>
          <span className="text-[17px] font-cormorant font-semibold text-[#1c1a15]">
            {formatPrice(cart.total ?? cart.subtotal)}
          </span>
        </div>
      </div>

      {/* Primary CTA — cart page */}
      <Link
        href="/cos"
        className="flex items-center justify-center w-full py-3 rounded-md bg-moss hover:bg-moss-light text-[#ffffff] text-[13px] font-outfit font-medium tracking-widest uppercase transition-colors duration-200"
      >
        Mergi la coș
      </Link>

      {/* Secondary CTA — checkout */}
      <Link
        href="/checkout"
        className="group flex items-center justify-center gap-1.5 w-full py-2 rounded-md border border-border text-fog/60 text-[12px] font-outfit tracking-wide hover:border-moss/30 hover:text-fog/90 hover:bg-moss/6 transition-all duration-200"
      >
        Finalizează comanda
        <ArrowRight
          size={11}
          className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200"
        />
      </Link>
    </div>
  )
}
