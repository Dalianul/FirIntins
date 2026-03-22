import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { WISHLIST_MODULE } from "../../modules/wishlist"
import WishlistModuleService from "../../modules/wishlist/service"

type GetOrCreateWishlistInput = {
  customer_id: string
}

type GetOrCreateWishlistCompensate = string | undefined

export const getOrCreateWishlistStep = createStep<
  GetOrCreateWishlistInput,
  any,
  GetOrCreateWishlistCompensate
>(
  "get-or-create-wishlist",
  async ({ customer_id }: GetOrCreateWishlistInput, { container }) => {
    const wishlistService: WishlistModuleService = container.resolve(WISHLIST_MODULE)

    const [existing] = await wishlistService.listWishlists({ customer_id })
    if (existing) {
      return new StepResponse(existing)
    }

    const wishlist = await wishlistService.createWishlists({ customer_id })
    return new StepResponse(wishlist, wishlist.id)
  },
  async (wishlistId: GetOrCreateWishlistCompensate, { container }) => {
    if (!wishlistId) return
    const wishlistService: WishlistModuleService = container.resolve(WISHLIST_MODULE)
    await wishlistService.deleteWishlists(wishlistId)
  }
)
