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
    <div className="border-t border-[--color-border] bg-[rgba(22,20,16,0.5)] px-5 py-4 flex flex-col gap-3">
      {/* Totals */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-center">
          <span className="text-[12px] font-outfit text-[--color-fog]/50 tracking-wide">Subtotal</span>
          <span className="text-[12px] font-outfit text-[--color-fog]/70">{formatPrice(cart.subtotal)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[12px] font-outfit text-[--color-fog]/50 tracking-wide">Transport</span>
          <span className="text-[12px] font-outfit text-[--color-fog]/70">
            {shippingTotal === 0 ? "Gratuit" : formatPrice(shippingTotal)}
          </span>
        </div>
        <div className="flex justify-between items-center pt-2 mt-0.5 border-t border-[--color-border]">
          <span className="text-[14px] font-outfit font-medium text-[--color-white]">Total</span>
          <span className="text-[17px] font-cormorant font-semibold text-[--color-white]">
            {formatPrice(cart.total ?? cart.subtotal)}
          </span>
        </div>
      </div>

      {/* Primary CTA — cart page */}
      <Link
        href="/cos"
        className="flex items-center justify-center w-full py-3 rounded-md border border-[rgba(74,94,58,0.4)] [background:linear-gradient(135deg,rgba(74,94,58,0.25)_0%,rgba(107,138,82,0.2)_100%)] shadow-[0_2px_12px_rgba(74,94,58,0.15),inset_0_1px_0_rgba(255,255,255,0.04)] text-[--color-white] text-[13px] font-outfit font-medium tracking-widest uppercase hover:border-[rgba(74,94,58,0.6)] hover:[background:linear-gradient(135deg,rgba(74,94,58,0.4)_0%,rgba(107,138,82,0.3)_100%)] hover:shadow-[0_4px_20px_rgba(74,94,58,0.2),inset_0_1px_0_rgba(255,255,255,0.06)] transition-all duration-200"
      >
        Mergi la coș
      </Link>

      {/* Secondary CTA — checkout */}
      <Link
        href="/checkout"
        className="group flex items-center justify-center gap-1.5 w-full py-2 rounded-md border border-[--color-border] text-[--color-fog]/60 text-[12px] font-outfit tracking-wide hover:border-[rgba(74,94,58,0.3)] hover:text-[--color-fog]/90 hover:bg-[rgba(74,94,58,0.06)] transition-all duration-200"
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
