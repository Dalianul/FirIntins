"use client"
import { useState } from "react"
import { formatPrice } from "@/lib/utils"

interface Variant {
  id: string
  title?: string
  inventory_quantity?: number
  prices?: Array<{ amount?: number }>
}

interface VariantSelectorProps {
  variants: Variant[]
  onSelect: (variant: Variant) => void
}

export function VariantSelector({ variants, onSelect }: VariantSelectorProps) {
  const [selectedId, setSelectedId] = useState(
    variants.find((v) => (v.inventory_quantity ?? 1) > 0)?.id || variants[0]?.id
  )
  const selectedVariant = variants.find((v) => v.id === selectedId)

  const handleSelect = (variant: Variant) => {
    setSelectedId(variant.id)
    onSelect(variant)
  }

  return (
    <div className="space-y-4">
      <h3 className="font-outfit font-500 text-cream">Variante</h3>
      <div className="flex flex-wrap gap-2">
        {variants.map((variant) => {
          const title = variant.title || "Standard"
          const isSelected = variant.id === selectedId
          const outOfStock = (variant.inventory_quantity ?? 1) === 0

          return (
            <button
              key={variant.id}
              onClick={() => handleSelect(variant)}
              disabled={outOfStock}
              className={`px-4 py-2 rounded border transition-colors ${
                isSelected
                  ? "bg-moss border-moss text-white"
                  : outOfStock
                    ? "border-border bg-surface-2 text-fog cursor-not-allowed opacity-50"
                    : "border-border bg-surface hover:border-moss text-cream"
              }`}
            >
              {title}
            </button>
          )
        })}
      </div>
      {selectedVariant && (
        <div>
          <p className="text-mud font-cormorant text-2xl">
            {formatPrice(selectedVariant.prices?.[0]?.amount ?? 0)}
          </p>
          {(selectedVariant.inventory_quantity ?? 1) === 0 && (
            <p className="text-red-500 text-sm mt-2">Stoc epuizat</p>
          )}
        </div>
      )}
    </div>
  )
}
