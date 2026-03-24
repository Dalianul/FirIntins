"use client"

import Link from "next/link"
import { m, Variants } from "motion/react"

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.1, type: "spring", stiffness: 100 },
  }),
}

interface Category {
  id: string
  name: string
  handle: string
}

export function CategoriesSectionClient({ categories }: { categories: Category[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
      {categories.slice(0, 6).map((cat, i) => (
        <Link key={cat.id} href={`/categorii/${cat.handle}`}>
          <m.div
            custom={i}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
            className="p-6 bg-surface rounded border border-border hover:border-moss transition-colors cursor-pointer"
          >
            <h3 className="font-cormorant text-2xl text-white">
              {cat.name}
            </h3>
            <p className="text-fog text-sm mt-2">Explore</p>
          </m.div>
        </Link>
      ))}
    </div>
  )
}
