import type { Metadata } from "next"
import { BASE_URL } from "@/lib/constants"
import { getOfferProducts } from "@/lib/medusa/queries"
import { ProductCard } from "@/components/product/product-card"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Oferte — FirIntins",
  description: "Produse la reducere — echipamente pescuit la crap la prețuri speciale.",
  alternates: { canonical: `${BASE_URL}/oferte` },
  openGraph: {
    title: "Oferte — FirIntins",
    url: `${BASE_URL}/oferte`,
    images: [{ url: `${BASE_URL}/og-default.jpg` }],
  },
}

export default async function OfertePage() {
  const products = await getOfferProducts()

  return (
    <main className="bg-bg min-h-screen">
      <div className="px-6 py-4 max-w-7xl mx-auto">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Acasă</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Oferte</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="font-cormorant text-4xl text-cream mb-8">Oferte</h1>
        {products.length === 0 ? (
          <p className="text-fog">Nu există produse în ofertă momentan.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
