import type { Block } from "payload"

export const FeaturedProductsBlock: Block = {
  slug: "featuredProducts",
  labels: { singular: "Produse Recomandate — Grilă sau carusel", plural: "Blocuri Produse Recomandate" },
  admin: { images: { thumbnail: { url: "/block-thumbnails/featured-products.svg", alt: "Featured products block preview" } } },
  fields: [
    { name: "heading", type: "text" },
    {
      name: "productHandles",
      type: "array",
      fields: [{ name: "handle", type: "text", required: true }],
    },
    {
      name: "layout",
      type: "select",
      defaultValue: "grid",
      options: [
        { label: "Grilă", value: "grid" },
        { label: "Carusel", value: "carousel" },
      ],
    },
  ],
}
