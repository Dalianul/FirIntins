import { model } from "@medusajs/framework/utils"

export const ProductReview = model.define("product_review", {
  id: model.id().primaryKey(),
  product_id: model.text(),
  customer_id: model.text(),
  order_id: model.text().nullable(),
  rating: model.number(),
  title: model.text(),
  body: model.text(),
  status: model.enum(["pending", "approved", "rejected"]).default("pending"),
  admin_reply: model.text().nullable(),
}).indexes([
  {
    on: ["customer_id", "product_id"],
    unique: true,
  },
])
