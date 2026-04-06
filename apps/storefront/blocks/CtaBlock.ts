import type { Block } from "payload"

export const CtaBlock: Block = {
  slug: "cta",
  labels: { singular: "CTA — Îndemn la acțiune", plural: "CTA-uri" },
  admin: { images: { thumbnail: { url: "/block-thumbnails/cta.svg", alt: "CTA block preview" } } },
  fields: [
    { name: "heading", type: "text", required: true },
    { name: "subheading", type: "textarea" },
    { name: "ctaLabel", type: "text" },
    { name: "ctaUrl", type: "text" },
    {
      name: "background",
      type: "select",
      defaultValue: "moss",
      options: [
        { label: "Verde (Moss)", value: "moss" },
        { label: "Maro (Mud)", value: "mud" },
        { label: "Închis (Dark)", value: "dark" },
      ],
    },
  ],
}
