"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { ChevronDown } from "lucide-react"

interface Category {
  id: string
  name: string
}

interface Props {
  categories: Category[]
  category: string
}

export function CategoryFilter({ categories, category }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString())
    if (e.target.value === "") {
      params.delete("category")
    } else {
      params.set("category", e.target.value)
    }
    params.delete("page")
    router.push("/produse?" + params.toString())
  }

  return (
    <div className="relative">
      <select
        value={category || ""}
        onChange={handleChange}
        className="appearance-none bg-[--color-surface] border border-[--color-fog]/20 text-sm text-[--color-fog] rounded px-3 pr-8 py-1.5 focus:outline-none focus:border-[--color-moss] cursor-pointer"
      >
        <option value="" className="bg-[#1a1814] text-[#c4bfb0]">Toate categoriile</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id} className="bg-[#1a1814] text-[#c4bfb0]">
            {cat.name}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[--color-fog]/60" />
    </div>
  )
}
