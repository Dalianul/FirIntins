"use client"

import { useState } from "react"
import { VariantSelector } from "@/components/product/variant-selector"
import { AddToCartButton } from "@/components/product/add-to-cart-button"

interface Variant {
  id: string
  title?: string
  inventory_quantity?: number
  prices?: Array<{ amount?: number }>
}

interface ProductActionsProps {
  productId: string
  variants: Variant[]
}

export function ProductActions({ productId, variants }: ProductActionsProps) {
  const initialVariant =
    variants.find((v) => (v.inventory_quantity ?? 1) > 0) || variants[0]
  const [selectedVariant, setSelectedVariant] = useState(initialVariant)
  const outOfStock = variants.every((v) => (v.inventory_quantity ?? 1) === 0)

  return (
    <>
      <VariantSelector variants={variants} onSelect={setSelectedVariant} />
      <AddToCartButton
        productId={productId}
        variant={selectedVariant}
        outOfStock={outOfStock}
      />
    </>
  )
}
