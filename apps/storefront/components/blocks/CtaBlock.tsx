"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { ArrowRight } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"

interface CtaBlockData {
  blockType: "cta"
  heading: string
  subheading?: string
  ctaLabel?: string
  ctaUrl?: string
  background?: "moss" | "mud" | "dark"
}

type BtnVariant = "brand" | "brandLight"

const variants: Record<
  "moss" | "mud" | "dark",
  {
    section: string
    eyebrow: string
    heading: string
    sub: string
    btnVariant: BtnVariant
  }
> = {
  moss: {
    section: "bg-moss",
    eyebrow: "text-[#ffffff]/60",
    heading: "text-[#ffffff]",
    sub: "text-[#ffffff]/75",
    btnVariant: "brandLight",
  },
  mud: {
    section: "bg-mud",
    eyebrow: "text-[#ffffff]/60",
    heading: "text-[#ffffff]",
    sub: "text-[#ffffff]/75",
    btnVariant: "brandLight",
  },
  dark: {
    section: "bg-surface border-y border-border",
    eyebrow: "text-moss",
    heading: "text-[#1c1a15]",
    sub: "text-fog",
    btnVariant: "brand",
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
              className={`group ${buttonVariants({ variant: v.btnVariant, size: "hero" })}`}
            >
              {ctaLabel}
              <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          )}
        </motion.div>
      </div>
    </section>
  )
}
