import { RichText } from "@payloadcms/richtext-lexical/react"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function PostContent({ content }: { content: any }) {
  if (!content) return null
  return (
    <div className="prose prose-invert prose-sm sm:prose-base max-w-none
      prose-headings:font-cormorant prose-headings:text-[--color-white]
      prose-p:text-[--color-fog] prose-p:leading-relaxed
      prose-a:text-[--color-moss] prose-a:no-underline hover:prose-a:underline
      prose-strong:text-[--color-cream]
      prose-img:rounded-lg prose-img:border prose-img:border-[--color-border]">
      <RichText data={content} />
    </div>
  )
}
