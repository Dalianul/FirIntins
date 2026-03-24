"use client"

import Link from "next/link"
import { m, Variants } from "motion/react"
import { Button } from "@/components/ui/button"

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0 },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
}

export function Hero() {
  return (
    <section className="relative h-screen w-full overflow-hidden bg-[url('https://picsum.photos/1400/800?random=1')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black/50" />
      <m.div
        className="relative flex h-full flex-col items-center justify-center px-4 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <m.h1
          variants={itemVariants}
          className="font-cormorant text-6xl font-light text-white md:text-8xl"
        >
          FirIntins Premium
        </m.h1>
        <m.p variants={itemVariants} className="mt-4 text-lg text-gray-200">
          Echipamente de pescuit la crap, alese cu grijă pentru pescarii
          adevărați
        </m.p>
        <m.div
          variants={itemVariants}
          className="mt-8 flex gap-4 flex-col sm:flex-row"
        >
          <Link href="/produse">
            <Button size="lg" className="bg-moss hover:bg-moss-light">
              Explorează produsele
            </Button>
          </Link>
          <Link href="/categorii/lansete">
            <Button
              size="lg"
              variant="outline"
              className="border-cream text-cream hover:bg-cream hover:text-black"
            >
              Categorii
            </Button>
          </Link>
        </m.div>
      </m.div>
    </section>
  )
}
