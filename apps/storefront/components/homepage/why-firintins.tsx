"use client"

import { m, Variants } from "motion/react"

const features = [
  {
    title: "Calitate premium",
    description: "Fiecare produs este ales cu grijă de echipa noastră de experți.",
  },
  {
    title: "Livrare rapidă în România",
    description: "Expediere în 24h pe întreg teritoriul țării.",
  },
  {
    title: "Suport expert",
    description: "Echipa noastră este aici pentru a te ajuta oricând.",
  },
]

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, type: "spring", stiffness: 100 },
  }),
}

export function WhyFirIntins() {
  return (
    <section className="py-20 px-4">
      <h2 className="font-cormorant text-5xl text-cream mb-12 text-center">
        De ce FirIntins
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
        {features.map((feature, i) => (
          <m.div
            key={i}
            custom={i}
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-moss rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-white text-2xl">✓</span>
            </div>
            <h3 className="font-cormorant text-2xl text-white mb-2">
              {feature.title}
            </h3>
            <p className="text-fog">{feature.description}</p>
          </m.div>
        ))}
      </div>
    </section>
  )
}
