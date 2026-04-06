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
      <SheetContent side="right" className="bg-[--color-bg-light] border-[--color-border] max-w-md px-5">
        <SheetHeader>
          <SheetTitle className="text-[--color-white]">
            Coș de cumpărături
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {/* Content */}
          <div className="flex-1 overflow-y-auto py-4">
            {loading ? (
              <div className="text-center py-8 text-[--color-cream]">
                Se încarcă...
              </div>
            ) : !cart || itemCount === 0 ? (
              <div className="text-center py-8 text-[--color-cream]">
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

          {/* Summary at bottom */}
          {!loading && cart && itemCount > 0 && (
            <CartSummary />
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
