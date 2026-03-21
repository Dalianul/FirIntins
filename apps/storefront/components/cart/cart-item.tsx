"use client"

import { m } from "motion/react"
import { itemVariants } from "@/variants/drawer"
import { useCart } from "@/hooks/use-cart"
import { Button } from "@/components/ui/button"
import { CartItem as CartItemData } from "@/context/cart-context"
import { formatPrice } from "@/lib/utils"

interface CartItemProps {
  item: CartItemData
  index: number
}

export function CartItem({
  item,
  index,
}: CartItemProps) {
  const { removeItem, updateQuantity } = useCart()

  const handleIncreaseQuantity = () => {
    updateQuantity(item.id, item.quantity + 1)
  }

  const handleDecreaseQuantity = () => {
    if (item.quantity - 1 <= 0) {
      removeItem(item.id)
    } else {
      updateQuantity(item.id, item.quantity - 1)
    }
  }

  return (
    <m.div
      variants={itemVariants}
      custom={index}
      className="flex gap-4 py-4 border-b border-[--color-border] last:border-b-0"
    >
      {/* Product Image */}
      <div className="w-16 h-16 bg-[--color-bg-light] rounded flex-shrink-0 overflow-hidden">
        {/* Placeholder for thumbnail */}
        <div className="w-full h-full bg-[--color-cream] opacity-50" />
      </div>

      {/* Product Info */}
      <div className="flex-1 flex flex-col gap-2">
        <h3 className="text-sm font-medium text-[--color-white]">
          {item.product_title}
          {item.variant_title && (
            <span className="text-xs text-[--color-cream] block">
              {item.variant_title}
            </span>
          )}
        </h3>
        <p className="text-sm font-semibold text-[--color-moss]">
          {formatPrice(item.unit_price)}
        </p>

        {/* Quantity Controls */}
        <div className="flex items-center gap-2 mt-auto">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={handleDecreaseQuantity}
            className="h-6 w-6"
          >
            −
          </Button>
          <span className="text-sm font-medium text-[--color-white] w-8 text-center">
            {item.quantity}
          </span>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={handleIncreaseQuantity}
            className="h-6 w-6"
          >
            +
          </Button>
        </div>
      </div>

      {/* Remove Button */}
      <button
        onClick={() => removeItem(item.id)}
        className="text-xs text-[--color-cream] hover:text-[--color-moss] transition-colors self-start"
      >
        Șterge
      </button>
    </m.div>
  )
}
