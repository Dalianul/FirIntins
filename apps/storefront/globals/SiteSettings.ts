import type { GlobalConfig } from "payload"
import { isAdmin, isAdminOrEditor } from "@/lib/cms/access"

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  admin: { group: "Setări Site" },
  access: {
    read: isAdminOrEditor,
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
    { name: "siteName", type: "text" },
    { name: "logo", type: "upload", relationTo: "media" },
    { name: "phone", type: "text" },
    { name: "email", type: "email" },
    { name: "address", type: "textarea" },
    {
      name: "socialLinks",
      type: "array",
      fields: [
        {
          name: "platform",
          type: "select",
          options: [
            { label: "Facebook", value: "facebook" },
            { label: "Instagram", value: "instagram" },
            { label: "YouTube", value: "youtube" },
            { label: "TikTok", value: "tiktok" },
            { label: "X (Twitter)", value: "x" },
          ],
        },
        { name: "url", type: "text" },
      ],
    },
    {
      name: "googleAnalyticsId",
      type: "text",
      admin: { description: "e.g. G-XXXXXXXX" },
    },
    { name: "defaultSeoImage", type: "upload", relationTo: "media" },
  ],
}
