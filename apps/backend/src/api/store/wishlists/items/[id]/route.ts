import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { removeFromWishlistWorkflow } from "../../../../../workflows/remove-from-wishlist"

export async function DELETE(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const customerId = req.auth_context?.actor_id
  const { id: itemId } = req.params

  if (!customerId) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  if (!itemId) {
    return res.status(400).json({ message: "Item ID is required" })
  }

  try {
    // Run the workflow to remove item from wishlist
    await removeFromWishlistWorkflow.run({
      input: {
        item_id: itemId,
        customer_id: customerId,
      },
    })

    return res.json({
      deleted: true,
    })
  } catch (error) {
    console.error("Error removing from wishlist:", error)
    return res.status(500).json({ message: "Internal server error" })
  }
}
