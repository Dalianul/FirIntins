import type { Block } from "payload"

export const TestimonialsBlock: Block = {
  slug: "testimonials",
  labels: { singular: "Testimoniale", plural: "Testimoniale" },
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
