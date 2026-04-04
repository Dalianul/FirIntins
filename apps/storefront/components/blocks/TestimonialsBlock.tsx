import Image from "next/image"

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

export function TestimonialsBlock({ block }: { block: TestimonialsBlockData }) {
  const { heading, items } = block
  const testimonials = (items ?? []).filter((t): t is TestimonialItem => typeof t === "object" && t !== null)

  return (
    <section className="py-16 px-6 max-w-7xl mx-auto">
      {heading && (
        <h2 className="font-cormorant text-4xl text-[--color-white] mb-10 text-center">{heading}</h2>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((t, i) => {
          const avatarSrc = t.avatar?.url ? new URL(t.avatar.url).pathname : null
          return (
            <div key={t.id ?? i} className="bg-[--color-surface] p-6 rounded">
              <div className="flex items-center gap-3 mb-4">
                {avatarSrc && (
                  <Image src={avatarSrc} alt={t.author} width={48} height={48} className="rounded-full object-cover" />
                )}
                <div>
                  <p className="font-semibold text-[--color-white]">{t.author}</p>
                  {t.role && <p className="text-[--color-fog] text-sm">{t.role}</p>}
                </div>
              </div>
              {t.rating && (
                <div className="text-[--color-mud] mb-2">{"★".repeat(t.rating)}{"☆".repeat(5 - t.rating)}</div>
              )}
              <p className="text-[--color-cream] text-sm italic">"{t.quote}"</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
