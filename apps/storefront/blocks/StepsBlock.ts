import type { Block } from "payload"

export const StepsBlock: Block = {
  slug: "steps",
  labels: { singular: "Pași — Cum funcționează", plural: "Blocuri Pași" },
  admin: { images: { thumbnail: { url: "/block-thumbnails/steps.svg", alt: "Steps block preview" } } },
  fields: [
    { name: "heading", type: "text" },
    { name: "subheading", type: "textarea" },
    {
      name: "steps",
      type: "array",
      minRows: 2,
      maxRows: 8,
      fields: [
        { name: "title", type: "text", required: true },
        { name: "description", type: "textarea" },
        {
          name: "icon",
          type: "select",
          options: [
            { label: "Coș de cumpărături", value: "cart" },
            { label: "Camion livrare", value: "truck" },
            { label: "Pachet", value: "package" },
            { label: "Inimă", value: "heart" },
            { label: "Bifă", value: "check" },
            { label: "Stea", value: "star" },
            { label: "Telefon", value: "phone" },
            { label: "Email", value: "email" },
            { label: "Scut", value: "shield" },
          ],
        },
      ],
    },
    {
      name: "layout",
      type: "select",
      defaultValue: "horizontal",
      options: [
        { label: "Orizontal (linie)", value: "horizontal" },
        { label: "Vertical (stivuit)", value: "vertical" },
      ],
    },
  ],
}
