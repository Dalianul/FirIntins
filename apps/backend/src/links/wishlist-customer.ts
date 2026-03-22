import { defineLink } from "@medusajs/framework/utils"
import CustomerModule from "@medusajs/medusa/customer"
import WishlistModule from "../modules/wishlist"

export default defineLink(
  WishlistModule.linkable.wishlist,
  CustomerModule.linkable.customer
)
