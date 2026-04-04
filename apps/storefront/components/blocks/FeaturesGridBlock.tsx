interface FeatureItem {
  title?: string
  description?: string
  icon?: string
}

interface FeaturesGridBlockData {
  blockType: "featuresGrid"
  heading?: string
  items?: FeatureItem[]
}

const ICONS: Record<string, string> = {
  fish: "🐟", hook: "🪝", rod: "🎣", boat: "⛵",
  star: "⭐", shield: "🛡️", truck: "🚚", leaf: "🌿",
}

export function FeaturesGridBlock({ block }: { block: FeaturesGridBlockData }) {
  const { heading, items } = block
  return (
    <section className="py-16 px-6 max-w-7xl mx-auto">
      {heading && (
        <h2 className="font-cormorant text-4xl text-[--color-white] mb-10 text-center">{heading}</h2>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {items?.map((item, i) => (
          <div key={i} className="text-center">
            <div className="text-4xl mb-3">{ICONS[item.icon ?? ""] ?? "•"}</div>
            <h3 className="font-outfit font-semibold text-[--color-white] mb-1">{item.title}</h3>
            {item.description && (
              <p className="text-[--color-fog] text-sm">{item.description}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
