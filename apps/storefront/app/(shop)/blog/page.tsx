import type { Metadata } from "next"
import { getCachedPosts, getCachedCategories } from "@/lib/cms/client"
import { BlogListing } from "./blog-listing"

type Category = { id: string; slug: string; name: string }
type Post = Record<string, unknown>

export const metadata: Metadata = {
  title: "Blog — FirIntins",
  description: "Ghiduri, noutăți și articole despre pescuitul la crap.",
}

export default async function BlogPage() {
  const [posts, categories] = (await Promise.all([
    getCachedPosts(),
    getCachedCategories(),
  ])) as unknown as [Post[], Category[]]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-10">
        <h1 className="font-cormorant text-4xl sm:text-5xl font-semibold text-[--color-white] mb-3">
          Blog
        </h1>
        <p className="text-[--color-fog] text-lg">
          Ghiduri, noutăți și articole despre pescuitul la crap.
        </p>
      </header>
      <BlogListing posts={posts} categories={categories} />
    </div>
  )
}
