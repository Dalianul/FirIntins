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
      <div className="max-w-3xl mx-auto prose prose-base [&_h1]:font-cormorant [&_h2]:font-cormorant [&_h3]:font-cormorant [&_h1]:text-[#1c1a15] [&_h2]:text-[#1c1a15] [&_h3]:text-[#1c1a15] [&_p]:text-fog [&_p]:font-outfit [&_p]:leading-relaxed [&_a]:text-moss [&_a:hover]:text-moss-light [&_strong]:text-[#1c1a15] [&_li]:text-fog [&_li]:font-outfit [&_blockquote]:border-l-moss [&_blockquote]:text-[#1c1a15] [&_blockquote]:italic [&_hr]:border-border">
        <RichText data={block.content} converters={richTextConverters} />
      </div>
    </section>
  )
}
