import type { CollectionConfig } from "payload"
import { isAdminOrEditor } from "../lib/cms/access"

export const Testimonials: CollectionConfig = {
  slug: "testimonials",
  admin: {
    useAsTitle: "author",
  },
  access: {
    create: isAdminOrEditor,
    read: () => true,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    {
      name: "author",
      type: "text",
      required: true,
    },
    {
      name: "role",
      type: "text",
      admin: { description: "e.g. Pescar din Cluj" },
    },
    {
      name: "quote",
      type: "textarea",
      required: true,
    },
    {
      name: "avatar",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "rating",
      type: "number",
      min: 1,
      max: 5,
    },
  ],
}
