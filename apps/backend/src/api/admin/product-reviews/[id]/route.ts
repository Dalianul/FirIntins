import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { updateProductReviewWorkflow } from "../../../../workflows/update-product-review"

type UpdateReviewBody = {
  status: "approved" | "rejected"
  admin_reply?: string | null
}

export async function POST(
  req: AuthenticatedMedusaRequest<UpdateReviewBody>,
  res: MedusaResponse
) {
  const { id: review_id } = req.params
  const { status, admin_reply } = req.validatedBody

  const { result } = await updateProductReviewWorkflow(req.scope).run({
    input: { review_id, status, admin_reply },
  })

  return res.json({ review: result })
}
