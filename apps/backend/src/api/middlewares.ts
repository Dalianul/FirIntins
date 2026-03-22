import { defineMiddlewares, authenticate, validateAndTransformBody } from "@medusajs/framework/http"
import { z } from "zod"

const AddWishlistItemSchema = z.object({
  product_id: z.string().min(1),
  variant_id: z.string().optional(),
})

const CreateProductReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().min(1).max(255),
  body: z.string().min(1).max(2000),
  order_id: z.string().optional().nullable(),
})

const UpdateProductReviewStatusSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  admin_reply: z.string().optional().nullable(),
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
    {
      matcher: "/store/products/*/reviews",
      method: "POST",
      middlewares: [
        authenticate("customer", ["session", "bearer"]),
        validateAndTransformBody(CreateProductReviewSchema),
      ],
    },
    {
      matcher: "/admin/product-reviews*",
      middlewares: [authenticate("user", ["session", "bearer"])],
    },
    {
      matcher: "/admin/product-reviews/:id",
      method: "POST",
      middlewares: [validateAndTransformBody(UpdateProductReviewStatusSchema)],
    },
  ],
})
