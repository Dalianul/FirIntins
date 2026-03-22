import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { WISHLIST_MODULE } from "../../../modules/wishlist"
import WishlistModuleService from "../../../modules/wishlist/service"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const wishlistModuleService = req.scope.resolve(
    WISHLIST_MODULE
  ) as WishlistModuleService
  const customerId = req.auth_context?.actor_id

  if (!customerId) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  try {
    // Get wishlist for this customer
    const [wishlists] = await wishlistModuleService.listAndCountWishlists(
      { customer_id: customerId },
      { relations: ["items"] }
    )

    if (wishlists.length === 0) {
      return res.json({ wishlist: null })
    }

    return res.json({ wishlist: wishlists[0] })
  } catch (error) {
    console.error("Error fetching wishlist:", error)
    return res.status(500).json({ message: "Internal server error" })
  }
}
