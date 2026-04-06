import Link from "next/link"
import { getCachedNavigation } from "@/lib/cms/client"

export async function HeaderNav() {
  let items: Array<{ label: string; url: string; newTab?: boolean | null }> = []
  try {
    const nav = await getCachedNavigation()
    items = (nav?.items ?? []) as typeof items
  } catch {
    // fallback to empty — header still renders without nav items
  }

  if (items.length === 0) {
    // Static fallback links
    items = [
      { label: "Produse", url: "/produse" },
      { label: "Categorii", url: "/categorii" },
      { label: "Blog", url: "/blog" },
      { label: "Oferte", url: "/oferte" },
    ]
  }

  return (
    <div className="hidden md:flex gap-8">
      {items.map((item) => (
        <Link
          key={item.url}
          href={item.url}
          target={item.newTab ? "_blank" : undefined}
          rel={item.newTab ? "noopener noreferrer" : undefined}
          className="text-[--color-cream] hover:text-[--color-moss] transition-colors"
        >
          {item.label}
        </Link>
      ))}
    </div>
  )
}
