import type { Block } from "payload"

export const NewsletterBlock: Block = {
  slug: "newsletter",
  labels: { singular: "Newsletter — Formular abonare email", plural: "Blocuri Newsletter" },
  admin: { images: { thumbnail: { url: "/block-thumbnails/newsletter.svg", alt: "Newsletter block preview" } } },
  fields: [
    { name: "heading", type: "text", required: true, defaultValue: "Abonează-te la newsletter" },
    { name: "subheading", type: "textarea" },
    { name: "placeholder", type: "text", defaultValue: "Adresa ta de email" },
    { name: "buttonLabel", type: "text", defaultValue: "Abonează-te" },
    {
      name: "background",
      type: "select",
      defaultValue: "surface",
      options: [
        { label: "Suprafață (Surface)", value: "surface" },
        { label: "Verde (Moss)", value: "moss" },
        { label: "Maro (Mud)", value: "mud" },
        { label: "Închis (Dark)", value: "dark" },
      ],
    },
  ],
}
