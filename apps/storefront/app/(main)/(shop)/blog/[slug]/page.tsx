import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { getCachedPost, getCachedPosts, calcReadTime } from "@/lib/cms/client"
import { PostContent } from "@/components/blog/post-content"
import { PostCard } from "@/components/blog/post-card"
import { BASE_URL } from "@/lib/constants"

type Props = { params: Promise<{ slug: string }> }

const mediaUrl = (url: string) => { try { return new URL(url).pathname } catch { return url } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getCachedPost(slug)
  if (!post) return {}
  return {
    title: `${post.title} — FirIntins Blog`,
    description: post.excerpt ?? undefined,
    alternates: { canonical: `${BASE_URL}/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      url: `${BASE_URL}/blog/${slug}`,
    },
  }
}

export async function generateStaticParams() {
  const posts = await getCachedPosts()
  return posts.map((p) => ({ slug: p.slug }))
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = await getCachedPost(slug)
  if (!post) notFound()

  const readTime = calcReadTime(post.content)
  const date = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("ro-RO", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null

  const categorySlug =
    typeof post.category === "object" ? post.category?.slug : null
  const categoryName =
    typeof post.category === "object" ? post.category?.name : null

  // Related posts: same category, max 3, exclude current
  const relatedPosts = categorySlug
    ? (await getCachedPosts(categorySlug))
        .filter((p) => p.slug !== slug)
        .slice(0, 3)
    : []

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      {/* Breadcrumb */}
      <nav className="text-sm text-[--color-fog] mb-6 flex gap-2 items-center">
        <Link href="/blog" className="hover:text-[--color-moss]">Blog</Link>
        {categoryName && categorySlug && (
          <>
            <span>/</span>
            <Link
              href={`/blog/categorii/${categorySlug}`}
              className="hover:text-[--color-moss]"
            >
              {categoryName}
            </Link>
          </>
        )}
      </nav>

      {/* Title */}
      <h1 className="font-cormorant text-3xl sm:text-4xl font-semibold text-[--color-white] leading-tight mb-4">
        {post.title}
      </h1>

      {/* Meta */}
      <div className="flex items-center gap-4 text-sm text-[--color-fog] mb-8">
        <span>{post.author ?? "Redacție"}</span>
        {date && <span>{date}</span>}
        <span>{readTime} min citire</span>
      </div>

      {/* Cover image */}
      {post.coverImage?.url && (
        <div className="relative aspect-[16/9] rounded-lg overflow-hidden mb-8 border border-[--color-border]">
          <Image
            src={mediaUrl(post.coverImage.url)}
            alt={post.coverImage.alt ?? post.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1200px"
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Content */}
      <PostContent content={post.content} />

      {/* Related posts */}
      {relatedPosts.length > 0 && (
        <section className="mt-16 pt-8 border-t border-[--color-border]">
          <h2 className="font-cormorant text-2xl font-semibold text-[--color-white] mb-6">
            Articole similare
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relatedPosts.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
