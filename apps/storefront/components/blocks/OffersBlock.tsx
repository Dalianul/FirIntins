import Image from "next/image"
import Link from "next/link"

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

export function OffersBlock({ block }: { block: OffersBlockData }) {
  const { heading, offers } = block
  return (
    <section className="py-16 px-6 max-w-7xl mx-auto">
      {heading && (
        <h2 className="font-cormorant text-4xl text-[--color-white] mb-8 text-center">{heading}</h2>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers?.map((offer, i) => {
          const imgSrc = offer.image?.url ? new URL(offer.image.url).pathname : null
          return (
            <div key={i} className="bg-[--color-surface] rounded overflow-hidden">
              {imgSrc && (
                <div className="relative h-48">
                  <Image src={imgSrc} alt={offer.title ?? ""} fill className="object-cover" />
                  {offer.badge && (
                    <span className="absolute top-3 left-3 bg-[--color-mud] text-white text-xs px-2 py-1">
                      {offer.badge}
                    </span>
                  )}
                </div>
              )}
              <div className="p-4">
                <h3 className="font-cormorant text-xl text-[--color-white]">{offer.title}</h3>
                {offer.description && (
                  <p className="text-[--color-fog] text-sm mt-2">{offer.description}</p>
                )}
                {offer.ctaUrl && (
                  <Link href={offer.ctaUrl} className="inline-block mt-4 text-[--color-moss] text-sm hover:underline">
                    Află mai mult →
                  </Link>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
