"use client"

import { m } from "motion/react"
import { ProductCard } from "@/components/product/product-card"

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

interface Props {
  products: unknown[]
}

export function ProductGridAnimated({ products }: Props) {
  return (
    <m.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
    >
      {products.map((product) => {
        const prod = product as { id: string }
        return (
          <m.div key={prod.id} variants={item}>
            <ProductCard product={product} />
          </m.div>
        )
      })}
    </m.div>
  )
}
