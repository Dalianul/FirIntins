import Image from "next/image"
import Link from "next/link"

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

  const imgSrc = backgroundImage?.url ? new URL(backgroundImage.url).pathname : null

  const overlayClass =
    overlay === "dark" ? "bg-black/50" :
    overlay === "light" ? "bg-white/30" :
    ""

  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      {imgSrc && (
        <Image
          src={imgSrc}
          alt={heading}
          fill
          className="object-cover"
          priority
        />
      )}
      {overlay !== "none" && <div className={`absolute inset-0 ${overlayClass}`} />}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <h1 className="font-cormorant text-5xl md:text-7xl text-white mb-4">{heading}</h1>
        {subheading && (
          <p className="text-xl text-white/90 mb-8">{subheading}</p>
        )}
        {ctaLabel && ctaUrl && (
          <Link
            href={ctaUrl}
            className="inline-block bg-[--color-moss] hover:bg-[--color-moss-light] text-white px-8 py-3 font-outfit transition-colors"
          >
            {ctaLabel}
          </Link>
        )}
      </div>
    </section>
  )
}
