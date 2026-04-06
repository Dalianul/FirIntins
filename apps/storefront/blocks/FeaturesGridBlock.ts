import type { Block } from "payload"

export const FeaturesGridBlock: Block = {
  slug: "featuresGrid",
  labels: { singular: "Caracteristici — Pictograme cu titlu și descriere", plural: "Blocuri Caracteristici" },
  admin: { images: { thumbnail: { url: "/block-thumbnails/features-grid.svg", alt: "Features grid block preview" } } },
  fields: [
    { name: "heading", type: "text" },
    {
      name: "items",
      type: "array",
      fields: [
        {
          name: "icon",
          type: "select",
          options: [
            { label: "Pește", value: "fish" },
            { label: "Cârlig", value: "hook" },
            { label: "Undița", value: "rod" },
            { label: "Barcă", value: "boat" },
            { label: "Stea", value: "star" },
            { label: "Scut", value: "shield" },
            { label: "Camion", value: "truck" },
            { label: "Frunză", value: "leaf" },
          ],
        },
        { name: "title", type: "text", required: true },
        { name: "description", type: "textarea" },
      ],
    },
  ],
}
