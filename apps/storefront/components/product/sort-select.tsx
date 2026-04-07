"use client"

import { useRouter, useSearchParams } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const SORT_OPTIONS = [
  { value: "relevance",  label: "Relevanță" },
  { value: "price_asc",  label: "Preț crescător" },
  { value: "price_desc", label: "Preț descrescător" },
  { value: "newest",     label: "Cele mai noi" },
  { value: "title_asc",  label: "Titlu A–Z" },
] as const

interface Props {
  sort: string
}

export default function SortSelect({ sort }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "relevance") {
      params.delete("sort")
    } else {
      params.set("sort", value)
    }
    params.delete("page")
    router.push("/produse?" + params.toString())
  }

  return (
    <Select value={sort || "relevance"} onValueChange={handleChange} items={SORT_OPTIONS}>
      <SelectTrigger className="ml-auto min-w-[10rem]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
