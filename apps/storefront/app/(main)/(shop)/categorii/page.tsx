import type { Metadata } from "next"
import Link from "next/link"
import { BASE_URL } from "@/lib/constants"
import { getCategories } from "@/lib/medusa/queries"
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
  title: "Categorii — FirIntins",
  description: "Toate categoriile de echipamente pescuit la crap disponibile în magazinul FirIntins.",
  alternates: { canonical: `${BASE_URL}/categorii` },
  openGraph: {
    title: "Categorii — FirIntins",
    url: `${BASE_URL}/categorii`,
    images: [{ url: `${BASE_URL}/og-default.jpg` }],
  },
}

export default async function CategoriiPage() {
  const categories = await getCategories()

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
              <BreadcrumbPage>Categorii</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="font-cormorant text-4xl text-cream mb-8">Categorii</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat: any) => (
            <Link key={cat.id} href={`/categorii/${cat.handle}`}>
              <div className="p-6 bg-surface rounded border border-border hover:border-moss transition-colors cursor-pointer">
                <h2 className="font-cormorant text-2xl text-white">{cat.name}</h2>
                {cat.description && (
                  <p className="text-fog text-sm mt-2 line-clamp-2">{cat.description}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
