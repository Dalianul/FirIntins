import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Coș | FirIntins",
  robots: { index: false },
}

export default function CartPage() {
  return (
    <main className="bg-bg min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="font-cormorant text-4xl text-cream mb-4">Coș de cumpărături</h1>
        <p className="text-fog mb-6">
          Coșul tău este gestionat de JavaScript. Dacă nu ai activat JS, navigheaza la checkout
          direct.
        </p>
        <a href="/checkout" className="inline-block px-6 py-2 bg-moss text-white rounded">
          Finalizează comanda
        </a>
      </div>
    </main>
  )
}
