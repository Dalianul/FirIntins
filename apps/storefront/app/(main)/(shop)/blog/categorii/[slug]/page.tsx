import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { getCachedPosts, getCachedCategories } from "@/lib/cms/client"
import { PostCard } from "@/components/blog/post-card"
import { BASE_URL } from "@/lib/constants"

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const categories = await getCachedCategories()
  return categories.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const categories = await getCachedCategories()
  const category = categories.find((c) => c.slug === slug)
  if (!category) return {}
  return {
    title: `${category.name} — FirIntins Blog`,
    description: `Articole din categoria ${category.name}.`,
    alternates: { canonical: `${BASE_URL}/blog/categorii/${slug}` },
    openGraph: {
      title: `${category.name} — FirIntins Blog`,
      url: `${BASE_URL}/blog/categorii/${slug}`,
      images: [{ url: `${BASE_URL}/og-default.jpg` }],
    },
  }
}

export default async function BlogCategoryPage({ params }: Props) {
  const { slug } = await params
  const [posts, categories] = await Promise.all([
    getCachedPosts(slug),
    getCachedCategories(),
  ])

  const category = categories.find((c) => c.slug === slug)
  if (!category) notFound()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <nav className="text-sm text-[--color-fog] mb-6 flex gap-2 items-center">
        <Link href="/blog" className="hover:text-[--color-moss]">Blog</Link>
        <span>/</span>
        <span className="text-[--color-cream]">{category.name}</span>
      </nav>

      <header className="mb-10">
        <h1 className="font-cormorant text-4xl sm:text-5xl font-semibold text-[--color-white] mb-3">
          {category.name}
        </h1>
        <p className="text-[--color-fog]">{posts.length} articole</p>
      </header>

      {posts.length === 0 ? (
        <p className="text-[--color-fog] text-center py-16">
          Niciun articol în această categorie.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}
