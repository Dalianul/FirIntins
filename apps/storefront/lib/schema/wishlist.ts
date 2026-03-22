import { z } from "zod"

export const AddToWishlistSchema = z.object({
  product_id: z.string().min(1),
  variant_id: z.string().optional(),
})

export type AddToWishlistInput = z.infer<typeof AddToWishlistSchema>
