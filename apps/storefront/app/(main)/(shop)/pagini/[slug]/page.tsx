import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getCachedPage, getCachedFooterPages } from "@/lib/cms/client"
import { PostContent } from "@/components/blog/post-content"
import { BASE_URL } from "@/lib/constants"

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const pages = await getCachedFooterPages()
  return pages.map((p) => ({ slug: p.slug }))
}

function extractTextFromLexical(content: unknown): string {
  if (!content || typeof content !== "object") return ""
  const node = content as Record<string, unknown>
  if (node.type === "text" && typeof node.text === "string") return node.text
  if (Array.isArray(node.children)) {
    return (node.children as unknown[]).map(extractTextFromLexical).join(" ")
  }
  if (node.root) return extractTextFromLexical(node.root)
  return ""
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = await getCachedPage(slug)
  if (!page) return {}
  const description = extractTextFromLexical(page.content).trim().slice(0, 160) || undefined
  return {
    title: `${page.title} — FirIntins`,
    description,
    alternates: { canonical: `${BASE_URL}/pagini/${slug}` },
    openGraph: {
      title: `${page.title} — FirIntins`,
      url: `${BASE_URL}/pagini/${slug}`,
      images: [{ url: `${BASE_URL}/og-default.jpg` }],
    },
  }
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
