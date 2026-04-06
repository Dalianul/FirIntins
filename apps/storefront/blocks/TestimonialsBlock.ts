import type { Block } from "payload"

export const TestimonialsBlock: Block = {
  slug: "testimonials",
  labels: { singular: "Testimoniale — Recenzii clienți", plural: "Blocuri Testimoniale" },
  admin: { images: { thumbnail: { url: "/block-thumbnails/testimonials.svg", alt: "Testimonials block preview" } } },
  fields: [
    { name: "heading", type: "text" },
    {
      name: "items",
      type: "relationship",
      relationTo: "testimonials",
      hasMany: true,
    },
  ],
}
