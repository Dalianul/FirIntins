import { RichText } from "@payloadcms/richtext-lexical/react"
import { richTextConverters } from "@/lib/cms/rich-text-converters"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function PostContent({ content }: { content: any }) {
  if (!content) return null
  return (
    <div className="
      prose max-w-none
      prose-headings:font-cormorant prose-headings:text-[#1c1a15] prose-headings:leading-tight
      prose-h2:text-3xl prose-h3:text-2xl prose-h4:text-xl
      prose-p:text-fog prose-p:leading-8
      prose-a:text-moss-light prose-a:no-underline hover:prose-a:underline
      prose-strong:text-[#1c1a15] prose-strong:font-semibold
      prose-em:text-[#1c1a15]
      prose-blockquote:border-l-moss prose-blockquote:text-fog prose-blockquote:italic prose-blockquote:pl-4
      prose-ul:text-fog prose-ol:text-fog
      prose-li:marker:text-moss
      prose-hr:border-border
      prose-img:rounded-lg prose-img:border prose-img:border-border prose-img:mx-auto
      prose-code:text-[#1c1a15] prose-code:bg-surface prose-code:px-1 prose-code:rounded
      [&_iframe]:w-full [&_iframe]:aspect-video [&_iframe]:rounded-lg [&_iframe]:border [&_iframe]:border-border
    ">
      <RichText data={content} converters={richTextConverters} />
    </div>
  )
}
