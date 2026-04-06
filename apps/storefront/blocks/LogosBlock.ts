import type { Block } from "payload"

export const LogosBlock: Block = {
  slug: "logos",
  labels: { singular: "Logo-uri — Parteneri sau branduri", plural: "Blocuri Logo-uri" },
  admin: { images: { thumbnail: { url: "/block-thumbnails/logos.svg", alt: "Logos block preview" } } },
  fields: [
    { name: "heading", type: "text", admin: { description: "Titlu opțional (ex: 'Partenerii noștri')" } },
    {
      name: "logos",
      type: "array",
      minRows: 1,
      fields: [
        { name: "image", type: "upload", relationTo: "media", required: true },
        { name: "alt", type: "text", admin: { description: "Text alternativ pentru accesibilitate" } },
        { name: "url", type: "text", admin: { description: "Link opțional la site-ul partenerului" } },
      ],
    },
    {
      name: "marquee",
      type: "checkbox",
      defaultValue: false,
      admin: { description: "Activează scroll automat (marquee) al logo-urilor" },
    },
  ],
}
