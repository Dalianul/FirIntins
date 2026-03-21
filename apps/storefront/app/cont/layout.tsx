import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "Contul meu | Fir Intins",
  robots: { index: false },
}

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <main className="bg-bg min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="font-cormorant text-5xl text-cream mb-8">Contul meu</h1>
        {children}
      </div>
    </main>
  )
}
