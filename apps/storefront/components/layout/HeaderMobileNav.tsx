import { getCachedNavigation } from "@/lib/cms/client"
import { MobileNavDrawer } from "./mobile-nav-drawer"

export async function HeaderMobileNav() {
  let items: Array<{ label: string; url: string; newTab?: boolean | null }> = []
  try {
    const nav = await getCachedNavigation()
    items = (nav?.items ?? []) as typeof items
  } catch {
    // fallback to static links
  }

  if (items.length === 0) {
    items = [
      { label: "Produse", url: "/produse" },
      { label: "Categorii", url: "/categorii" },
      { label: "Blog", url: "/blog" },
      { label: "Oferte", url: "/oferte" },
    ]
  }

  return <MobileNavDrawer items={items} />
}
