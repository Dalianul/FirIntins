import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { addToWishlistWorkflow } from "../../../../workflows/add-to-wishlist"

import { z } from "zod"

const AddItemSchema = z.object({
  product_id: z.string().min(1),
  variant_id: z.string().optional(),
})

type AddItemBody = z.infer<typeof AddItemSchema>

export async function POST(
  req: AuthenticatedMedusaRequest<AddItemBody>,
  res: MedusaResponse
) {
  const customerId = req.auth_context?.actor_id

  if (!customerId) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  const { product_id, variant_id } = req.validatedBody

  const { result } = await addToWishlistWorkflow(req.scope).run({
    input: {
      customer_id: customerId,
      product_id,
      variant_id,
    },
  })

  return res.status(201).json({ item: result })
}
