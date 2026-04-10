"use client"

import { useRouter, useSearchParams } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"

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

  function handleChange(value: string | null) {
    if (value === null) return
    const params = new URLSearchParams(searchParams.toString())
    if (value === "") {
      params.delete("category")
    } else {
      params.set("category", value)
    }
    params.delete("page")
    router.push("/produse?" + params.toString())
  }

  const currentLabel =
    (category ? categories.find((c) => c.id === category)?.name : null) ?? "Toate categoriile"

  return (
    <Select value={category || ""} onValueChange={handleChange}>
      <SelectTrigger className="min-w-[11rem]">
        {currentLabel}
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="">Toate categoriile</SelectItem>
        {categories.map((cat) => (
          <SelectItem key={cat.id} value={cat.id}>
            {cat.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
