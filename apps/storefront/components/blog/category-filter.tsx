"use client"

type Category = { id: string; slug: string; name: string }

type Props = {
  categories: Category[]
  selected: string | null
  onSelect: (slug: string | null) => void
}

export function CategoryFilter({ categories, selected, onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filtru categorii">
      <button
        onClick={() => onSelect(null)}
        aria-pressed={selected === null}
        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-150 border ${
          selected === null
            ? "bg-[--color-moss] text-[--color-white] border-[--color-moss]"
            : "text-[--color-fog] border-[--color-border] hover:text-[--color-cream] hover:border-[--color-moss]"
        }`}
      >
        Toate
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.slug)}
          aria-pressed={selected === cat.slug}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-150 border ${
            selected === cat.slug
              ? "bg-[--color-moss] text-[--color-white] border-[--color-moss]"
              : "text-[--color-fog] border-[--color-border] hover:text-[--color-cream] hover:border-[--color-moss]"
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  )
}
