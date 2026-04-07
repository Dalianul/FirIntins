"use client"

import { useRouter, useSearchParams } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "") {
      params.delete("category")
    } else {
      params.set("category", value)
    }
    params.delete("page")
    router.push("/produse?" + params.toString())
  }

  const items = [
    { value: "", label: "Toate categoriile" },
    ...categories.map((cat) => ({ value: cat.id, label: cat.name })),
  ]

  return (
    <Select value={category || ""} onValueChange={handleChange} items={items}>
      <SelectTrigger>
        <SelectValue placeholder="Toate categoriile" />
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
