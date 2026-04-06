import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getCachedPost, getCachedPosts } from "@/lib/cms/client"
import { PostLivePreviewWrapper } from "@/components/blog/PostLivePreviewWrapper"
import { PostCard } from "@/components/blog/post-card"
import { BASE_URL } from "@/lib/constants"

type Props = { params: Promise<{ slug: string }> }

const mediaUrl = (url: string) => { try { return new URL(url).pathname } catch { return url } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getCachedPost(slug)
  if (!post) return {}

  const metaTitle = (post as any).meta?.title as string | null | undefined
  const metaDescription = (post as any).meta?.description as string | null | undefined
  const metaImageRaw = (post as any).meta?.image
  const metaImageUrl =
    typeof metaImageRaw === "object" && metaImageRaw?.url
      ? mediaUrl(metaImageRaw.url as string)
      : null

  return {
    title: metaTitle ?? `${post.title} — FirIntins Blog`,
    description: metaDescription ?? post.excerpt ?? undefined,
    alternates: { canonical: `${BASE_URL}/blog/${slug}` },
    openGraph: {
      title: metaTitle ?? post.title,
      description: metaDescription ?? post.excerpt ?? undefined,
      url: `${BASE_URL}/blog/${slug}`,
      images: metaImageUrl
        ? [{ url: metaImageUrl }]
        : [{ url: `${BASE_URL}/og-default.jpg` }],
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

  const categorySlug =
    typeof post.category === "object" ? post.category?.slug : null

  // Related posts: same category, max 3, exclude current
  const relatedPosts = categorySlug
    ? (await getCachedPosts(categorySlug))
        .filter((p) => p.slug !== slug)
        .slice(0, 3)
    : []

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      {/* Live preview updates title, content, cover image, meta in real-time */}
      <PostLivePreviewWrapper initialPost={post} />

      {/* Related posts — server-fetched, not live-previewed */}
      {relatedPosts.length > 0 && (
        <section className="mt-16 pt-8 border-t border-[--color-border]">
          <h2 className="font-cormorant text-2xl font-semibold text-[--color-white] mb-6">
            Articole similare
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relatedPosts.map((p) => (
              <PostCard key={p.id} post={p as any} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
