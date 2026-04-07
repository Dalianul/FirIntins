"use client"

import { Suspense, useState } from "react"
import type { ReactNode } from "react"
import Link from "next/link"
import { ShoppingCart } from "lucide-react"
import { useCart } from "@/hooks/use-cart"
import { CartDrawer } from "@/components/cart/cart-drawer"
import SearchButton from "@/components/layout/search-button"

export default function Header({ nav }: { nav?: ReactNode }) {
  const { itemCount } = useCart()
  const [isCartOpen, setIsCartOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-[--color-border] [background:color-mix(in_srgb,var(--color-bg-light)_92%,transparent)] backdrop-blur-md shadow-[0_2px_12px_rgba(0,0,0,0.5)] transition-all duration-300">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-semibold font-cormorant text-[--color-white]"
        >
          FirIntins
        </Link>

        {/* Dynamic Nav — passed from Server Component parent */}
        {nav ?? (
          <div className="hidden md:flex gap-8">
            {["Produse", "Categorii", "Blog", "Oferte"].map((label) => (
              <span key={label} className="text-[--color-cream] opacity-50">{label}</span>
            ))}
          </div>
        )}

        {/* Right Actions */}
        <div className="flex gap-4 items-center">
          <Suspense>
            <SearchButton />
          </Suspense>
          <Link
            href="/cont"
            className="text-[--color-cream] hover:text-[--color-moss] transition-colors"
          >
            Cont
          </Link>
          <div className="relative">
            <button
              onClick={() => setIsCartOpen(!isCartOpen)}
              aria-label="Coș de cumpărături"
              className="relative text-[--color-cream] hover:text-[--color-moss] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-moss] rounded-sm p-1"
            >
              <ShoppingCart size={20} strokeWidth={1.5} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[--color-moss] text-white text-[10px] font-outfit font-semibold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  )
}
