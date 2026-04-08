"use client"

import { m, AnimatePresence } from "motion/react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { drawerVariants } from "@/variants/drawer"
import { CartItem } from "./cart-item"
import { CartSummary } from "./cart-summary"
import { useCart } from "@/hooks/use-cart"

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cart, itemCount, loading } = useCart()

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="[background:var(--color-bg-light)] border-[--color-border] max-w-md p-0 flex flex-col">
        <SheetHeader className="px-5 py-4 border-b border-[--color-border] flex-shrink-0">
          <div className="flex items-baseline gap-1.5">
            <SheetTitle className="text-[16px] font-cormorant font-semibold text-[--color-white]">
              Coșul tău
            </SheetTitle>
            {itemCount > 0 && (
              <span className="text-[11px] font-outfit text-[--color-fog]/40 tracking-widest">
                · {itemCount} {itemCount === 1 ? "produs" : "produse"}
              </span>
            )}
          </div>
        </SheetHeader>

        {/* Items */}
        <div className="flex-1 overflow-y-auto py-1">
          {loading ? (
            <div className="text-center py-8 text-[13px] font-outfit text-[--color-fog]/50">
              Se încarcă...
            </div>
          ) : !cart || itemCount === 0 ? (
            <div className="text-center py-12 text-[13px] font-outfit text-[--color-fog]/50">
              Coșul tău este gol
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              <m.div
                variants={drawerVariants}
                initial="hidden"
                animate="visible"
              >
                {cart.items.map((item, index) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    index={index}
                  />
                ))}
              </m.div>
            </AnimatePresence>
          )}
        </div>

        {/* Footer */}
        {!loading && cart && itemCount > 0 && (
          <CartSummary onClose={onClose} />
        )}
      </SheetContent>
    </Sheet>
  )
}
