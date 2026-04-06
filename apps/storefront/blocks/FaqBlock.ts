import type { Block } from "payload"

export const FaqBlock: Block = {
  slug: "faq",
  labels: { singular: "FAQ — Întrebări frecvente cu accordion", plural: "Blocuri FAQ" },
  admin: { images: { thumbnail: { url: "/block-thumbnails/faq.svg", alt: "FAQ block preview" } } },
  fields: [
    { name: "heading", type: "text" },
    {
      name: "items",
      type: "relationship",
      relationTo: "faqs",
      hasMany: true,
    },
  ],
}
