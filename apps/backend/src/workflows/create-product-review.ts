import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { createRemoteLinkStep } from "@medusajs/medusa/core-flows"
import { Modules } from "@medusajs/framework/utils"
import { PRODUCT_REVIEW_MODULE } from "../modules/product-review"
import { createProductReviewStep } from "./steps/create-product-review"

type CreateProductReviewWorkflowInput = {
  product_id: string
  customer_id: string
  order_id?: string | null
  rating: number
  title: string
  body: string
}

export const createProductReviewWorkflow = createWorkflow(
  "create-product-review",
  function (input: CreateProductReviewWorkflowInput) {
    const review = createProductReviewStep(input)

    createRemoteLinkStep([
      {
        [Modules.PRODUCT]: { product_id: input.product_id },
        [PRODUCT_REVIEW_MODULE]: { product_review_id: review.id },
      },
      {
        [Modules.CUSTOMER]: { customer_id: input.customer_id },
        [PRODUCT_REVIEW_MODULE]: { product_review_id: review.id },
      },
    ])

    return new WorkflowResponse(review)
  }
)

export default createProductReviewWorkflow
