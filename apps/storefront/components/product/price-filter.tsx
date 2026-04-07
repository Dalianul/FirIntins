"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Props {
  priceMin: string
  priceMax: string
}

const STEP = 10

function StepButton({
  onClick,
  children,
}: {
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-[34px] w-6 flex items-center justify-center [background:var(--color-surface)] border border-[--color-fog]/20 text-[--color-fog]/60 hover:text-[--color-fog] hover:bg-[--color-bg-light] text-base leading-none transition-colors"
    >
      {children}
    </button>
  )
}

export function PriceFilter({ priceMin, priceMax }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [minPrice, setMinPrice] = useState(priceMin)
  const [maxPrice, setMaxPrice] = useState(priceMax)

  useEffect(() => {
    setMinPrice(priceMin)
    setMaxPrice(priceMax)
  }, [priceMin, priceMax])

  function adjustMin(delta: number) {
    const next = Math.max(0, (Number(minPrice) || 0) + delta)
    setMinPrice(String(next))
  }

  function adjustMax(delta: number) {
    const next = Math.max(0, (Number(maxPrice) || 0) + delta)
    setMaxPrice(String(next))
  }

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
      {/* Min stepper */}
      <div className="flex items-center">
        <StepButton onClick={() => adjustMin(-STEP)}>−</StepButton>
        <Input
          type="text"
          inputMode="numeric"
          placeholder="Preț min"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          className="w-20 rounded-none border-x-0 text-center [background:var(--color-surface)] border-[--color-fog]/20 text-[--color-fog] placeholder:text-[--color-fog]/40 text-sm focus-visible:ring-[--color-moss]"
        />
        <StepButton onClick={() => adjustMin(STEP)}>+</StepButton>
      </div>

      <span className="text-[--color-fog]/40 text-sm">–</span>

      {/* Max stepper */}
      <div className="flex items-center">
        <StepButton onClick={() => adjustMax(-STEP)}>−</StepButton>
        <Input
          type="text"
          inputMode="numeric"
          placeholder="Preț max"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="w-20 rounded-none border-x-0 text-center [background:var(--color-surface)] border-[--color-fog]/20 text-[--color-fog] placeholder:text-[--color-fog]/40 text-sm focus-visible:ring-[--color-moss]"
        />
        <StepButton onClick={() => adjustMax(STEP)}>+</StepButton>
      </div>

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
