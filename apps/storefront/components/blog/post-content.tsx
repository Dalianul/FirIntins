import { RichText } from "@payloadcms/richtext-lexical/react"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function PostContent({ content }: { content: any }) {
  if (!content) return null
  return (
    <div className="
      prose prose-invert max-w-none
      prose-headings:font-cormorant prose-headings:text-[--color-white] prose-headings:leading-tight
      prose-h2:text-3xl prose-h3:text-2xl prose-h4:text-xl
      prose-p:text-[--color-fog] prose-p:leading-8
      prose-a:text-[--color-moss-light] prose-a:no-underline hover:prose-a:underline
      prose-strong:text-[--color-cream] prose-strong:font-semibold
      prose-em:text-[--color-cream]
      prose-blockquote:border-l-[--color-moss] prose-blockquote:text-[--color-fog] prose-blockquote:italic prose-blockquote:pl-4
      prose-ul:text-[--color-fog] prose-ol:text-[--color-fog]
      prose-li:marker:text-[--color-moss]
      prose-hr:border-[--color-border]
      prose-img:rounded-lg prose-img:border prose-img:border-[--color-border] prose-img:mx-auto
      prose-code:text-[--color-cream] prose-code:bg-[--color-surface-2] prose-code:px-1 prose-code:rounded
      [&_iframe]:w-full [&_iframe]:aspect-video [&_iframe]:rounded-lg [&_iframe]:border [&_iframe]:border-[--color-border]
    ">
      <RichText data={content} />
    </div>
  )
}
