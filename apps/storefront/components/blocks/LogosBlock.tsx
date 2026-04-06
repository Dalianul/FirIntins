import Image from "next/image"
import Link from "next/link"

interface LogoItem {
  image?: { url: string } | null
  alt?: string
  url?: string
}

interface LogosBlockData {
  blockType: "logos"
  heading?: string
  logos?: LogoItem[]
  marquee?: boolean
}

export function LogosBlock({ block }: { block: LogosBlockData }) {
  const { heading, logos, marquee } = block
  if (!logos?.length) return null

  const items = logos.flatMap((logo, i) => {
    if (!logo.image?.url) return []
    const imgSrc = new URL(logo.image.url).pathname
    const img = (
      <div key={i} className="flex items-center justify-center px-8 flex-shrink-0">
        <Image
          src={imgSrc}
          alt={logo.alt ?? ""}
          width={120}
          height={44}
          className="object-contain opacity-40 hover:opacity-80 transition-opacity duration-300 grayscale hover:grayscale-0"
        />
      </div>
    )
    return [logo.url ? (
      <Link key={i} href={logo.url} target="_blank" rel="noopener noreferrer">
        {img}
      </Link>
    ) : img]
  })

  return (
    <section className="py-14 px-6 sm:px-10 border-y border-[--color-border] bg-[--color-bg-light]">
      {heading && (
        <p className="text-[--color-fog]/60 text-xs font-outfit text-center uppercase tracking-[0.3em] mb-10">
          {heading}
        </p>
      )}

      {marquee ? (
        <div className="relative overflow-hidden">
          {/* Fade masks */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-r from-[--color-bg-light] to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-l from-[--color-bg-light] to-transparent" />

          <div className="flex animate-marquee whitespace-nowrap">
            {items}
            {items}
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap justify-center items-center max-w-5xl mx-auto gap-2">
          {items}
        </div>
      )}
    </section>
  )
}
