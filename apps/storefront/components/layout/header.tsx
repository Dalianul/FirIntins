"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useCart } from "@/hooks/use-cart"
import { CartDrawer } from "@/components/cart/cart-drawer"
import SearchButton from "@/components/layout/search-button"
import { HeaderNav } from "@/components/layout/HeaderNav"

export default function Header() {
  const { itemCount } = useCart()
  const [isCartOpen, setIsCartOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 bg-[--color-bg] border-b border-[--color-border] transition-all duration-300">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-semibold font-cormorant text-[--color-white]"
        >
          FirIntins
        </Link>

        {/* Dynamic Nav (server component wrapped in Suspense) */}
        <Suspense
          fallback={
            <div className="hidden md:flex gap-8">
              {["Produse", "Categorii", "Blog", "Oferte"].map((label) => (
                <span key={label} className="text-[--color-cream] opacity-50">{label}</span>
              ))}
            </div>
          }
        >
          <HeaderNav />
        </Suspense>

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
              className="relative text-[--color-cream] hover:text-[--color-moss] transition-colors"
            >
              🛒
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[--color-moss] text-[--color-white] text-xs rounded-full w-5 h-5 flex items-center justify-center">
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
