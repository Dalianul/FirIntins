import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getCachedPage, getCachedFooterPages } from "@/lib/cms/client"
import { PostContent } from "@/components/blog/post-content"

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const pages = await getCachedFooterPages()
  return pages.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = await getCachedPage(slug)
  if (!page) return {}
  return { title: `${page.title} — FirIntins` }
}

export default async function StaticPage({ params }: Props) {
  const { slug } = await params
  const page = await getCachedPage(slug)
  if (!page) notFound()

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-cormorant text-3xl sm:text-4xl font-semibold text-[--color-white] mb-8">
        {page.title}
      </h1>
      <PostContent content={page.content} />
    </div>
  )
}
