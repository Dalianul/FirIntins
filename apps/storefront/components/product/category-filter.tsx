"use client"

import { useRouter, useSearchParams } from "next/navigation"

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
    <select
      value={category || ""}
      onChange={handleChange}
      className="bg-[--color-surface] border border-[--color-fog]/20 text-sm text-[--color-fog] rounded px-3 py-1.5 focus:outline-none focus:border-[--color-moss] cursor-pointer"
    >
      <option value="">Toate categoriile</option>
      {categories.map((cat) => (
        <option key={cat.id} value={cat.id}>
          {cat.name}
        </option>
      ))}
    </select>
  )
}
