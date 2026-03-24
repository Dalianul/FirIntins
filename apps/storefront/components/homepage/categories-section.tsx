import { getCategories } from "@/lib/medusa/queries"
import { CategoriesSectionClient } from "./categories-section-client"

export async function CategoriesSection() {
  const categories = await getCategories()

  return (
    <section className="py-20 px-4">
      <h2 className="font-cormorant text-5xl text-cream mb-12 text-center">
        Categorii
      </h2>
      <CategoriesSectionClient categories={categories} />
    </section>
  )
}
