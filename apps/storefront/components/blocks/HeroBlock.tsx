"use client"

import Image from "next/image"
import Link from "next/link"
import { motion, useReducedMotion } from "motion/react"
import { ArrowRight } from "lucide-react"

interface HeroBlockData {
  blockType: "hero"
  heading: string
  subheading?: string
  backgroundImage?: { url: string } | null
  ctaLabel?: string
  ctaUrl?: string
  overlay?: "none" | "dark" | "light"
}

export function HeroBlock({ block }: { block: HeroBlockData }) {
  const { heading, subheading, backgroundImage, ctaLabel, ctaUrl, overlay } = block
  const reduced = useReducedMotion()

  const imgSrc = backgroundImage?.url ? new URL(backgroundImage.url).pathname : null
  const words = heading.split(" ")

  return (
    <section className="relative min-h-[80vh] flex items-center overflow-hidden">
      {/* Background */}
      {imgSrc && (
        <Image
          src={imgSrc}
          alt={heading}
          fill
          sizes="100vw"
          className="object-cover scale-[1.03]"
          priority
        />
      )}

      {/* Gradient overlay */}
      <div
        className={[
          "absolute inset-0",
          overlay === "light"
            ? "bg-gradient-to-t from-white/80 via-white/20 to-transparent"
            : overlay === "none"
            ? "bg-gradient-to-t from-[--color-bg]/70 via-black/10 to-transparent"
            : "bg-gradient-to-t from-[--color-bg] via-black/55 to-black/10",
        ].join(" ")}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 w-full px-6 sm:px-10 py-16 max-w-7xl mx-auto">
        {/* Eyebrow */}
        <motion.div
          className="flex items-center gap-3 mb-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
        >
          <span className="block h-px w-10 bg-[--color-moss]" />
          <span className="text-[--color-moss-light] text-xs font-outfit uppercase tracking-[0.25em]">
            Echipament premium de pescuit
          </span>
        </motion.div>

        {/* Heading — word-by-word stagger */}
        <h1 className="font-cormorant font-semibold text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] text-[--color-white] leading-[1.05] tracking-[-0.01em] max-w-4xl mb-6">
          {words.map((word, i) => (
            <motion.span
              key={i}
              className="inline-block mr-[0.22em] last:mr-0"
              initial={{ opacity: 0, y: 48 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.75,
                delay: 0.35 + i * 0.1,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
            >
              {word}
            </motion.span>
          ))}
        </h1>

        {subheading && (
          <motion.p
            className="text-[--color-cream]/75 text-lg md:text-xl font-outfit font-light max-w-xl mb-10 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              delay: 0.35 + words.length * 0.1 + 0.2,
              ease: "easeOut",
            }}
          >
            {subheading}
          </motion.p>
        )}

        {ctaLabel && ctaUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              delay: 0.35 + words.length * 0.1 + 0.4,
              ease: "easeOut",
            }}
          >
            <Link
              href={ctaUrl}
              className="group inline-flex items-center gap-3 bg-[--color-moss] hover:bg-[--color-moss-light] text-white px-8 py-4 font-outfit text-sm uppercase tracking-[0.12em] transition-colors duration-300"
            >
              {ctaLabel}
              <ArrowRight
                size={15}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </motion.div>
        )}
      </div>

      {/* Scroll hint */}
      <motion.div
        className="absolute bottom-8 right-8 hidden md:flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.45 }}
        transition={{ delay: 1.8, duration: 0.6 }}
        aria-hidden="true"
      >
        <span className="text-[--color-fog] text-[10px] font-outfit uppercase tracking-[0.22em] [writing-mode:vertical-rl]">
          Scroll
        </span>
        <motion.span
          className="block w-px h-10 bg-[--color-fog]"
          animate={reduced ? {} : { scaleY: [1, 0.3, 1] }}
          transition={{ repeat: reduced ? 0 : Infinity, duration: 1.8, ease: "easeInOut" }}
        />
      </motion.div>
    </section>
  )
}
