import type { Metadata } from "next"
import { BASE_URL } from "@/lib/constants"
import { getProducts, getCategories } from "@/lib/medusa/queries"
import { ProductCard } from "@/components/product/product-card"
import { PriceFilter } from "@/components/product/price-filter"
import { CategoryFilter } from "@/components/product/category-filter"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

interface ProductsPageProps {
  searchParams: Promise<{ page?: string; category?: string | string[]; price_min?: string; price_max?: string }>
}

export const metadata: Metadata = {
  title: "Produse — FirIntins",
  description: "Descoperă echipamentele premium de pescuit la crap disponibile în magazinul FirIntins.",
  alternates: { canonical: `${BASE_URL}/produse` },
  openGraph: {
    title: "Produse — FirIntins",
    url: `${BASE_URL}/produse`,
    images: [{ url: `${BASE_URL}/og-default.jpg` }],
  },
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { page: pageParam } = await searchParams
  const page = parseInt(pageParam || "1", 10)
  const offset = (page - 1) * 12

  const { products, count } = await getProducts({ limit: 12, offset })
  const categories = await getCategories()

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Acasă", item: "https://firintins.ro" },
      { "@type": "ListItem", position: 2, name: "Produse", item: "https://firintins.ro/produse" },
    ],
  }

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
              <BreadcrumbPage>Produse</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 p-6 max-w-7xl mx-auto">
        <aside className="md:col-span-1">
          <PriceFilter />
          <CategoryFilter categories={categories} />
        </aside>
        <div className="md:col-span-3">
          <h1 className="font-cormorant text-4xl text-cream mb-8">Produse</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="flex justify-center gap-2 mt-12">
            {Array.from({ length: Math.ceil(count / 12) }, (_, i) => (
              <a
                key={i + 1}
                href={`?page=${i + 1}`}
                className={`px-3 py-1 rounded ${
                  page === i + 1
                    ? "bg-moss text-white"
                    : "bg-surface border border-border text-cream"
                }`}
              >
                {i + 1}
              </a>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
