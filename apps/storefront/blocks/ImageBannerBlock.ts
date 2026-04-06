import type { Block } from "payload"

export const ImageBannerBlock: Block = {
  slug: "imageBanner",
  labels: { singular: "Banner Imagine — Full-width cu caption", plural: "Bannere Imagini" },
  admin: { images: { thumbnail: { url: "/block-thumbnails/image-banner.svg", alt: "Image banner block preview" } } },
  fields: [
    { name: "image", type: "upload", relationTo: "media", required: true },
    { name: "caption", type: "text" },
    { name: "linkUrl", type: "text" },
  ],
}
