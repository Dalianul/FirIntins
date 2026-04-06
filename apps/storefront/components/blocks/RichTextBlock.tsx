import { RichText } from "@payloadcms/richtext-lexical/react"
import { richTextConverters } from "@/lib/cms/rich-text-converters"

interface RichTextBlockData {
  blockType: "richText"
  content?: any
}

export function RichTextBlock({ block }: { block: RichTextBlockData }) {
  if (!block.content) return null
  return (
    <section className="py-16 px-6 sm:px-10">
      <div className="max-w-3xl mx-auto prose prose-invert prose-base [&_h1]:font-cormorant [&_h2]:font-cormorant [&_h3]:font-cormorant [&_h1]:text-[--color-white] [&_h2]:text-[--color-white] [&_h3]:text-[--color-white] [&_p]:text-[--color-fog] [&_p]:font-outfit [&_p]:leading-relaxed [&_a]:text-[--color-moss] [&_a:hover]:text-[--color-moss-light] [&_strong]:text-[--color-cream] [&_li]:text-[--color-fog] [&_li]:font-outfit [&_blockquote]:border-l-[--color-moss] [&_blockquote]:text-[--color-cream] [&_blockquote]:italic [&_hr]:border-[--color-border]">
        <RichText data={block.content} converters={richTextConverters} />
      </div>
    </section>
  )
}
