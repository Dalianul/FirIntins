"use client"

import { motion } from "motion/react"
import { Fish, Anchor, Sailboat, Award, ShieldCheck, Truck, Leaf } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface FeatureItem {
  title?: string
  description?: string
  icon?: string
}

interface FeaturesGridBlockData {
  blockType: "featuresGrid"
  heading?: string
  items?: FeatureItem[]
}

const ICONS: Record<string, LucideIcon> = {
  fish: Fish,
  hook: Anchor,
  rod: Anchor,
  boat: Sailboat,
  star: Award,
  shield: ShieldCheck,
  truck: Truck,
  leaf: Leaf,
  award: Award,
}

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
}

const cardVariant = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export function FeaturesGridBlock({ block }: { block: FeaturesGridBlockData }) {
  const { heading, items } = block
  if (!items?.length) return null

  return (
    <section className="py-20 md:py-28 px-6 sm:px-10 bg-[--color-bg-light]">
      <div className="max-w-7xl mx-auto">
        {heading && (
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <span className="block text-[--color-moss] text-xs font-outfit uppercase tracking-[0.25em] mb-3">
              De ce FirIntins
            </span>
            <h2 className="font-cormorant text-4xl md:text-5xl text-[--color-white]">{heading}</h2>
          </motion.div>
        )}

        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[--color-border]"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
        >
          {items.map((item, i) => {
            const Icon = ICONS[item.icon ?? ""]
            return (
              <motion.div
                key={i}
                variants={cardVariant}
                className="group bg-[--color-bg-light] hover:bg-[--color-surface] px-6 py-10 text-center transition-colors duration-300"
              >
                <div className="flex justify-center mb-5">
                  <div className="w-14 h-14 rounded-full border border-[--color-border] group-hover:border-[--color-moss]/40 flex items-center justify-center transition-colors duration-300">
                    {Icon ? (
                      <Icon
                        size={22}
                        className="text-[--color-moss] group-hover:text-[--color-moss-light] transition-colors duration-300"
                        strokeWidth={1.5}
                      />
                    ) : (
                      <span className="font-cormorant text-xl text-[--color-moss]">{i + 1}</span>
                    )}
                  </div>
                </div>
                <h3 className="font-outfit font-semibold text-[--color-white] text-sm uppercase tracking-[0.1em] mb-2">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="text-[--color-fog] text-sm leading-relaxed">{item.description}</p>
                )}
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
