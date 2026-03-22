import type {
  AuthenticatedMedusaRequest,
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { PRODUCT_REVIEW_MODULE } from "../../../../../modules/product-review"
import ProductReviewModuleService from "../../../../../modules/product-review/service"
import { createProductReviewWorkflow } from "../../../../../workflows/create-product-review"

type CreateReviewBody = {
  rating: number
  title: string
  body: string
  order_id?: string | null
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { id: product_id } = req.params
  const reviewService = req.scope.resolve<ProductReviewModuleService>(PRODUCT_REVIEW_MODULE)

  const [reviews, count] = await reviewService.listAndCountProductReviews(
    { product_id, status: "approved" },
    { order: { created_at: "DESC" } }
  )

  return res.json({ reviews, count })
}

export async function POST(
  req: AuthenticatedMedusaRequest<CreateReviewBody>,
  res: MedusaResponse
) {
  const { id: product_id } = req.params
  const customer_id = req.auth_context.actor_id
  const { rating, title, body, order_id } = req.validatedBody

  const { result } = await createProductReviewWorkflow(req.scope).run({
    input: { product_id, customer_id, rating, title, body, order_id },
  })

  return res.status(201).json({ review: result })
}
