import Link from "next/link"
import { m, Variants } from "motion/react"
import { getCategories } from "@/lib/medusa/queries"

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (i: number | unknown) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: typeof i === "number" ? i * 0.1 : 0, type: "spring", stiffness: 100 },
  }),
}

export async function CategoriesSection() {
  const categories = await getCategories()

  return (
    <section className="py-20 px-4">
      <h2 className="font-cormorant text-5xl text-cream mb-12 text-center">
        Categorii
      </h2>
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
    </section>
  )
}
