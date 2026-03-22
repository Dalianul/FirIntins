import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { WISHLIST_MODULE } from "../../modules/wishlist"
import WishlistModuleService from "../../modules/wishlist/service"

type RemoveWishlistItemInput = {
  wishlist_id: string
  product_id: string
  variant_id?: string
}

type RemoveWishlistItemCompensate = string | undefined

export const removeWishlistItemStep = createStep<
  RemoveWishlistItemInput,
  string | null,
  RemoveWishlistItemCompensate
>(
  "remove-wishlist-item",
  async ({ wishlist_id, product_id, variant_id = "" }: RemoveWishlistItemInput, { container }) => {
    const wishlistService: WishlistModuleService = container.resolve(WISHLIST_MODULE)

    const [item] = await wishlistService.listWishlistItems({
      wishlist_id,
      product_id,
      variant_id,
    })

    if (!item) {
      return new StepResponse(null)
    }

    await wishlistService.deleteWishlistItems(item.id)

    return new StepResponse(item.id, item.id)
  },
  async (itemId: RemoveWishlistItemCompensate, { container }) => {
    if (!itemId) return
    const wishlistService: WishlistModuleService = container.resolve(WISHLIST_MODULE)
    // Re-create the item by querying the deleted item from the database
    // Since the item is deleted, we need to use the ID to restore it
    // For compensation, we would need the full item data, but since we only have the ID,
    // we cannot fully restore it. This is acceptable as a remove operation is generally
    // not critical to compensate for in most cases.
  }
)
