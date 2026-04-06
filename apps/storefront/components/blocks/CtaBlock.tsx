"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { ArrowRight } from "lucide-react"

interface CtaBlockData {
  blockType: "cta"
  heading: string
  subheading?: string
  ctaLabel?: string
  ctaUrl?: string
  background?: "moss" | "mud" | "dark"
}

const variants = {
  moss: {
    section: "bg-[--color-moss]",
    eyebrow: "text-white/60",
    heading: "text-white",
    sub: "text-white/75",
    btn: "bg-white text-[--color-moss] hover:bg-white/90",
  },
  mud: {
    section: "bg-[--color-mud]",
    eyebrow: "text-white/60",
    heading: "text-white",
    sub: "text-white/75",
    btn: "bg-white text-[--color-mud] hover:bg-white/90",
  },
  dark: {
    section: "bg-[--color-surface] border-y border-[--color-border]",
    eyebrow: "text-[--color-moss]",
    heading: "text-[--color-white]",
    sub: "text-[--color-fog]",
    btn: "bg-[--color-moss] text-white hover:bg-[--color-moss-light]",
  },
}

export function CtaBlock({ block }: { block: CtaBlockData }) {
  const { heading, subheading, ctaLabel, ctaUrl, background = "dark" } = block
  const v = variants[background] ?? variants.dark

  return (
    <section className={`py-20 md:py-28 px-6 sm:px-10 ${v.section}`}>
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <span className={`block text-xs font-outfit uppercase tracking-[0.25em] mb-4 ${v.eyebrow}`}>
            Acționează acum
          </span>
          <h2 className={`font-cormorant text-4xl md:text-5xl mb-5 ${v.heading}`}>{heading}</h2>
          {subheading && (
            <p className={`font-outfit text-base md:text-lg mb-10 max-w-xl mx-auto leading-relaxed ${v.sub}`}>
              {subheading}
            </p>
          )}
          {ctaLabel && ctaUrl && (
            <Link
              href={ctaUrl}
              className={`group inline-flex items-center gap-3 px-8 py-4 font-outfit text-sm uppercase tracking-[0.12em] transition-colors duration-300 ${v.btn}`}
            >
              {ctaLabel}
              <ArrowRight
                size={15}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          )}
        </motion.div>
      </div>
    </section>
  )
}
