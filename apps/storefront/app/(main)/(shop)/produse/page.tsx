import { Suspense } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { BASE_URL } from "@/lib/constants"
import { getCategories } from "@/lib/medusa/queries"
import ProductGrid from "@/components/product/product-grid"
import ProductGridSkeleton from "@/components/product/product-grid-skeleton"
import { CategoryFilter } from "@/components/product/category-filter"
import { PriceFilter } from "@/components/product/price-filter"
import InStockToggle from "@/components/product/in-stock-toggle"
import SortSelect from "@/components/product/sort-select"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

interface ProductsPageProps {
  searchParams: Promise<{
    q?: string
    category?: string
    price_min?: string
    price_max?: string
    in_stock?: string
    sort?: string
    page?: string
  }>
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
  const sp = await searchParams
  const categories = await getCategories()

  const hasActiveFilters = !!(
    sp.q || sp.category || sp.price_min || sp.price_max || sp.in_stock || sp.sort
  )

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Acasă", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "Produse", item: `${BASE_URL}/produse` },
    ],
  }

  return (
    <main className="bg-[--color-bg] min-h-screen">
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

      <div className="px-6 pb-6 max-w-7xl mx-auto">
        <h1 className="font-cormorant text-4xl text-[--color-cream] mb-6">Produse</h1>

        {/* Filter bar — wrapped in Suspense because filter components use useSearchParams() */}
        <Suspense fallback={<div className="h-10 animate-pulse bg-[--color-surface] rounded mb-6" />}>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <CategoryFilter categories={categories} category={sp.category ?? ""} />
            <PriceFilter priceMin={sp.price_min ?? ""} priceMax={sp.price_max ?? ""} />
            <InStockToggle inStock={sp.in_stock === "true"} />
            <SortSelect sort={sp.sort ?? ""} />
          </div>
        </Suspense>

        {hasActiveFilters && (
          <div className="mb-4">
            <Link
              href="/produse"
              className="text-sm text-[--color-moss] hover:text-[--color-moss-light] transition-colors"
            >
              Resetează filtrele
            </Link>
          </div>
        )}

        <Suspense fallback={<ProductGridSkeleton />}>
          <ProductGrid searchParams={sp} />
        </Suspense>
      </div>
    </main>
  )
}
