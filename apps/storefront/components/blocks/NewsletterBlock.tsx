"use client"

import { useState } from "react"
import { motion } from "motion/react"
import { ArrowRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

interface NewsletterBlockData {
  blockType: "newsletter"
  heading?: string
  subheading?: string
  placeholder?: string
  buttonLabel?: string
  background?: "surface" | "moss" | "mud" | "dark"
}

type BtnVariant = "brand" | "brandLight"

const themes: Record<
  "surface" | "moss" | "mud" | "dark",
  {
    section: string
    eyebrow: string | null
    showEyebrow: boolean
    heading: string
    subheading: string
    input: string
    btnVariant: BtnVariant
    success: string
  }
> = {
  surface: {
    section: "bg-bg border-y border-border",
    eyebrow: "text-moss",
    showEyebrow: true,
    heading: "text-[#1c1a15]",
    subheading: "text-[#1c1a15]/60",
    input:
      "bg-surface border-border text-[#1c1a15] placeholder:text-fog focus:border-moss",
    btnVariant: "brand",
    success: "text-moss",
  },
  dark: {
    section: "bg-[#1c1a15]",
    eyebrow: "text-moss",
    showEyebrow: true,
    heading: "text-[#ffffff]",
    subheading: "text-[#ffffff]/65",
    input:
      "bg-white/10 border-white/20 text-[#ffffff] placeholder:text-[#ffffff]/45 focus:border-white/60",
    btnVariant: "brand",
    success: "text-[#ffffff]",
  },
  moss: {
    section: "bg-moss",
    eyebrow: null,
    showEyebrow: false,
    heading: "text-[#ffffff]",
    subheading: "text-[#ffffff]/70",
    input:
      "bg-white/10 border-white/25 text-[#ffffff] placeholder:text-[#ffffff]/45 focus:border-white/65",
    btnVariant: "brandLight",
    success: "text-[#ffffff]",
  },
  mud: {
    section: "bg-mud",
    eyebrow: null,
    showEyebrow: false,
    heading: "text-[#ffffff]",
    subheading: "text-[#ffffff]/70",
    input:
      "bg-white/10 border-white/25 text-[#ffffff] placeholder:text-[#ffffff]/45 focus:border-white/65",
    btnVariant: "brandLight",
    success: "text-[#ffffff]",
  },
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

  const t = themes[background] ?? themes.surface

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) setSubmitted(true)
  }

  return (
    <section className={`py-20 md:py-24 px-6 sm:px-10 ${t.section}`}>
      <div className="max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {t.showEyebrow && (
            <span className={`block text-xs font-outfit uppercase tracking-[0.25em] mb-4 ${t.eyebrow}`}>
              Noutăți și oferte
            </span>
          )}

          <h2 className={`font-cormorant text-4xl md:text-5xl mb-4 ${t.heading}`}>
            {heading}
          </h2>

          {subheading && (
            <p className={`font-outfit text-sm leading-relaxed mb-10 max-w-md mx-auto ${t.subheading}`}>
              {subheading}
            </p>
          )}

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center gap-3"
            >
              <span className="w-8 h-8 rounded-full bg-moss flex items-center justify-center flex-shrink-0">
                <Check size={15} className="text-[#ffffff]" strokeWidth={2.5} />
              </span>
              <p className={`font-outfit text-base ${t.success}`}>
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
                className={`flex-1 px-5 py-3.5 border focus:outline-none font-outfit text-sm transition-colors duration-200 ${t.input}`}
              />
              <Button
                type="submit"
                variant={t.btnVariant}
                size="heroInline"
                className="group"
              >
                {buttonLabel}
                <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  )
}
