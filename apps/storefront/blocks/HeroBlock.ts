import type { Block } from "payload"

export const HeroBlock: Block = {
  slug: "hero",
  labels: { singular: "Hero", plural: "Hero Blocks" },
  fields: [
    { name: "heading", type: "text", required: true },
    { name: "subheading", type: "textarea" },
    { name: "backgroundImage", type: "upload", relationTo: "media" },
    { name: "ctaLabel", type: "text" },
    { name: "ctaUrl", type: "text" },
    {
      name: "overlay",
      type: "select",
      defaultValue: "dark",
      options: [
        { label: "Fără overlay", value: "none" },
        { label: "Întunecat", value: "dark" },
        { label: "Luminos", value: "light" },
      ],
    },
  ],
}
