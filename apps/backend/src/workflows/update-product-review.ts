import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { updateProductReviewStep } from "./steps/update-product-review"

type UpdateProductReviewWorkflowInput = {
  review_id: string
  status: "approved" | "rejected"
  admin_reply?: string | null
}

export const updateProductReviewWorkflow = createWorkflow(
  "update-product-review",
  function (input: UpdateProductReviewWorkflowInput) {
    const review = updateProductReviewStep(input)
    return new WorkflowResponse(review)
  }
)

export default updateProductReviewWorkflow
