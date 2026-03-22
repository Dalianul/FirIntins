import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { dismissRemoteLinkStep } from "@medusajs/medusa/core-flows"
import { Modules } from "@medusajs/framework/utils"
import { WISHLIST_MODULE } from "../modules/wishlist"
import { getOrCreateWishlistStep } from "./steps/get-or-create-wishlist"
import { removeWishlistItemStep } from "./steps/remove-wishlist-item"

type RemoveFromWishlistInput = {
  customer_id: string
  product_id: string
  variant_id?: string
}

export const removeFromWishlistWorkflow = createWorkflow(
  "remove-from-wishlist",
  function (input: RemoveFromWishlistInput) {
    const wishlist = getOrCreateWishlistStep({ customer_id: input.customer_id })

    const itemId = removeWishlistItemStep({
      wishlist_id: wishlist.id,
      product_id: input.product_id,
      variant_id: input.variant_id,
    })

    dismissRemoteLinkStep(
      [
        {
          [WISHLIST_MODULE]: {
            wishlist_item_id: itemId,
          },
          [Modules.PRODUCT]: {
            product_id: input.product_id,
          },
        },
      ]
    )

    return new WorkflowResponse(itemId)
  }
)

export default removeFromWishlistWorkflow
