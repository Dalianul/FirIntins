"use client"

import { useRouter, useSearchParams } from "next/navigation"

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

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString())
    if (e.target.value === "relevance") {
      params.delete("sort")
    } else {
      params.set("sort", e.target.value)
    }
    params.delete("page")
    router.push("/produse?" + params.toString())
  }

  return (
    <select
      value={sort || "relevance"}
      onChange={handleChange}
      className="ml-auto bg-[--color-surface] border border-[--color-fog]/20 text-sm text-[--color-fog] rounded px-3 pr-8 py-1.5 focus:outline-none focus:border-[--color-moss] cursor-pointer"
    >
      {SORT_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value} className="bg-[#1a1814] text-[#c4bfb0]">
          {opt.label}
        </option>
      ))}
    </select>
  )
}
