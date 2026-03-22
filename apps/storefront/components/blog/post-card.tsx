import Link from "next/link"
import Image from "next/image"
import { calcReadTime } from "@/lib/cms/read-time"

type Category = { name: string; slug: string }
type MediaImage = { url?: string | null; alt?: string | null }

type Post = {
  slug: string
  title: string
  excerpt?: string | null
  author?: string | null
  publishedAt?: string | null
  content?: unknown
  category?: Category | null
  coverImage?: MediaImage | null
}

export function PostCard({ post }: { post: Post }) {
  const readTime = calcReadTime(post.content)
  const date = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("ro-RO", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null

  return (
    <article className="group flex flex-col bg-[--color-surface] border border-[--color-border] rounded-lg overflow-hidden hover:border-[--color-moss] transition-colors duration-200">
      {post.coverImage?.url && (
        <div className="relative aspect-[16/9] overflow-hidden">
          <Image
            src={post.coverImage.url}
            alt={post.coverImage.alt ?? post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}
      <div className="flex flex-col gap-3 p-5 flex-1">
        {post.category && (
          <span className="text-xs font-medium uppercase tracking-wider text-[--color-moss]">
            {post.category.name}
          </span>
        )}
        <h3 className="font-cormorant text-xl font-semibold text-[--color-white] leading-snug group-hover:text-[--color-moss] transition-colors">
          <Link href={`/blog/${post.slug}`} className="stretched-link">
            {post.title}
          </Link>
        </h3>
        {post.excerpt && (
          <p className="text-sm text-[--color-fog] line-clamp-2">{post.excerpt}</p>
        )}
        <div className="mt-auto pt-3 border-t border-[--color-border] flex items-center justify-between text-xs text-[--color-fog]">
          <span>{post.author ?? "Redacție"}</span>
          <div className="flex gap-3">
            {date && <span>{date}</span>}
            <span>{readTime} min citire</span>
          </div>
        </div>
      </div>
    </article>
  )
}
