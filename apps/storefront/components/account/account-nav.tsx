"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogoutButton } from "@/components/account/logout-button"

const navItems = [
  { label: "Tablou de bord", href: "/cont" },
  { label: "Comenzile mele", href: "/cont/comenzi" },
  { label: "Lista de dorinte", href: "/cont/dorinte" },
  { label: "Adresele mele", href: "/cont/adrese" },
  { label: "Profilul meu", href: "/cont/profil" },
  { label: "Securitate", href: "/cont/securitate" },
]

export function AccountNav() {
  const pathname = usePathname()

  return (
    <aside className="md:w-56 shrink-0">
      <nav className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible gap-1 pb-4 md:pb-0 border-b md:border-b-0 border-border md:border-0">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`whitespace-nowrap px-4 py-2 rounded text-sm transition-colors ${
              pathname === item.href
                ? "bg-moss text-white"
                : "text-fog hover:bg-surface-2 hover:text-cream"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="hidden md:block mt-4 pt-4 border-t border-border">
        <LogoutButton />
      </div>
    </aside>
  )
}
