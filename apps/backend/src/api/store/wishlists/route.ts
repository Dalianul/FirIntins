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
      return res.json({ wishlist: { items: [] } })
    }

    const wishlist = wishlists[0]

    return res.json({
      wishlist: {
        id: wishlist.id,
        customer_id: wishlist.customer_id,
        items: wishlist.items || [],
        created_at: wishlist.created_at,
      },
    })
  } catch (error) {
    console.error("Error fetching wishlist:", error)
    return res.status(500).json({ message: "Internal server error" })
  }
}
