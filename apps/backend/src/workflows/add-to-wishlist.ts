import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { createRemoteLinkStep } from "@medusajs/medusa/core-flows"
import { Modules } from "@medusajs/framework/utils"
import { WISHLIST_MODULE } from "../modules/wishlist"
import { getOrCreateWishlistStep } from "./steps/get-or-create-wishlist"
import { addWishlistItemStep } from "./steps/add-wishlist-item"

type AddToWishlistInput = {
  customer_id: string
  product_id: string
  variant_id?: string
}

export const addToWishlistWorkflow = createWorkflow(
  "add-to-wishlist",
  function (input: AddToWishlistInput) {
    const wishlist = getOrCreateWishlistStep({ customer_id: input.customer_id })

    const item = addWishlistItemStep({
      wishlist_id: wishlist.id,
      product_id: input.product_id,
      variant_id: input.variant_id,
    })

    createRemoteLinkStep([
      {
        [WISHLIST_MODULE]: {
          wishlist_item_id: item.id,
        },
        [Modules.PRODUCT]: {
          product_id: input.product_id,
        },
      },
    ])

    return new WorkflowResponse(item)
  }
)

export default addToWishlistWorkflow
