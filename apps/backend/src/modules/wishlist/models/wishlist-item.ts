import { model } from "@medusajs/framework/utils"
import { Wishlist } from "./wishlist"

export const WishlistItem = model
  .define("wishlist_item", {
    id: model.id().primaryKey(),
    product_id: model.text(),
    variant_id: model.text().default(""),
    wishlist: model.belongsTo(() => Wishlist, { mappedBy: "items" }),
  })
  .indexes([{ on: ["wishlist_id", "product_id", "variant_id"], unique: true }])
