import Image from "next/image"
import Link from "next/link"

interface ImageBannerBlockData {
  blockType: "imageBanner"
  image?: { url: string } | null
  caption?: string
  linkUrl?: string
}

export function ImageBannerBlock({ block }: { block: ImageBannerBlockData }) {
  const { image, caption, linkUrl } = block
  if (!image?.url) return null
  const imgSrc = new URL(image.url).pathname

  const content = (
    <div className="relative w-full h-64 md:h-96">
      <Image src={imgSrc} alt={caption ?? ""} fill className="object-cover" />
      {caption && (
        <p className="absolute bottom-4 left-4 bg-black/60 text-white text-sm px-3 py-1">{caption}</p>
      )}
    </div>
  )

  return (
    <section className="py-8">
      {linkUrl ? <Link href={linkUrl}>{content}</Link> : content}
    </section>
  )
}
