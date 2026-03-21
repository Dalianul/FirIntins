"use client"
import { useRouter, useSearchParams } from "next/navigation"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

interface Category {
  id: string
  name: string
}

interface CategoryFilterProps {
  categories: Category[]
}

export function CategoryFilter({ categories }: CategoryFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedCategories = searchParams.getAll("category")

  const handleToggle = (categoryId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    const values = params.getAll("category")
    if (values.includes(categoryId)) {
      params.delete("category")
      values.filter((v) => v !== categoryId).forEach((v) => params.append("category", v))
    } else {
      params.append("category", categoryId)
    }
    params.delete("page")
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="space-y-4">
      <h3 className="font-outfit font-500 text-cream">Categorii</h3>
      <div className="space-y-2">
        {categories.map((cat) => (
          <div key={cat.id} className="flex items-center">
            <Checkbox
              id={cat.id}
              checked={selectedCategories.includes(cat.id)}
              onCheckedChange={() => handleToggle(cat.id)}
            />
            <Label htmlFor={cat.id} className="ml-2 text-fog text-sm cursor-pointer">
              {cat.name}
            </Label>
          </div>
        ))}
      </div>
      <Separator className="bg-border" />
    </div>
  )
}
