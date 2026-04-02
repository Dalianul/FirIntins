import type { Metadata } from "next"
import { BASE_URL } from "@/lib/constants"
import { getCategory, getProducts } from "@/lib/medusa/queries"
import { ProductCard } from "@/components/product/product-card"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { notFound } from "next/navigation"

type CategoryPageProps = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  try {
    const category = await getCategory(slug)
    if (!category) return { title: "Categorie — FirIntins" }
    return {
      title: `${category.name} — FirIntins`,
      description: `Produse din categoria ${category.name} disponibile în magazinul FirIntins.`,
      alternates: { canonical: `${BASE_URL}/categorii/${slug}` },
      openGraph: {
        title: `${category.name} — FirIntins`,
        url: `${BASE_URL}/categorii/${slug}`,
        images: [{ url: `${BASE_URL}/og-default.jpg` }],
      },
    }
  } catch {
    return { title: "Categorie — FirIntins" }
  }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  try {
    const { slug } = await params
    const { page: pageParam } = await searchParams
    const category = await getCategory(slug)
    const page = parseInt(pageParam || "1", 10)
    const offset = (page - 1) * 12

    const { products } = await getProducts({ limit: 12, offset })
    const filteredProducts = products.filter((p: any) =>
      p.categories?.some((c: { handle: string }) => c.handle === slug)
    )

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Acasă", item: BASE_URL },
        { "@type": "ListItem", position: 2, name: "Produse", item: `${BASE_URL}/produse` },
        {
          "@type": "ListItem",
          position: 3,
          name: category.name,
          item: `${BASE_URL}/categorii/${slug}`,
        },
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
                <BreadcrumbLink href="/produse">Produse</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{category.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />

        <div className="p-6 max-w-7xl mx-auto">
          <h1 className="font-cormorant text-4xl text-cream mb-8">{category.name}</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </main>
    )
  } catch {
    notFound()
  }
}
