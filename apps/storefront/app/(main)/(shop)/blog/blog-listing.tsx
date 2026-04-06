"use client"

import { useState } from "react"
import { m } from "motion/react"
import { PostCard } from "@/components/blog/post-card"
import { CategoryFilter } from "@/components/blog/category-filter"

type Category = { id: string; slug: string; name: string }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Post = any

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

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
        <m.div
          key={selected ?? "all"}
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filtered.map((post, i) => (
            <m.div key={post.id} variants={item}>
              <PostCard post={post} priority={i === 0} />
            </m.div>
          ))}
        </m.div>
      )}
    </>
  )
}
