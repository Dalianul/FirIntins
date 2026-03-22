"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  { label: "Tablou de bord", href: "/cont" },
  { label: "Comenzile mele", href: "/cont/comenzi" },
  { label: "Lista de dorinte", href: "/cont/wishlist" },
]

export function AccountNav() {
  const pathname = usePathname()

  return (
    <nav className="space-y-2 mb-8 border-b border-border pb-4">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`block px-4 py-2 rounded transition-colors ${
            pathname === item.href
              ? "bg-moss text-white"
              : "text-fog hover:bg-surface-2 hover:text-cream"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
