import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { addToWishlistWorkflow } from "../../../../workflows/add-to-wishlist"

type AddToWishlistBody = {
  product_id: string
  variant_id?: string
  quantity?: number
}

export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const customerId = req.auth_context?.actor_id

  if (!customerId) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  try {
    const { product_id, variant_id } = req.body as AddToWishlistBody

    // Basic validation
    if (!product_id) {
      return res.status(400).json({ message: "product_id is required" })
    }

    // Run the workflow
    const { result } = await addToWishlistWorkflow.run({
      input: {
        customer_id: customerId,
        product_id,
        variant_id: variant_id || "",
      },
    })

    return res.status(201).json({
      item: result,
    })
  } catch (error) {
    console.error("Error adding to wishlist:", error)
    return res.status(500).json({ message: "Internal server error" })
  }
}
