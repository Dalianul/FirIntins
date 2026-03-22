import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { removeWishlistItemStep } from "./steps/remove-wishlist-item"

type RemoveFromWishlistInput = {
  item_id: string
  customer_id: string
}

export const removeFromWishlistWorkflow = createWorkflow(
  "remove-from-wishlist",
  function (input: RemoveFromWishlistInput) {
    const result = removeWishlistItemStep(input)
    return new WorkflowResponse(result)
  }
)
