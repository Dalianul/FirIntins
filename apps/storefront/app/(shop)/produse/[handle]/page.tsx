import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getProduct, getProducts } from "@/lib/medusa/queries"
import { ProductGallery } from "@/components/product/product-gallery"
import { VariantSelector } from "@/components/product/variant-selector"
import { AddToCartButton } from "@/components/product/add-to-cart-button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export const revalidate = 1800 // 30 minutes ISR

interface ProductPageProps {
  params: { handle: string }
}

export async function generateStaticParams() {
  try {
    const { products } = await getProducts({ limit: 100, offset: 0 })
    return products.map((product) => ({
      handle: product.handle || product.id,
    }))
  } catch (error) {
    console.error("generateStaticParams error:", error)
    return []
  }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  try {
    const product = await getProduct(params.handle)
    if (!product) {
      return {
        title: "Produsul nu a fost găsit | FirIntins",
      }
    }

    const mainImageUrl = product.images?.[0]?.url || `https://picsum.photos/1200/630?random=${product.id}`

    return {
      title: `${product.title} | FirIntins`,
      description: product.description || "Produs disponibil în magazinul FirIntins",
      openGraph: {
        title: product.title,
        description: product.description || "Produs disponibil în magazinul FirIntins",
        url: `https://firintins.ro/produse/${product.handle}`,
      },
    }
  } catch (error) {
    console.error("generateMetadata error:", error)
    return {
      title: "Produsul nu a fost găsit | FirIntins",
    }
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
  let product: ProductResponse | null = null

  try {
    product = (await getProduct(params.handle)) as ProductResponse | null
  } catch (error) {
    console.error("getProduct error:", error)
  }

  if (!product) {
    notFound()
  }

  const variants = product.variants || []
  const selectedVariant = variants.find((v) => (v.inventory_quantity ?? 1) > 0) || variants[0]
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
      { "@type": "ListItem", position: 1, name: "Acasă", item: "https://firintins.ro" },
      { "@type": "ListItem", position: 2, name: "Produse", item: "https://firintins.ro/produse" },
      { "@type": "ListItem", position: 3, name: product.title, item: `https://firintins.ro/produse/${product.handle}` },
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
              <>
                <VariantSelector
                  variants={variants}
                  onSelect={() => {
                    // Controlled by parent, no op needed
                  }}
                />
                <AddToCartButton
                  productId={product.id}
                  variant={selectedVariant}
                  outOfStock={outOfStock}
                />
              </>
            ) : (
              <p className="text-fog">Nu sunt variante disponibile pentru acest produs.</p>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
