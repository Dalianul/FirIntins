import Link from "next/link"
import Image from "next/image"
import { m } from "motion/react"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils"

interface ProductCardProps {
  product: any
}

export function ProductCard({ product }: ProductCardProps) {
  const price = product.variants?.[0]?.prices?.[0]?.amount ?? 0
  const category = product.categories?.[0]?.name ?? "Altele"

  return (
    <Link href={`/produse/${product.handle}`}>
      <m.div
        whileHover={{ scale: 1.05 }}
        className="group rounded border border-border hover:border-moss transition-colors overflow-hidden bg-surface"
      >
        <div className="relative h-48 overflow-hidden bg-surface-2">
          <Image
            src={`https://picsum.photos/300/200?random=${product.id}`}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform"
          />
        </div>
        <div className="p-4">
          <Badge variant="outline" className="mb-2 text-xs">
            {category}
          </Badge>
          <h3 className="font-outfit font-500 text-cream text-sm line-clamp-2">
            {product.title}
          </h3>
          <p className="text-mud font-cormorant text-lg mt-2">
            {formatPrice(price)}
          </p>
        </div>
      </m.div>
    </Link>
  )
}
