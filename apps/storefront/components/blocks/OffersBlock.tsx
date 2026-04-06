"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "motion/react"
import { ArrowRight } from "lucide-react"

interface OfferItem {
  title?: string
  description?: string
  image?: { url: string } | null
  badge?: string
  ctaUrl?: string
}

interface OffersBlockData {
  blockType: "offers"
  heading?: string
  offers?: OfferItem[]
}

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
}

const cardVariant = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export function OffersBlock({ block }: { block: OffersBlockData }) {
  const { heading, offers } = block
  if (!offers?.length) return null

  return (
    <section className="py-20 md:py-28 px-6 sm:px-10 bg-[--color-bg]">
      <div className="max-w-7xl mx-auto">
        {heading && (
          <motion.div
            className="flex items-end justify-between mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div>
              <span className="block text-[--color-mud] text-xs font-outfit uppercase tracking-[0.25em] mb-2">
                Promoții exclusive
              </span>
              <h2 className="font-cormorant text-4xl md:text-5xl text-[--color-white]">{heading}</h2>
            </div>
          </motion.div>
        )}

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
        >
          {offers.map((offer, i) => {
            const imgSrc = offer.image?.url ? new URL(offer.image.url).pathname : null
            return (
              <motion.article
                key={i}
                variants={cardVariant}
                className="group relative bg-[--color-surface] border border-[--color-border] hover:border-[--color-moss]/40 overflow-hidden transition-colors duration-400"
              >
                {/* Image */}
                {imgSrc && (
                  <div className="relative h-56 overflow-hidden">
                    <Image
                      src={imgSrc}
                      alt={offer.title ?? ""}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Image overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[--color-surface]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                    {offer.badge && (
                      <span className="absolute top-4 left-4 bg-[--color-mud] text-white text-[10px] font-outfit font-semibold px-3 py-1 uppercase tracking-[0.1em]">
                        {offer.badge}
                      </span>
                    )}
                  </div>
                )}

                {/* No image but has badge */}
                {!imgSrc && offer.badge && (
                  <div className="px-6 pt-6">
                    <span className="inline-block bg-[--color-mud] text-white text-[10px] font-outfit font-semibold px-3 py-1 uppercase tracking-[0.1em]">
                      {offer.badge}
                    </span>
                  </div>
                )}

                <div className="p-6">
                  <h3 className="font-cormorant text-2xl text-[--color-white] mb-2 leading-snug">
                    {offer.title}
                  </h3>
                  {offer.description && (
                    <p className="text-[--color-fog] text-sm leading-relaxed mb-5">{offer.description}</p>
                  )}
                  {offer.ctaUrl && (
                    <Link
                      href={offer.ctaUrl}
                      className="inline-flex items-center gap-2 text-[--color-moss] hover:text-[--color-moss-light] text-sm font-outfit transition-colors duration-200"
                    >
                      <span>Află mai mult</span>
                      <ArrowRight
                        size={14}
                        className="transition-transform duration-200 group-hover:translate-x-1"
                      />
                    </Link>
                  )}
                </div>
              </motion.article>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
