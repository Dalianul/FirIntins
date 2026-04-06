import type { Block } from "payload"

export const OffersBlock: Block = {
  slug: "offers",
  labels: { singular: "Oferte — Carduri promoționale", plural: "Blocuri Oferte" },
  admin: { images: { thumbnail: { url: "/block-thumbnails/offers.svg", alt: "Offers block preview" } } },
  fields: [
    { name: "heading", type: "text" },
    {
      name: "offers",
      type: "array",
      fields: [
        { name: "title", type: "text", required: true },
        { name: "description", type: "textarea" },
        { name: "image", type: "upload", relationTo: "media" },
        { name: "badge", type: "text" },
        { name: "ctaUrl", type: "text" },
      ],
    },
  ],
}
