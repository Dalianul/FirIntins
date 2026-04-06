"use client"

import { motion } from "motion/react"
import {
  ShoppingCart, Truck, Package, Heart, Check, Star, Phone, Mail, Shield,
} from "lucide-react"

interface StepItem {
  title?: string
  description?: string
  icon?: string
}

interface StepsBlockData {
  blockType: "steps"
  heading?: string
  subheading?: string
  steps?: StepItem[]
  layout?: "horizontal" | "vertical"
}

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>> = {
  cart: ShoppingCart,
  truck: Truck,
  package: Package,
  heart: Heart,
  check: Check,
  star: Star,
  phone: Phone,
  email: Mail,
  shield: Shield,
}

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
}

const itemVariant = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export function StepsBlock({ block }: { block: StepsBlockData }) {
  const { heading, subheading, steps, layout = "horizontal" } = block
  if (!steps?.length) return null

  return (
    <section className="py-20 md:py-28 px-6 sm:px-10 bg-[--color-bg-light]">
      <div className="max-w-7xl mx-auto">
        {(heading || subheading) && (
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {heading && (
              <>
                <span className="block text-[--color-moss] text-xs font-outfit uppercase tracking-[0.25em] mb-3">
                  Cum funcționează
                </span>
                <h2 className="font-cormorant text-4xl md:text-5xl text-[--color-white] mb-4">
                  {heading}
                </h2>
              </>
            )}
            {subheading && (
              <p className="text-[--color-fog] font-outfit text-base max-w-xl mx-auto leading-relaxed">
                {subheading}
              </p>
            )}
          </motion.div>
        )}

        <motion.div
          className={
            layout === "horizontal"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative"
              : "flex flex-col gap-8 max-w-2xl mx-auto"
          }
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
        >
          {steps.map((step, i) => {
            const IconComponent = step.icon ? iconMap[step.icon] : null
            const isHorizontal = layout === "horizontal"

            return (
              <motion.div
                key={i}
                variants={itemVariant}
                className={`flex ${isHorizontal ? "flex-col items-center text-center" : "flex-row gap-6 items-start"} relative`}
              >
                {/* Step indicator */}
                <div className="relative flex-shrink-0">
                  <div className="w-14 h-14 rounded-full bg-[--color-surface] border border-[--color-moss]/30 hover:border-[--color-moss]/60 flex items-center justify-center transition-colors duration-300 group">
                    {IconComponent ? (
                      <IconComponent
                        size={22}
                        className="text-[--color-moss]"
                        strokeWidth={1.5}
                      />
                    ) : (
                      <span className="font-cormorant text-2xl text-[--color-moss] font-medium">
                        {i + 1}
                      </span>
                    )}
                  </div>

                  {/* Connector line (horizontal layout) */}
                  {isHorizontal && i < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-7 left-full w-full">
                      <div className="border-t border-dashed border-[--color-moss]/20 ml-2 mr-2" />
                    </div>
                  )}
                </div>

                <div className={isHorizontal ? "mt-5" : "flex-1 pt-1"}>
                  {step.title && (
                    <h3 className="font-cormorant text-xl text-[--color-white] mb-2 leading-snug">
                      {step.title}
                    </h3>
                  )}
                  {step.description && (
                    <p className="text-[--color-fog] text-sm font-outfit leading-relaxed">
                      {step.description}
                    </p>
                  )}
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
