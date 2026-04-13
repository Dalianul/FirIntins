"use client"

import Image from "next/image"
import Link from "next/link"
import { motion, useReducedMotion } from "motion/react"
import { ArrowRight } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"

interface HeroBlockData {
  blockType: "hero"
  heading: string
  subheading?: string
  backgroundImage?: { url: string } | null
  ctaLabel?: string
  ctaUrl?: string
  overlay?: "none" | "dark" | "light"
  textColor?: "light" | "dark"
}

export function HeroBlock({ block }: { block: HeroBlockData }) {
  const { heading, subheading, backgroundImage, ctaLabel, ctaUrl, overlay, textColor } = block
  const reduced = useReducedMotion()

  const imgSrc = backgroundImage?.url ? new URL(backgroundImage.url).pathname : null
  const words = heading.split(" ")
  // textColor: "dark" = dark text for light backgrounds, default "light" = white text for dark backgrounds
  const darkText = textColor === "dark"

  return (
    <section className="relative min-h-[80vh] flex items-center overflow-hidden -mt-16">
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

      {/* Gradient overlay — controlled only by the overlay field */}
      <div
        className={[
          "absolute inset-0",
          overlay === "light"
            ? "bg-gradient-to-t from-white/80 via-white/20 to-transparent"
            : overlay === "none"
            ? "bg-gradient-to-t from-black/70 via-black/10 to-transparent"
            : "bg-gradient-to-t from-black/80 via-black/55 to-black/10",
        ].join(" ")}
      />
      {/* Side vignette only on dark overlays for depth */}
      {overlay !== "light" && (
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent pointer-events-none" />
      )}

      {/* Content */}
      <div className="relative z-10 w-full px-6 sm:px-10 pb-16 max-w-7xl mx-auto">
        {/* Eyebrow */}
        <motion.div
          className="flex items-center gap-3 mb-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
        >
          <span className="block h-px w-10 bg-moss" />
          <span className={`text-xs font-outfit uppercase tracking-[0.25em] ${darkText ? "text-moss" : "text-[#ffffff]/80"}`}>
            Echipament premium de pescuit
          </span>
        </motion.div>

        {/* Heading — word-by-word stagger */}
        <h1 className={`font-cormorant font-semibold text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] leading-[1.05] tracking-[-0.01em] max-w-4xl mb-6 ${darkText ? "text-[#1c1a15]" : "text-[#ffffff]"}`}>
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
            className={`text-lg md:text-xl font-outfit font-light max-w-xl mb-10 leading-relaxed ${darkText ? "text-[#1c1a15]/75" : "text-[#ffffff]/75"}`}
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
              className={`group ${buttonVariants({
                variant: darkText ? "brandOutline" : "brand",
                size: "hero",
              })}`}
            >
              {ctaLabel}
              <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
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
        <span className={`text-[10px] font-outfit uppercase tracking-[0.22em] [writing-mode:vertical-rl] ${darkText ? "text-[#1c1a15]/60" : "text-[#ffffff]/50"}`}>
          Scroll
        </span>
        <motion.span
          className={`block w-px h-10 ${darkText ? "bg-[#1c1a15]/30" : "bg-[#ffffff]/40"}`}
          animate={reduced ? {} : { scaleY: [1, 0.3, 1] }}
          transition={{ repeat: reduced ? 0 : Infinity, duration: 1.8, ease: "easeInOut" }}
        />
      </motion.div>
    </section>
  )
}
