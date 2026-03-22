import { AddToWishlistSchema } from "@/lib/schema/wishlist"

describe("AddToWishlistSchema", () => {
  it("accepts valid product_id", () => {
    const result = AddToWishlistSchema.safeParse({ product_id: "prod_123" })
    expect(result.success).toBe(true)
  })

  it("accepts product_id with optional variant_id", () => {
    const result = AddToWishlistSchema.safeParse({
      product_id: "prod_123",
      variant_id: "variant_456",
    })
    expect(result.success).toBe(true)
  })

  it("rejects empty product_id", () => {
    const result = AddToWishlistSchema.safeParse({ product_id: "" })
    expect(result.success).toBe(false)
  })
})
