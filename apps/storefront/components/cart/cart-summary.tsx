"use client"

import Link from "next/link"
import { Tag } from "lucide-react"
import { useCart } from "@/hooks/use-cart"
import { formatPrice } from "@/lib/utils"

interface CartSummaryProps {
  onClose: () => void
}

export function CartSummary({ onClose }: CartSummaryProps) {
  const { cart, itemCount } = useCart()

  if (!cart || itemCount === 0) {
    return null
  }

  const shippingTotal = cart.shipping_total ?? 0

  return (
    <div className="border-t border-[--color-border] bg-[rgba(22,20,16,0.5)] px-5 py-4 flex flex-col gap-3">
      {/* Promo code row (placeholder) */}
      <button
        type="button"
        className="flex items-center gap-2 w-full bg-[--color-surface]/40 border border-[--color-border] rounded-md px-3 py-2 hover:border-[rgba(74,94,58,0.3)] transition-colors duration-150 text-left"
      >
        <Tag size={12} className="text-[--color-fog]/40 flex-shrink-0" />
        <span className="text-[11px] font-outfit text-[--color-fog]/40 tracking-wide">
          Adaugă cod promoțional
        </span>
      </button>

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

      {/* CTA */}
      <Link
        href="/checkout"
        className="flex items-center justify-center gap-2 w-full py-3 rounded-md border border-[rgba(74,94,58,0.4)] [background:linear-gradient(135deg,rgba(74,94,58,0.25)_0%,rgba(107,138,82,0.2)_100%)] shadow-[0_2px_12px_rgba(74,94,58,0.15),inset_0_1px_0_rgba(255,255,255,0.04)] text-[--color-white] text-[13px] font-outfit font-medium tracking-widest uppercase hover:border-[rgba(74,94,58,0.6)] hover:[background:linear-gradient(135deg,rgba(74,94,58,0.4)_0%,rgba(107,138,82,0.3)_100%)] hover:shadow-[0_4px_20px_rgba(74,94,58,0.2),inset_0_1px_0_rgba(255,255,255,0.06)] transition-all duration-200"
      >
        Finalizează comanda
      </Link>

      {/* Continue shopping */}
      <button
        type="button"
        onClick={onClose}
        className="text-center text-[11px] font-outfit text-[--color-fog]/35 tracking-wide hover:text-[--color-fog]/60 transition-colors duration-150"
      >
        sau continuă cumpărăturile
      </button>
    </div>
  )
}
