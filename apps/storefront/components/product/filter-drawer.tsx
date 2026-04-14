"use client"

import { useState } from "react"
import Link from "next/link"
import { SlidersHorizontal } from "lucide-react"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button, buttonVariants } from "@/components/ui/button"
import { CategoryFilter } from "./category-filter"
import { PriceFilter } from "./price-filter"
import InStockToggle from "./in-stock-toggle"
import SortSelect from "./sort-select"

interface Category {
  id: string
  name: string
}

interface FilterDrawerProps {
  categories: Category[]
  category: string
  priceMin: string
  priceMax: string
  inStock: boolean
  sort: string
  hasActiveFilters: boolean
}

export function FilterDrawer({
  categories,
  category,
  priceMin,
  priceMax,
  inStock,
  sort,
  hasActiveFilters,
}: FilterDrawerProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          className={buttonVariants({ variant: "brandOutline", size: "heroInline" })}
        >
          <SlidersHorizontal />
          Filtre
          {hasActiveFilters && (
            <span className="ml-1 inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-moss text-[#ffffff] text-[10px] font-medium px-1">
              •
            </span>
          )}
        </SheetTrigger>

        <SheetContent
          side="right"
          className="w-full sm:max-w-sm bg-surface text-[#1c1a15] border-l border-fog/20 overflow-y-auto"
        >
          <SheetHeader className="border-b border-fog/20">
            <SheetTitle className="font-cormorant text-2xl text-[#1c1a15]">
              Filtre
            </SheetTitle>
          </SheetHeader>

          <div className="flex flex-col gap-6 px-4 pb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-fog mb-2 font-outfit">
                Categorie
              </p>
              <CategoryFilter categories={categories} category={category} />
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-fog mb-2 font-outfit">
                Sortează
              </p>
              <SortSelect sort={sort} />
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-fog mb-2 font-outfit">
                Preț
              </p>
              <PriceFilter priceMin={priceMin} priceMax={priceMax} />
            </div>

            <div>
              <InStockToggle inStock={inStock} />
            </div>
          </div>

          <div className="mt-auto flex flex-col gap-3 p-4 border-t border-fog/20">
            {hasActiveFilters && (
              <Link
                href="/produse"
                onClick={() => setOpen(false)}
                className="text-center text-sm text-moss hover:text-moss-light transition-colors"
              >
                Resetează filtrele
              </Link>
            )}
            <Button
              onClick={() => setOpen(false)}
              variant="brand"
              size="heroInline"
              className="w-full justify-center"
            >
              Vezi rezultate
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
