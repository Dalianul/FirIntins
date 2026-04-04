import type { Block } from "payload"

export const FaqBlock: Block = {
  slug: "faq",
  labels: { singular: "FAQ", plural: "FAQ-uri" },
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
