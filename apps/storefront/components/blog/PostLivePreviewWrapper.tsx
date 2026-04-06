'use client'
import { useLivePreview } from '@payloadcms/live-preview-react'
import Image from 'next/image'
import Link from 'next/link'
import { PostContent } from '@/components/blog/post-content'
import { calcReadTime } from '@/lib/cms/read-time'
// Must match payload.config.ts serverURL — used to filter postMessage events by origin
const PAYLOAD_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000'

const mediaUrl = (url: string) => { try { return new URL(url).pathname } catch { return url } }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function PostLivePreviewWrapper({ initialPost }: { initialPost: any }) {
  const { data: post } = useLivePreview({
    initialData: initialPost,
    serverURL: PAYLOAD_URL,
    depth: 1,
  })

  const readTime = calcReadTime(post.content)
  const date = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('ro-RO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  const categorySlug = typeof post.category === 'object' ? post.category?.slug : null
  const categoryName = typeof post.category === 'object' ? post.category?.name : null

  return (
    <>
      {/* Breadcrumb */}
      <nav className="text-sm text-[--color-fog] mb-6 flex gap-2 items-center">
        <Link href="/blog" className="hover:text-[--color-moss]">Blog</Link>
        {categoryName && categorySlug && (
          <>
            <span>/</span>
            <Link href={`/blog/categorii/${categorySlug}`} className="hover:text-[--color-moss]">
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
        <span>{post.author ?? 'Redacție'}</span>
        {date && <span>{date}</span>}
        <span>{readTime} min citire</span>
      </div>

      {/* Cover image */}
      {typeof post.coverImage === 'object' && post.coverImage?.url && (
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
    </>
  )
}
