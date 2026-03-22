import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { MedusaError } from "@medusajs/framework/utils"
import { PRODUCT_REVIEW_MODULE } from "../../modules/product-review"
import ProductReviewModuleService from "../../modules/product-review/service"

type CreateProductReviewInput = {
  product_id: string
  customer_id: string
  order_id?: string | null
  rating: number
  title: string
  body: string
}

export const createProductReviewStep = createStep(
  "create-product-review",
  async (input: CreateProductReviewInput, { container }) => {
    const reviewService = container.resolve<ProductReviewModuleService>(PRODUCT_REVIEW_MODULE)

    const existing = await reviewService.listProductReviews(
      { customer_id: input.customer_id, product_id: input.product_id },
      { take: 1 }
    )
    if (existing.length > 0) {
      throw new MedusaError(
        MedusaError.Types.DUPLICATE_ERROR,
        "Ai scris deja o recenzie pentru acest produs."
      )
    }

    const review = await reviewService.createProductReviews({
      product_id: input.product_id,
      customer_id: input.customer_id,
      order_id: input.order_id ?? null,
      rating: input.rating,
      title: input.title,
      body: input.body,
      status: "pending",
    })

    return new StepResponse(review, review.id)
  },
  async (reviewId: string | undefined, { container }) => {
    if (!reviewId) return
    const reviewService = container.resolve<ProductReviewModuleService>(PRODUCT_REVIEW_MODULE)
    await reviewService.deleteProductReviews([reviewId])
  }
)
