import type { Metadata, Viewport } from "next"
import { Cormorant_Garamond, Outfit } from "next/font/google"
import { Suspense } from "react"
import { LazyMotion, domAnimation } from "motion/react"
import { BASE_URL } from "@/lib/constants"
import { CartProvider } from "@/context/cart-context"
import { WishlistProvider } from "@/context/wishlist-context"
import { Analytics } from "@/components/analytics/analytics"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { CookieConsent } from "@/components/cookie-consent/cookie-consent"
import { PageTransition } from "@/components/layout/page-transition"
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
}

export const metadata: Metadata = {
  title: "FirIntins — Echipamente Pescuit Premium",
  description: "E-commerce ultra-premium echipamente pescuit la crap în România.",
  openGraph: {
    title: "FirIntins",
    description: "Echipamente pescuit premium",
    url: BASE_URL,
    type: "website",
  },
}

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ro" className={`${cormorant.variable} ${outfit.variable}`} suppressHydrationWarning>
      <body className="bg-[--color-bg] text-[--color-cream]" suppressHydrationWarning>
        <LazyMotion features={domAnimation}>
          <CartProvider>
            <WishlistProvider>
              <Header />
              <PageTransition>
                {children}
              </PageTransition>
              <Suspense fallback={null}>
                <Footer />
              </Suspense>
              <Analytics />
              <CookieConsent />
            </WishlistProvider>
          </CartProvider>
        </LazyMotion>
      </body>
    </html>
  )
}
