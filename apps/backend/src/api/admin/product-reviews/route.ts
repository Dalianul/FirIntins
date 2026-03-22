import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { PRODUCT_REVIEW_MODULE } from "../../../modules/product-review"
import ProductReviewModuleService from "../../../modules/product-review/service"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const reviewService = req.scope.resolve<ProductReviewModuleService>(PRODUCT_REVIEW_MODULE)

  const filters: Record<string, string> = {}
  if (req.query.status) filters.status = req.query.status as string
  if (req.query.product_id) filters.product_id = req.query.product_id as string

  const limit = Number(req.query.limit) || 20
  const offset = Number(req.query.offset) || 0

  const [reviews, count] = await reviewService.listAndCountProductReviews(
    filters,
    { order: { created_at: "DESC" }, take: limit, skip: offset }
  )

  return res.json({ reviews, count, limit, offset })
}
