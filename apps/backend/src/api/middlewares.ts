import { defineMiddlewares, authenticate, validateAndTransformBody } from "@medusajs/framework/http"
import { z } from "zod"

const AddWishlistItemSchema = z.object({
  product_id: z.string().min(1),
  variant_id: z.string().optional(),
})

export default defineMiddlewares({
  routes: [
    {
      matcher: "/store/wishlists*",
      middlewares: [authenticate("customer", ["session", "bearer"])],
    },
    {
      matcher: "/store/wishlists/items",
      method: "POST",
      middlewares: [validateAndTransformBody(AddWishlistItemSchema)],
    },
  ],
})
