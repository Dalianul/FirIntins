"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Props {
  priceMin: string
  priceMax: string
}

export function PriceFilter({ priceMin, priceMax }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [minPrice, setMinPrice] = useState(priceMin)
  const [maxPrice, setMaxPrice] = useState(priceMax)

  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString())
    if (minPrice) {
      params.set("price_min", minPrice)
    } else {
      params.delete("price_min")
    }
    if (maxPrice) {
      params.set("price_max", maxPrice)
    } else {
      params.delete("price_max")
    }
    params.delete("page")
    router.push("/produse?" + params.toString())
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        placeholder="Preț min"
        value={minPrice}
        onChange={(e) => setMinPrice(e.target.value)}
        className="w-24 bg-[--color-surface] border-[--color-fog]/20 text-[--color-fog] text-sm"
      />
      <span className="text-[--color-fog]/40 text-sm">–</span>
      <Input
        type="number"
        placeholder="Preț max"
        value={maxPrice}
        onChange={(e) => setMaxPrice(e.target.value)}
        className="w-24 bg-[--color-surface] border-[--color-fog]/20 text-[--color-fog] text-sm"
      />
      <Button
        onClick={handleApply}
        size="sm"
        className="bg-[--color-moss] text-white hover:bg-[--color-moss-light]"
      >
        Aplică
      </Button>
    </div>
  )
}
