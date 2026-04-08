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

  const imgSrc = item.thumbnail ?? `https://picsum.photos/64/64?random=${item.product_id ?? item.id}`

  return (
    <m.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.2, delay: index * 0.04 }}
      className="group flex gap-3 px-5 py-3.5 relative after:absolute after:bottom-0 after:left-5 after:right-5 after:h-px after:bg-[--color-border] last:after:hidden hover:bg-[rgba(74,94,58,0.04)] transition-colors duration-150"
    >
      {/* Thumbnail + qty badge */}
      <div className="relative flex-shrink-0">
        <div className="w-[60px] h-[60px] bg-[--color-surface] border border-[--color-border] rounded-md overflow-hidden">
          <Image
            src={imgSrc}
            alt={item.product_title}
            width={60}
            height={60}
            className="object-cover w-full h-full"
          />
        </div>
        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[--color-moss] text-white text-[9px] font-bold rounded-full flex items-center justify-center border-[1.5px] border-[--color-bg-light]">
          {item.quantity}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        <h3 className="text-[13px] font-outfit font-medium text-[--color-white] leading-snug truncate">
          {item.product_title}
        </h3>
        {item.variant_title && (
          <span className="text-[10px] font-outfit text-[--color-fog]/40">
            {item.variant_title}
          </span>
        )}

        {/* Price + qty controls */}
        <div className="flex items-center justify-between mt-0.5">
          <span className="text-[13px] font-outfit font-semibold text-[--color-moss-light,#6b8a52]">
            {formatPrice(item.unit_price)}
          </span>

          {/* Pill qty control */}
          <div className="flex items-center bg-[--color-surface] border border-[--color-border] rounded overflow-hidden">
            <button
              onClick={handleDecrease}
              aria-label="Scade cantitate"
              className="w-[26px] h-[24px] flex items-center justify-center text-[--color-fog]/60 hover:bg-[rgba(74,94,58,0.15)] hover:text-[--color-moss] transition-colors duration-150 focus-visible:outline-none"
            >
              <Minus size={10} />
            </button>
            <span className="text-[12px] font-outfit font-semibold text-[--color-white] px-1.5 border-x border-[--color-border] tabular-nums select-none">
              {item.quantity}
            </span>
            <button
              onClick={handleIncrease}
              aria-label="Crește cantitate"
              className="w-[26px] h-[24px] flex items-center justify-center text-[--color-fog]/60 hover:bg-[rgba(74,94,58,0.15)] hover:text-[--color-moss] transition-colors duration-150 focus-visible:outline-none"
            >
              <Plus size={10} />
            </button>
          </div>
        </div>
      </div>

      {/* Remove button — fades in on row hover */}
      <button
        onClick={() => removeItem(item.id)}
        aria-label="Șterge din coș"
        className="absolute top-3.5 right-4 w-6 h-6 flex items-center justify-center rounded text-[--color-fog]/30 opacity-0 group-hover:opacity-100 hover:bg-[rgba(196,191,176,0.08)] hover:text-[--color-fog]/70 transition-all duration-150 focus-visible:outline-none focus-visible:opacity-100"
      >
        <X size={12} />
      </button>
    </m.div>
  )
}
