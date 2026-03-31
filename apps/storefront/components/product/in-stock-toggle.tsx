"use client"

import { useRouter, useSearchParams } from "next/navigation"

interface Props {
  inStock: boolean
}

export default function InStockToggle({ inStock }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function toggle() {
    const params = new URLSearchParams(searchParams.toString())
    if (inStock) {
      params.delete("in_stock")
    } else {
      params.set("in_stock", "true")
    }
    params.delete("page")
    router.push("/produse?" + params.toString())
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={inStock}
      className={`flex items-center gap-2 text-sm transition-colors ${
        inStock
          ? "text-[--color-moss]"
          : "text-[--color-fog]/60 hover:text-[--color-fog]"
      }`}
    >
      <span
        className={`relative inline-flex w-8 h-4 rounded-full transition-colors ${
          inStock
            ? "bg-[--color-moss]"
            : "bg-[--color-surface] border border-[--color-fog]/30"
        }`}
      >
        <span
          className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${
            inStock ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </span>
      În stoc
    </button>
  )
}
