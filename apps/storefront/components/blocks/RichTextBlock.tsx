import { RichText } from "@payloadcms/richtext-lexical/react"
import { richTextConverters } from "@/lib/cms/rich-text-converters"

interface RichTextBlockData {
  blockType: "richText"
  content?: any
}

export function RichTextBlock({ block }: { block: RichTextBlockData }) {
  if (!block.content) return null
  return (
    <section className="py-12 px-6 max-w-4xl mx-auto prose prose-invert">
      <RichText data={block.content} converters={richTextConverters} />
    </section>
  )
}
