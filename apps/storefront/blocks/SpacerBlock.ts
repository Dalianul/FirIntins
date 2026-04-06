import type { Block } from "payload"

export const SpacerBlock: Block = {
  slug: "spacer",
  labels: { singular: "Spațiu — Separator vizual", plural: "Spațieri" },
  admin: { images: { thumbnail: { url: "/block-thumbnails/spacer.svg", alt: "Spacer block preview" } } },
  fields: [
    {
      name: "size",
      type: "select",
      defaultValue: "md",
      options: [
        { label: "Mic (32px)", value: "sm" },
        { label: "Mediu (64px)", value: "md" },
        { label: "Mare (96px)", value: "lg" },
        { label: "Foarte mare (128px)", value: "xl" },
      ],
    },
    {
      name: "showDivider",
      type: "checkbox",
      defaultValue: false,
      admin: { description: "Afișează o linie orizontală în mijloc" },
    },
  ],
}
