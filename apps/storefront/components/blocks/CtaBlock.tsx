import Link from "next/link"

interface CtaBlockData {
  blockType: "cta"
  heading: string
  subheading?: string
  ctaLabel?: string
  ctaUrl?: string
  background?: "moss" | "mud" | "dark"
}

const BG: Record<string, string> = {
  moss: "bg-[--color-moss]",
  mud: "bg-[--color-mud]",
  dark: "bg-[--color-surface]",
}

export function CtaBlock({ block }: { block: CtaBlockData }) {
  const { heading, subheading, ctaLabel, ctaUrl, background } = block
  return (
    <section className={`${BG[background ?? "moss"]} py-16 px-6`}>
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="font-cormorant text-4xl text-white mb-4">{heading}</h2>
        {subheading && <p className="text-white/80 text-lg mb-8">{subheading}</p>}
        {ctaLabel && ctaUrl && (
          <Link
            href={ctaUrl}
            className="inline-block border-2 border-white text-white px-8 py-3 hover:bg-white hover:text-[--color-bg] transition-colors"
          >
            {ctaLabel}
          </Link>
        )}
      </div>
    </section>
  )
}
