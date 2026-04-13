import type { Metadata } from "next"
import { connection } from "next/server"
import { BASE_URL } from "@/lib/constants"
import { getHomepage } from "@/lib/cms/client"
import { getProduct } from "@/lib/medusa/queries"
import { HomepageContent } from "@/components/cms/HomepageContent"

export const dynamic = "force-dynamic"

const serverURL = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3000"

export const metadata: Metadata = {
  title: "FirIntins — Echipamente pescuit la crap",
  description: "Lansete, muliete și accesorii de pescuit la crap premium",
  alternates: { canonical: `${BASE_URL}/` },
  openGraph: {
    title: "FirIntins",
    description: "Echipamente premium de pescuit la crap",
    url: `${BASE_URL}/`,
    images: [{ url: `${BASE_URL}/og-default.jpg` }],
  },
}

export default async function HomePage() {
  await connection()

  let initialData: any = null
  const prefetchedProducts: Record<string, any[]> = {}

  try {
    initialData = await getHomepage()

    // Pre-fetch Medusa products for FeaturedProductsBlocks so the client-side
    // live preview can render them without async server calls
    const blocks = (initialData?.blocks ?? []) as any[]
    const featuredBlocks = blocks.filter(
      (b: any) => b.blockType === "featuredProducts" && b.id,
    )
    await Promise.all(
      featuredBlocks.map(async (block: any) => {
        const handles = (block.productHandles ?? [])
          .map((h: any) => h.handle)
          .filter(Boolean) as string[]
        const products = (
          await Promise.all(handles.map((h) => getProduct(h).catch(() => null)))
        ).filter(Boolean)
        prefetchedProducts[block.id] = products
      }),
    )
  } catch {
    // CMS or Medusa unavailable on first load — render empty shell
  }

  return (
    <main className="bg-bg">
      <HomepageContent
        initialData={initialData}
        serverURL={serverURL}
        prefetchedProducts={prefetchedProducts}
      />
    </main>
  )
}
