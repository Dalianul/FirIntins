import type { Metadata } from "next"
import { Cormorant_Garamond, Outfit } from "next/font/google"
import { Suspense } from "react"
import { LazyMotion, domAnimation } from "motion/react"
import { CartProvider } from "@/context/cart-context"
import { WishlistProvider } from "@/context/wishlist-context"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { CookieConsent } from "@/components/cookie-consent/cookie-consent"
import "../globals.css"

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
})

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-outfit",
  display: "swap",
})

export const metadata: Metadata = {
  title: "FirIntins — Echipamente Pescuit Premium",
  description: "E-commerce ultra-premium echipamente pescuit la crap în România.",
  openGraph: {
    title: "FirIntins",
    description: "Echipamente pescuit premium",
    url: "https://firintins.ro",
    type: "website",
  },
}

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ro" className={`${cormorant.variable} ${outfit.variable}`}>
      <body className="bg-[--color-bg] text-[--color-cream]">
        <LazyMotion features={domAnimation}>
          <CartProvider>
            <WishlistProvider>
              <Header />
              <main className="min-h-screen">{children}</main>
              <Suspense fallback={null}>
                <Footer />
              </Suspense>
              <CookieConsent />
            </WishlistProvider>
          </CartProvider>
        </LazyMotion>
      </body>
    </html>
  )
}
