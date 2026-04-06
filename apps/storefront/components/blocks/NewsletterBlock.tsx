"use client"

import { useState } from "react"
import { motion } from "motion/react"
import { ArrowRight, Check } from "lucide-react"

interface NewsletterBlockData {
  blockType: "newsletter"
  heading?: string
  subheading?: string
  placeholder?: string
  buttonLabel?: string
  background?: "surface" | "moss" | "mud" | "dark"
}

const bgClass: Record<string, string> = {
  surface: "bg-[--color-surface] border-y border-[--color-border]",
  moss: "bg-[--color-moss]",
  mud: "bg-[--color-mud]",
  dark: "bg-[--color-bg]",
}

export function NewsletterBlock({ block }: { block: NewsletterBlockData }) {
  const {
    heading = "Abonează-te la newsletter",
    subheading,
    placeholder = "Adresa ta de email",
    buttonLabel = "Abonează-te",
    background = "surface",
  } = block

  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) setSubmitted(true)
  }

  const isMoss = background === "moss" || background === "mud"

  return (
    <section className={`py-20 md:py-24 px-6 sm:px-10 ${bgClass[background] ?? bgClass.surface}`}>
      <div className="max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {!isMoss && (
            <span className="block text-[--color-moss] text-xs font-outfit uppercase tracking-[0.25em] mb-4">
              Noutăți și oferte
            </span>
          )}
          <h2
            className={`font-cormorant text-4xl md:text-5xl mb-4 ${isMoss ? "text-white" : "text-[--color-white]"}`}
          >
            {heading}
          </h2>
          {subheading && (
            <p
              className={`font-outfit text-sm leading-relaxed mb-10 max-w-md mx-auto ${isMoss ? "text-white/75" : "text-[--color-fog]"}`}
            >
              {subheading}
            </p>
          )}

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center gap-3"
            >
              <span className="w-8 h-8 rounded-full bg-[--color-moss] flex items-center justify-center flex-shrink-0">
                <Check size={15} className="text-white" strokeWidth={2.5} />
              </span>
              <p
                className={`font-outfit text-base ${isMoss ? "text-white" : "text-[--color-moss]"}`}
              >
                Mulțumim! Te-ai abonat cu succes.
              </p>
            </motion.div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-0 max-w-md mx-auto"
            >
              <label htmlFor="newsletter-email" className="sr-only">
                {placeholder}
              </label>
              <input
                id="newsletter-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={placeholder}
                required
                className={`flex-1 px-5 py-3.5 text-[--color-white] border focus:outline-none font-outfit text-sm placeholder:text-[--color-fog] transition-colors duration-200 ${
                  isMoss
                    ? "bg-white/10 border-white/30 focus:outline-none focus:border-white/70"
                    : "bg-[--color-bg] border-[--color-border] focus:outline-none focus:border-[--color-moss] focus-visible:ring-2 focus-visible:ring-[--color-moss]"
                }`}
              />
              <button
                type="submit"
                className="group flex items-center justify-center gap-2 px-6 py-3.5 bg-[--color-moss] hover:bg-[--color-moss-light] text-white font-outfit text-sm uppercase tracking-[0.1em] transition-colors duration-300 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-moss] focus-visible:ring-offset-2 focus-visible:ring-offset-[--color-bg] active:opacity-80 cursor-pointer"
              >
                {buttonLabel}
                <ArrowRight
                  size={14}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  )
}
