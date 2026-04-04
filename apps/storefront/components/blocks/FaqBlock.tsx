"use client"
import { useState } from "react"
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
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section className="py-16 px-6 max-w-4xl mx-auto">
      {heading && (
        <h2 className="font-cormorant text-4xl text-[--color-white] mb-10 text-center">{heading}</h2>
      )}
      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <div key={faq.id ?? i} className="border border-[--color-border] rounded">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full text-left px-5 py-4 font-outfit text-[--color-white] flex justify-between items-center"
            >
              <span>{faq.question}</span>
              <span className="text-[--color-moss] ml-4">{open === i ? "−" : "+"}</span>
            </button>
            {open === i && faq.answer && (
              <div className="px-5 pb-4 text-[--color-fog]">
                <RichText data={faq.answer} />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
