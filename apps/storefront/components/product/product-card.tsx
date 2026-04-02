"use client"

import Link from "next/link"
import Image from "next/image"
import { m } from "motion/react"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils"
import { HeartButton } from "@/components/wishlist/heart-button"

interface ProductCardProps {
  product: unknown
}

export function ProductCard({ product }: ProductCardProps) {
  const prod = product as Record<string, unknown>

  const variants = prod.variants as Array<Record<string, unknown>> | null | undefined
  const firstVariant = variants?.[0] as Record<string, unknown> | undefined
  const calculatedPrice = firstVariant?.calculated_price as Record<string, unknown> | undefined
  const price = calculatedPrice?.calculated_amount as number | undefined ?? 0

  const categories = prod.categories as Array<Record<string, unknown>> | null | undefined
  const category = (categories?.[0] as Record<string, unknown> | undefined)?.name as string | null | undefined ?? "Altele"

  const id = prod.id as string
  const handle = prod.handle as string
  const title = prod.title as string

  const metadata = prod.metadata as Record<string, unknown> | null | undefined
  const discountPercentage = metadata?.discount_percentage as number | null | undefined

  return (
    <div className="relative group">
      <Link href={`/produse/${handle}`}>
        <m.div
          whileHover={{ scale: 1.05 }}
          className="group rounded border border-border hover:border-moss transition-colors overflow-hidden bg-surface"
        >
          <div className="relative h-48 overflow-hidden bg-surface-2">
            <Image
              src={`https://picsum.photos/300/200?random=${id}`}
              alt={title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover group-hover:scale-110 transition-transform"
            />
            {discountPercentage != null && discountPercentage > 0 && (
              <span className="absolute top-2 left-2 z-10 bg-destructive text-white text-xs font-bold px-2 py-0.5 rounded">
                −{discountPercentage}%
              </span>
            )}
          </div>
          <div className="p-4">
            <Badge variant="outline" className="mb-2 text-xs">
              {category}
            </Badge>
            <h3 className="font-outfit font-medium text-cream text-sm line-clamp-2">
              {title}
            </h3>
            <p className="text-mud font-cormorant text-lg mt-2">
              {formatPrice(price)}
            </p>
          </div>
        </m.div>
      </Link>
      <HeartButton
        productId={id}
        className="absolute top-2 right-2 z-10"
      />
    </div>
  )
}
