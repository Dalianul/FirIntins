"use client"

import Image from "next/image"
import { formatPrice } from "@/lib/utils"
import type { Cart, CartItem } from "@/context/cart-context"
import { PromoCodeInput } from "@/components/checkout/promo-code-input"

interface OrderSummaryProps {
  cart: Cart | null
}

export function OrderSummary({ cart }: OrderSummaryProps) {
  if (!cart) return null
  const items = cart.items ?? []
  const subtotal = cart.subtotal ?? 0
  const shippingTotal = cart.shipping_total ?? 0
  const discountTotal = cart.discount_total ?? 0
  const total = cart.total ?? 0

  return (
    <div className="bg-surface-2 rounded p-6 space-y-4">
      <h3 className="font-outfit font-medium text-cream text-lg">Comandă</h3>
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {items.map((item: CartItem) => (
          <div key={item.id} className="flex gap-3 text-sm">
            <div className="relative h-16 w-16 bg-surface rounded overflow-hidden">
              <Image
                src={`https://picsum.photos/100/100?random=${item.variant_id}`}
                alt={item.product_title}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <p className="text-cream font-outfit">{item.product_title}</p>
              <p className="text-fog text-xs">{item.quantity}x</p>
            </div>
            <p className="text-mud">{formatPrice(item.total)}</p>
          </div>
        ))}
      </div>
      <div className="border-t border-border pt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-fog">Subtotal</span>
          <span className="text-cream">{formatPrice(subtotal)}</span>
        </div>
        {discountTotal > 0 && (
          <div className="flex justify-between">
            <span className="text-moss">Reducere</span>
            <span className="text-moss">−{formatPrice(discountTotal)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-fog">Livrare</span>
          <span className="text-cream">{formatPrice(shippingTotal)}</span>
        </div>
      </div>
      <div className="border-t border-border pt-4 flex justify-between text-lg">
        <span className="font-outfit font-medium text-cream">Total</span>
        <span className="text-mud">{formatPrice(total)}</span>
      </div>
      <div className="border-t border-border pt-4">
        <p className="text-fog text-xs mb-2">Cod promoțional</p>
        <PromoCodeInput />
      </div>
    </div>
  )
}
