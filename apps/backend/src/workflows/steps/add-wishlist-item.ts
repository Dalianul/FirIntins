import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { WISHLIST_MODULE } from "../../modules/wishlist"
import WishlistModuleService from "../../modules/wishlist/service"

type AddWishlistItemInput = {
  wishlist_id: string
  product_id: string
  variant_id?: string
}

type AddWishlistItemCompensate = string | undefined

export const addWishlistItemStep = createStep<
  AddWishlistItemInput,
  any,
  AddWishlistItemCompensate
>(
  "add-wishlist-item",
  async ({ wishlist_id, product_id, variant_id = "" }: AddWishlistItemInput, { container }) => {
    const wishlistService: WishlistModuleService = container.resolve(WISHLIST_MODULE)

    const item = await wishlistService.createWishlistItems({
      wishlist_id,
      product_id,
      variant_id,
    })

    return new StepResponse(item, item.id)
  },
  async (itemId: AddWishlistItemCompensate, { container }) => {
    if (!itemId) return
    const wishlistService: WishlistModuleService = container.resolve(WISHLIST_MODULE)
    await wishlistService.deleteWishlistItems(itemId)
  }
)
