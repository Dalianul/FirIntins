import type { GlobalConfig } from "payload"
import { isAdmin } from "../lib/cms/access"

export const Navigation: GlobalConfig = {
  slug: "navigation",
  admin: { group: "Setări Site" },
  access: {
    read: isAdmin,
    update: isAdmin,
  },
  hooks: {
    afterChange: [
      async () => {
        try {
          const { revalidateTag } = await import("next/cache")
          revalidateTag("cms-globals", {})
        } catch (e) {
          console.warn("cms-globals revalidation skipped:", e)
        }
      },
    ],
  },
  fields: [
    {
      name: "items",
      type: "array",
      fields: [
        { name: "label", type: "text", required: true },
        { name: "url", type: "text", required: true },
        { name: "newTab", type: "checkbox", defaultValue: false },
        {
          name: "children",
          type: "array",
          fields: [
            { name: "label", type: "text", required: true },
            { name: "url", type: "text", required: true },
          ],
        },
      ],
    },
  ],
}
