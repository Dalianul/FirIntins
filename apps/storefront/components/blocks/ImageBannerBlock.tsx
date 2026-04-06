"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "motion/react"
import { ArrowRight } from "lucide-react"

interface ImageBannerBlockData {
  blockType: "imageBanner"
  image?: { url: string } | null
  caption?: string
  linkUrl?: string
}

export function ImageBannerBlock({ block }: { block: ImageBannerBlockData }) {
  const { image, caption, linkUrl } = block
  if (!image?.url) return null
  const imgSrc = new URL(image.url).pathname

  const inner = (
    <motion.div
      className="relative w-full h-72 md:h-[480px] overflow-hidden group"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <Image
        src={imgSrc}
        alt={caption ?? ""}
        fill
        sizes="100vw"
        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
      />

      {/* Bottom gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

      {caption && (
        <div className="absolute bottom-6 left-8 right-8 flex items-end justify-between">
          <p className="text-white/90 font-outfit text-sm tracking-wide">{caption}</p>
          {linkUrl && (
            <span className="flex items-center gap-2 text-white/70 hover:text-white font-outfit text-xs uppercase tracking-[0.15em] transition-colors duration-200">
              <span>Descoperă</span>
              <ArrowRight size={12} />
            </span>
          )}
        </div>
      )}
    </motion.div>
  )

  return (
    <section className="px-6 sm:px-10 py-8">
      <div className="max-w-7xl mx-auto">
        {linkUrl ? (
          <Link href={linkUrl} className="block">
            {inner}
          </Link>
        ) : (
          inner
        )}
      </div>
    </section>
  )
}
