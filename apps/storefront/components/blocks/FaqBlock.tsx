"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Plus, Minus } from "lucide-react"
import { RichText } from "@payloadcms/richtext-lexical/react"

interface FaqItem {
  id?: string
  question: string
  answer?: any
}

interface FaqBlockData {
  blockType: "faq"
  heading?: string
  items?: Array<number | FaqItem>
}

export function FaqBlock({ block }: { block: FaqBlockData }) {
  const { heading, items } = block
  const faqs = (items ?? []).filter((f): f is FaqItem => typeof f === "object")
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  if (!faqs.length) return null

  return (
    <section className="py-20 md:py-28 px-6 sm:px-10 bg-[--color-bg]">
      <div className="max-w-3xl mx-auto">
        {heading && (
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <span className="block text-[--color-moss] text-xs font-outfit uppercase tracking-[0.25em] mb-3">
              Întrebări frecvente
            </span>
            <h2 className="font-cormorant text-4xl md:text-5xl text-[--color-white]">{heading}</h2>
          </motion.div>
        )}

        <motion.div
          className="divide-y divide-[--color-border]"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i
            return (
              <div key={faq.id ?? i}>
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full text-left flex items-center justify-between gap-4 py-5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-moss] focus-visible:ring-inset"
                  aria-expanded={isOpen}
                >
                  <span className="font-outfit text-[--color-white] text-base leading-snug group-hover:text-[--color-cream] transition-colors duration-200">
                    {faq.question}
                  </span>
                  <span className="flex-shrink-0 w-7 h-7 border border-[--color-border] group-hover:border-[--color-moss]/50 flex items-center justify-center transition-colors duration-200">
                    {isOpen ? (
                      <Minus size={13} className="text-[--color-moss]" />
                    ) : (
                      <Plus size={13} className="text-[--color-fog] group-hover:text-[--color-moss] transition-colors duration-200" />
                    )}
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && faq.answer && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                      className="overflow-hidden"
                    >
                      <div className="pb-6 text-[--color-fog] text-sm leading-relaxed font-outfit prose prose-invert prose-sm max-w-none [&_p]:text-[--color-fog] [&_a]:text-[--color-moss] [&_a:hover]:text-[--color-moss-light]">
                        <RichText data={faq.answer} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
