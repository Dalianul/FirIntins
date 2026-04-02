"use client"

import Link from "next/link"
import { AnimatePresence, m } from "motion/react"
import { useCart } from "@/hooks/use-cart"
import { CartItem } from "@/components/cart/cart-item"
import { formatPrice } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function CartPageContent() {
  const { cart, itemCount, loading } = useCart()

  if (loading) {
    return (
      <div className="text-center py-16 text-fog">
        Se încarcă coșul...
      </div>
    )
  }

  if (!cart || itemCount === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-fog mb-6">Coșul tău este gol.</p>
        <Link href="/produse">
          <Button className="bg-moss hover:bg-moss-light text-white">
            Continuă cumpărăturile
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <AnimatePresence mode="popLayout">
          <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {cart.items.map((item, index) => (
              <CartItem key={item.id} item={item} index={index} />
            ))}
          </m.div>
        </AnimatePresence>
      </div>

      <div className="lg:col-span-1">
        <div className="bg-surface rounded p-6 space-y-4">
          <h2 className="font-cormorant text-2xl text-cream">Sumar comandă</h2>
          <div className="flex justify-between text-sm">
            <span className="text-fog">Subtotal</span>
            <span className="text-cream font-medium">{formatPrice(cart.subtotal)}</span>
          </div>
          {(cart.discount_total ?? 0) > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-fog">Reducere</span>
              <span className="text-moss">−{formatPrice(cart.discount_total!)}</span>
            </div>
          )}
          <div className="border-t border-border pt-4 flex justify-between">
            <span className="text-cream font-medium">Total</span>
            <span className="text-mud font-cormorant text-xl">{formatPrice(cart.total)}</span>
          </div>
          <Link href="/checkout" className="block">
            <Button className="w-full bg-moss hover:bg-moss-light text-white py-6 text-lg">
              Finalizează comanda
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
