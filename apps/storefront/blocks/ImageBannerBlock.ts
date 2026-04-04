import type { Block } from "payload"

export const ImageBannerBlock: Block = {
  slug: "imageBanner",
  labels: { singular: "Banner Imagine", plural: "Bannere Imagini" },
  fields: [
    { name: "image", type: "upload", relationTo: "media", required: true },
    { name: "caption", type: "text" },
    { name: "linkUrl", type: "text" },
  ],
}
