import { cookies } from "next/headers"
import Link from "next/link"
import { medusa } from "@/lib/medusa/client"
import { Heart } from "lucide-react"
import { ProductCard } from "@/components/product/product-card"

export const metadata = { title: "Lista de dorinte | Fir & Instinct" }

export default async function WishlistPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("_medusa_jwt")?.value

  if (!token) {
    return (
      <div>
        <p className="text-fog">Trebuie să fii autentificat pentru a vedea lista de dorinte.</p>
        <Link href="/autentificare" className="text-mud underline mt-2 inline-block">
          Autentifică-te
        </Link>
      </div>
    )
  }

  let wishlist: any = null
  try {
    const data = await medusa.client.fetch<{ wishlist: any }>("/store/wishlists", {
      headers: { Authorization: `Bearer ${token}` },
    })
    wishlist = data.wishlist
  } catch {
    wishlist = null
  }

  const items: any[] = wishlist?.items ?? []

  let products: any[] = []
  if (items.length > 0) {
    const productIds = [...new Set(items.map((i: any) => i.product_id))]
    try {
      const { products: fetched } = await medusa.store.product.list(
        { id: productIds as string[], fields: "id,title,handle,thumbnail,variants.id,variants.title,variants.calculated_price" },
        { next: { tags: ["products"] } }
      )
      products = fetched ?? []
    } catch {
      products = []
    }
  }

  const productMap = new Map(products.map((p: any) => [p.id, p]))

  return (
    <div>
      <h1 className="font-cormorant text-2xl text-cream mb-6">Lista de dorinte</h1>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <Heart size={48} className="mx-auto mb-4 text-fog opacity-40" />
          <p className="text-fog mb-4">Lista ta de dorinte este goală.</p>
          <Link
            href="/produse"
            className="inline-block px-6 py-3 bg-moss text-white font-outfit text-sm hover:bg-moss-light transition-colors"
          >
            Explorează produsele
          </Link>
        </div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item: any) => {
            const product = productMap.get(item.product_id)
            if (!product) return null
            return (
              <li key={item.id}>
                <ProductCard product={product} />
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
