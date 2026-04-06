"use client"

import Image from "next/image"
import { motion } from "motion/react"

interface TestimonialItem {
  id?: string
  author: string
  role?: string
  quote: string
  avatar?: { url: string } | null
  rating?: number
}

interface TestimonialsBlockData {
  blockType: "testimonials"
  heading?: string
  items?: Array<number | TestimonialItem>
}

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
}

const cardVariant = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export function TestimonialsBlock({ block }: { block: TestimonialsBlockData }) {
  const { heading, items } = block
  const testimonials = (items ?? []).filter(
    (t): t is TestimonialItem => typeof t === "object" && t !== null,
  )
  if (!testimonials.length) return null

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
              Ce spun pescarii
            </span>
            <h2 className="font-cormorant text-4xl md:text-5xl text-[--color-white]">{heading}</h2>
          </motion.div>
        )}

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
        >
          {testimonials.map((t, i) => {
            const avatarSrc = t.avatar?.url ? new URL(t.avatar.url).pathname : null
            return (
              <motion.div
                key={t.id ?? i}
                variants={cardVariant}
                className="group bg-[--color-surface] border border-[--color-border] hover:border-[--color-moss]/30 p-8 flex flex-col transition-colors duration-300"
              >
                {/* Decorative quote mark */}
                <span className="font-cormorant text-7xl text-[--color-moss]/20 leading-none mb-2 select-none">
                  "
                </span>

                {/* Stars */}
                {t.rating && (
                  <div className="flex gap-0.5 mb-4" aria-label={`${t.rating} din 5 stele`}>
                    {Array.from({ length: 5 }).map((_, si) => (
                      <svg
                        key={si}
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill={si < t.rating! ? "var(--color-mud)" : "none"}
                        stroke={si < t.rating! ? "var(--color-mud)" : "var(--color-border)"}
                        strokeWidth="1.2"
                        aria-hidden="true"
                      >
                        <polygon points="7,1 8.8,5.2 13.4,5.5 10,8.5 11.1,13 7,10.5 2.9,13 4,8.5 0.6,5.5 5.2,5.2" />
                      </svg>
                    ))}
                  </div>
                )}

                <p className="text-[--color-cream]/85 font-outfit text-sm leading-relaxed flex-1 italic">
                  {t.quote}
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 mt-7 pt-6 border-t border-[--color-border]">
                  {avatarSrc ? (
                    <Image
                      src={avatarSrc}
                      alt={t.author}
                      width={40}
                      height={40}
                      className="rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[--color-moss-dim] border border-[--color-moss]/20 flex items-center justify-center flex-shrink-0">
                      <span className="font-cormorant text-lg text-[--color-moss]">
                        {t.author[0]}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-outfit font-semibold text-[--color-white] text-sm">{t.author}</p>
                    {t.role && (
                      <p className="text-[--color-fog] text-xs mt-0.5">{t.role}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
