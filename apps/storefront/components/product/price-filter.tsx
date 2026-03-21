"use client"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

export function PriceFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [minPrice, setMinPrice] = useState(searchParams.get("price_min") || "")
  const [maxPrice, setMaxPrice] = useState(searchParams.get("price_max") || "")

  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString())
    if (minPrice) params.set("price_min", minPrice)
    if (maxPrice) params.set("price_max", maxPrice)
    params.delete("page")
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="space-y-4">
      <h3 className="font-outfit font-500 text-cream">Preț</h3>
      <div className="space-y-2">
        <Input
          type="number"
          placeholder="Min"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          className="bg-surface-2 border-border text-cream"
        />
        <Input
          type="number"
          placeholder="Max"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="bg-surface-2 border-border text-cream"
        />
        <Button onClick={handleApply} className="w-full bg-moss">Aplică</Button>
      </div>
      <Separator className="bg-border" />
    </div>
  )
}
