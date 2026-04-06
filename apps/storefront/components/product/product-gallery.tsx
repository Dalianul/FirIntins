"use client"
import { useState } from "react"
import Image from "next/image"
import { m } from "motion/react"

interface ProductImage {
  url: string
}

interface ProductGalleryProps {
  product: {
    id: string
    title: string
    images?: ProductImage[]
  }
}

export function ProductGallery({ product }: ProductGalleryProps) {
  const images = product.images || []
  const [activeIndex, setActiveIndex] = useState(0)
  const mainImage = images[activeIndex] || { url: "" }

  return (
    <div className="space-y-4">
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative h-96 bg-surface-2 rounded overflow-hidden"
      >
        <Image
          src={mainImage.url || `https://picsum.photos/600/600?random=${product.id}`}
          alt={product.title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
          priority
        />
      </m.div>
      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((image, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`relative h-20 w-20 rounded overflow-hidden border-2 transition-colors ${
                activeIndex === i ? "border-moss" : "border-border"
              }`}
            >
              <Image
                src={image.url || `https://picsum.photos/100/100?random=${i}`}
                alt={`Thumbnail ${i}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
