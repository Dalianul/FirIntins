import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { WISHLIST_MODULE } from "../../modules/wishlist"
import WishlistModuleService from "../../modules/wishlist/service"

type RemoveWishlistItemInput = {
  item_id: string
  customer_id: string
}

export const removeWishlistItemStep = createStep(
  "remove-wishlist-item",
  async (input: RemoveWishlistItemInput, { container }) => {
    const wishlistService = container.resolve<WishlistModuleService>(WISHLIST_MODULE)

    const [item] = await wishlistService.listWishlistItems({ id: input.item_id })
    if (!item) throw new Error(`Wishlist item ${input.item_id} not found`)

    // Verify ownership
    const [wishlist] = await wishlistService.listWishlists({
      id: item.wishlist_id,
      customer_id: input.customer_id,
    })
    if (!wishlist) throw new Error("Unauthorized")

    await wishlistService.deleteWishlistItems([input.item_id])

    return new StepResponse({ id: input.item_id }, { item })
  },
  async (compensation: { item: any } | undefined, { container }) => {
    if (!compensation) return
    const wishlistService = container.resolve<WishlistModuleService>(WISHLIST_MODULE)
    await wishlistService.createWishlistItems(compensation.item)
  }
)
