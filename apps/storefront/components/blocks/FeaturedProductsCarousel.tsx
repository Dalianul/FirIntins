"use client"

import { useRef } from "react"
import { motion } from "motion/react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { ProductCard } from "@/components/product/product-card"

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
}

const cardVariant = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export function FeaturedProductsCarousel({ products }: { products: any[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return
    scrollRef.current.scrollBy({ left: dir === "right" ? 320 : -320, behavior: "smooth" })
  }

  return (
    <div className="relative">
      {/* Fade edges */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-r from-[--color-bg] to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-l from-[--color-bg] to-transparent" />

      {/* Scroll track */}
      <motion.div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
      >
        {products.map((product) => (
          <motion.div
            key={product.id}
            variants={cardVariant}
            className="w-72 flex-shrink-0 snap-start"
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </motion.div>

      {/* Nav arrows */}
      {products.length > 3 && (
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={() => scroll("left")}
            aria-label="Scroll left"
            className="w-10 h-10 border border-[--color-border] hover:border-[--color-moss]/50 flex items-center justify-center text-[--color-fog] hover:text-[--color-moss] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-moss] active:opacity-70 cursor-pointer"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => scroll("right")}
            aria-label="Scroll right"
            className="w-10 h-10 border border-[--color-border] hover:border-[--color-moss]/50 flex items-center justify-center text-[--color-fog] hover:text-[--color-moss] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-moss] active:opacity-70 cursor-pointer"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  )
}
