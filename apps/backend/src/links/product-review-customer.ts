import { defineLink } from "@medusajs/framework/utils"
import CustomerModule from "@medusajs/medusa/customer"
import ProductReviewModule from "../modules/product-review"

export default defineLink(
  CustomerModule.linkable.customer,
  ProductReviewModule.linkable.productReview
)
