import { Metadata } from "next"
import { CartPageContent } from "@/components/cart/cart-page-content"

export const metadata: Metadata = {
  title: "Coș | FirIntins",
  robots: { index: false },
}

export default function CartPage() {
  return (
    <main className="bg-bg min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="font-cormorant text-4xl text-cream mb-8">Coș de cumpărături</h1>
        <CartPageContent />
      </div>
    </main>
  )
}
