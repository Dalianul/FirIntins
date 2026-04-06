"use client"

import Image from "next/image"
import { m } from "motion/react"
import { X, Minus, Plus } from "lucide-react"
import { useCart } from "@/hooks/use-cart"
import { CartItem as CartItemData } from "@/context/cart-context"
import { formatPrice } from "@/lib/utils"

interface CartItemProps {
  item: CartItemData
  index: number
}

export function CartItem({ item, index }: CartItemProps) {
  const { removeItem, updateQuantity } = useCart()

  const handleIncrease = () => updateQuantity(item.id, item.quantity + 1)
  const handleDecrease = () => {
    if (item.quantity - 1 <= 0) {
      removeItem(item.id)
    } else {
      updateQuantity(item.id, item.quantity - 1)
    }
  }

  return (
    <m.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className="flex gap-3 py-4 border-b border-[--color-border] last:border-b-0"
    >
      {/* Thumbnail */}
      <div className="w-16 h-16 bg-[--color-surface] flex-shrink-0 overflow-hidden">
        {item.thumbnail ? (
          <Image
            src={item.thumbnail}
            alt={item.product_title}
            width={64}
            height={64}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="w-full h-full bg-[--color-surface]" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <h3 className="text-sm font-outfit font-medium text-[--color-white] leading-snug line-clamp-2">
          {item.product_title}
        </h3>
        {item.variant_title && (
          <span className="text-[10px] font-outfit text-[--color-fog]">
            {item.variant_title}
          </span>
        )}
        <p className="text-sm font-outfit font-semibold text-[--color-moss] mt-auto">
          {formatPrice(item.unit_price)}
        </p>

        {/* Quantity controls */}
        <div className="flex items-center gap-2 mt-1">
          <button
            onClick={handleDecrease}
            aria-label="Scade cantitate"
            className="w-6 h-6 border border-[--color-border] hover:border-[--color-moss]/50 flex items-center justify-center text-[--color-fog] hover:text-[--color-moss] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[--color-moss]"
          >
            <Minus size={11} />
          </button>
          <span className="text-sm font-outfit font-medium text-[--color-white] w-6 text-center tabular-nums">
            {item.quantity}
          </span>
          <button
            onClick={handleIncrease}
            aria-label="Crește cantitate"
            className="w-6 h-6 border border-[--color-border] hover:border-[--color-moss]/50 flex items-center justify-center text-[--color-fog] hover:text-[--color-moss] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[--color-moss]"
          >
            <Plus size={11} />
          </button>
        </div>
      </div>

      {/* Remove button */}
      <button
        onClick={() => removeItem(item.id)}
        aria-label="Șterge din coș"
        className="flex-shrink-0 w-7 h-7 flex items-center justify-center text-[--color-fog]/50 hover:text-[--color-moss] transition-colors duration-200 self-start mt-0.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[--color-moss]"
      >
        <X size={14} />
      </button>
    </m.div>
  )
}
