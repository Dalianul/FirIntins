import type { CollectionConfig } from "payload"

export const NewsletterSubscribers: CollectionConfig = {
  slug: "newsletter-subscribers",
  admin: { useAsTitle: "email" },
  access: {
    read: () => false,
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    { name: "email", type: "email", required: true, unique: true },
    {
      name: "subscribedAt",
      type: "date",
      defaultValue: () => new Date().toISOString(),
    },
  ],
}
