import { Suspense } from "react"
import { Metadata } from "next"
import { Hero } from "@/components/homepage/hero"
import { CategoriesSection } from "@/components/homepage/categories-section"
import { NewsSection } from "@/components/homepage/news-section"
import { WhyFirIntins } from "@/components/homepage/why-firintins"
import { NewsletterSection } from "@/components/homepage/newsletter-section"

export const metadata: Metadata = {
  title: "FirIntins — Echipamente premium de pescuit la crap",
  description: "Lansete, muliete, și accesorii de pescuit la crap premium",
  openGraph: {
    title: "FirIntins",
    description: "Echipamente premium de pescuit la crap",
    url: "https://firintins.ro",
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
