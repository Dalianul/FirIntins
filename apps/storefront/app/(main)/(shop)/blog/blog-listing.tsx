"use client"

import { useState } from "react"
import { PostCard } from "@/components/blog/post-card"
import { CategoryFilter } from "@/components/blog/category-filter"

type Category = { id: string; slug: string; name: string }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Post = any

export function BlogListing({
  posts,
  categories,
}: {
  posts: Post[]
  categories: Category[]
}) {
  const [selected, setSelected] = useState<string | null>(null)

  const filtered = selected
    ? posts.filter(
        (p) =>
          typeof p.category === "object" && p.category?.slug === selected
      )
    : posts

  return (
    <>
      {categories.length > 0 && (
        <div className="mb-8">
          <CategoryFilter
            categories={categories}
            selected={selected}
            onSelect={setSelected}
          />
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-[--color-fog] text-center py-16">
          Niciun articol în această categorie.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((post, i) => (
            <PostCard key={post.id} post={post} priority={i === 0} />
          ))}
        </div>
      )}
    </>
  )
}
