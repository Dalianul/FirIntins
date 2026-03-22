import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { MedusaError } from "@medusajs/framework/utils"
import { PRODUCT_REVIEW_MODULE } from "../../modules/product-review"
import ProductReviewModuleService from "../../modules/product-review/service"

type UpdateProductReviewInput = {
  review_id: string
  status: "approved" | "rejected"
  admin_reply?: string | null
}

export const updateProductReviewStep = createStep(
  "update-product-review",
  async (input: UpdateProductReviewInput, { container }) => {
    const reviewService = container.resolve<ProductReviewModuleService>(PRODUCT_REVIEW_MODULE)

    const [existing] = await reviewService.listProductReviews({ id: input.review_id }, { take: 1 })
    if (!existing) {
      throw new MedusaError(MedusaError.Types.NOT_FOUND, "Recenzia nu a fost găsită.")
    }

    const previousStatus = existing.status

    const review = await reviewService.updateProductReviews({
      id: input.review_id,
      status: input.status,
      admin_reply: input.admin_reply ?? existing.admin_reply,
    })

    if (input.status === "approved" && previousStatus !== "approved") {
      const storefrontUrl = process.env.STOREFRONT_URL || "http://localhost:3000"
      const secret = process.env.REVALIDATE_SECRET || ""
      try {
        await fetch(
          `${storefrontUrl}/api/revalidate?secret=${secret}&tag=product-${existing.product_id}`,
          { method: "GET" }
        )
      } catch {
        // Non-critical — log but don't fail the workflow
      }
    }

    return new StepResponse(review, { review_id: input.review_id, previousStatus })
  },
  async (compensation: { review_id: string; previousStatus: string } | undefined, { container }) => {
    if (!compensation) return
    const reviewService = container.resolve<ProductReviewModuleService>(PRODUCT_REVIEW_MODULE)
    await reviewService.updateProductReviews({
      id: compensation.review_id,
      status: compensation.previousStatus as "pending" | "approved" | "rejected",
    })
  }
)
