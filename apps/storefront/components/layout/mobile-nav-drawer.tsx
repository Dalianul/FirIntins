"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, User, Heart } from "lucide-react"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

interface NavItem {
  label: string
  url: string
  newTab?: boolean | null
}

interface MobileNavDrawerProps {
  items: NavItem[]
}

export function MobileNavDrawer({ items }: MobileNavDrawerProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          aria-label="Meniu"
          className="h-11 w-11 inline-flex items-center justify-center rounded-md text-fog hover:text-[#1c1a15] hover:bg-[rgba(61,86,48,0.12)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss"
        >
          <Menu size={20} strokeWidth={1.5} />
        </SheetTrigger>

        <SheetContent
          side="left"
          className="w-[82%] sm:max-w-sm bg-surface text-[#1c1a15] border-r border-fog/20 overflow-y-auto p-0"
        >
          <SheetHeader className="px-6 pt-6 pb-4 border-b border-fog/20">
            <SheetTitle className="font-cormorant text-2xl text-[#1c1a15]">
              FirIntins
            </SheetTitle>
          </SheetHeader>

          <nav className="flex flex-col px-2 py-3">
            {items.map((item) => (
              <Link
                key={item.url}
                href={item.url}
                target={item.newTab ? "_blank" : undefined}
                rel={item.newTab ? "noopener noreferrer" : undefined}
                onClick={() => setOpen(false)}
                className="px-4 py-3 text-base font-outfit text-[#1c1a15] hover:bg-[rgba(61,86,48,0.08)] rounded-md transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto flex flex-col gap-1 px-2 py-3 border-t border-fog/20">
            <Link
              href="/cont"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-base font-outfit text-[#1c1a15] hover:bg-[rgba(61,86,48,0.08)] rounded-md transition-colors"
            >
              <User size={18} strokeWidth={1.5} />
              Contul meu
            </Link>
            <Link
              href="/cont/wishlist"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-base font-outfit text-[#1c1a15] hover:bg-[rgba(61,86,48,0.08)] rounded-md transition-colors"
            >
              <Heart size={18} strokeWidth={1.5} />
              Listă de dorințe
            </Link>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
