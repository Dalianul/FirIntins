import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { cookies } from "next/headers"
import { getProduct, getProducts } from "@/lib/medusa/queries"
import { BASE_URL } from "@/lib/constants"
import { ProductGallery } from "@/components/product/product-gallery"
import { ProductActions } from "@/components/product/product-actions"
import { ProductTabs } from "@/components/product/product-tabs"
import { ReviewList } from "@/components/reviews/review-list"
import { ReviewForm } from "@/components/reviews/review-form"
import { ViewItemTracker } from "@/components/analytics/view-item-tracker"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

type ProductPageProps = {
  params: Promise<{ handle: string }>
}

export async function generateStaticParams() {
  try {
    const { products } = await getProducts({ limit: 100, offset: 0 })
    return products.map((product: any) => ({
      handle: product.handle || product.id,
    }))
  } catch (error) {
    console.error("generateStaticParams error:", error)
    return []
  }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { handle } = await params
  const product = await getProduct(handle)
  if (!product) {
    return { title: "Produsul nu a fost găsit — FirIntins" }
  }
  return {
    title: `${product.title} — FirIntins`,
    description: product.description
      ? product.description.slice(0, 160)
      : "Produs disponibil în magazinul FirIntins.",
    alternates: { canonical: `${BASE_URL}/produse/${handle}` },
    openGraph: {
      title: product.title,
      description: product.description?.slice(0, 160) ?? "Produs FirIntins",
      url: `${BASE_URL}/produse/${handle}`,
    },
  }
}

interface ProductResponse {
  id: string
  handle: string
  title: string
  description?: string
  images?: Array<{ url: string }>
  variants?: Array<{
    id: string
    title?: string
    inventory_quantity?: number
    prices?: Array<{ amount?: number }>
  }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { handle } = await params
  const cookieStore = await cookies()
  const isAuthenticated = !!cookieStore.get("_medusa_jwt")?.value

  let product: ProductResponse | null = null

  try {
    product = (await getProduct(handle)) as ProductResponse | null
  } catch (error) {
    console.error("getProduct error:", error)
  }

  if (!product) {
    notFound()
  }

  const variants = product.variants || []
  const outOfStock = variants.every((v) => (v.inventory_quantity ?? 1) === 0)

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description || "",
    image: product.images?.[0]?.url || `https://picsum.photos/600/600?random=${product.id}`,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "RON",
      lowPrice: Math.min(...variants.map((v) => v.prices?.[0]?.amount ?? 0)),
      highPrice: Math.max(...variants.map((v) => v.prices?.[0]?.amount ?? 0)),
      availability: outOfStock ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      offerCount: variants.length,
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.5",
      reviewCount: "10",
    },
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Acasă", item: `${BASE_URL}` },
      { "@type": "ListItem", position: 2, name: "Produse", item: `${BASE_URL}/produse` },
      { "@type": "ListItem", position: 3, name: product.title, item: `${BASE_URL}/produse/${product.handle}` },
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
              <BreadcrumbPage>{product.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <ViewItemTracker
        id={product.id}
        title={product.title}
        price={product.variants?.[0]?.prices?.[0]?.amount}
      />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Gallery */}
          <ProductGallery product={product} />

          {/* Details */}
          <div className="space-y-6">
            <div>
              <h1 className="font-cormorant text-4xl md:text-5xl text-cream mb-2">{product.title}</h1>
              {product.description && (
                <p className="text-fog text-sm leading-relaxed">{product.description}</p>
              )}
            </div>

            {variants.length > 0 ? (
              <ProductActions productId={product.id} variants={variants} />
            ) : (
              <p className="text-fog">Nu sunt variante disponibile pentru acest produs.</p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-16">
        <ProductTabs
          description={product.description}
          reviewsSection={
            <div className="space-y-6">
              <ReviewList productId={product.id} />
              <ReviewForm productId={product.id} isAuthenticated={isAuthenticated} />
            </div>
          }
        />
      </div>
    </main>
  )
}
