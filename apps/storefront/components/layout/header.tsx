"use client"

import { Suspense, useState } from "react"
import type { ReactNode } from "react"
import Link from "next/link"
import { ShoppingCart } from "lucide-react"
import { m } from "motion/react"
import { useCart } from "@/hooks/use-cart"
import { useScrollDirection } from "@/hooks/use-scroll-direction"
import { CartDrawer } from "@/components/cart/cart-drawer"
import SearchButton from "@/components/layout/search-button"

export default function Header({ nav }: { nav?: ReactNode }) {
  const { itemCount } = useCart()
  const [isCartOpen, setIsCartOpen] = useState(false)
  const scrollDirection = useScrollDirection()

  return (
    <m.header
      animate={{ y: scrollDirection === "down" ? -64 : 0 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="sticky top-0 z-50 border-b border-[--color-border] [background:color-mix(in_srgb,var(--color-bg-light)_92%,transparent)] backdrop-blur-md shadow-[0_2px_12px_rgba(0,0,0,0.5)]"
    >
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
        <div className="flex gap-2 items-center">
          <Suspense>
            <SearchButton />
          </Suspense>
          <Link
            href="/cont"
            className="h-9 px-3 flex items-center rounded-md text-sm text-[--color-cream] hover:text-[--color-white] hover:bg-[rgba(74,94,58,0.12)] transition-colors duration-150"
          >
            Cont
          </Link>
          <button
            onClick={() => setIsCartOpen(!isCartOpen)}
            aria-label="Coș de cumpărături"
            className="relative h-9 px-3 flex items-center gap-1.5 rounded-md border border-[rgba(74,94,58,0.25)] bg-[rgba(74,94,58,0.08)] text-[--color-cream] hover:border-[rgba(74,94,58,0.5)] hover:bg-[rgba(74,94,58,0.18)] hover:text-[--color-white] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-moss]"
          >
            <ShoppingCart size={16} strokeWidth={1.5} />
            {itemCount > 0 && (
              <span className="text-xs font-outfit font-semibold tabular-nums text-[--color-moss]">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </nav>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </m.header>
  )
}
