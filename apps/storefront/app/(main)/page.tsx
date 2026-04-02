import { Suspense } from "react"
import type { Metadata } from "next"
import { BASE_URL } from "@/lib/constants"
import { Hero } from "@/components/homepage/hero"
import { CategoriesSection } from "@/components/homepage/categories-section"
import { NewsSection } from "@/components/homepage/news-section"
import { WhyFirIntins } from "@/components/homepage/why-firintins"
import { NewsletterSection } from "@/components/homepage/newsletter-section"

export const dynamic = "force-dynamic"

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

export default function HomePage() {
  return (
    <main className="bg-bg">
      <Hero />
      <Suspense fallback={null}><CategoriesSection /></Suspense>
      <Suspense fallback={null}><NewsSection /></Suspense>
      <WhyFirIntins />
      <NewsletterSection />
    </main>
  )
}
