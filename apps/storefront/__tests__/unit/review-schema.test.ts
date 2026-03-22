import { CreateReviewSchema } from "@/lib/schema/review"

describe("CreateReviewSchema", () => {
  const valid = {
    rating: 4,
    title: "Mulineta excelentă",
    body: "Am folosit-o la competiție și funcționează perfect.",
  }

  it("accepts valid review", () => {
    expect(CreateReviewSchema.safeParse(valid).success).toBe(true)
  })

  it("accepts with optional order_id", () => {
    expect(
      CreateReviewSchema.safeParse({ ...valid, order_id: "order_123" }).success
    ).toBe(true)
  })

  it("accepts order_id as null", () => {
    expect(
      CreateReviewSchema.safeParse({ ...valid, order_id: null }).success
    ).toBe(true)
  })

  it("rejects rating below 1", () => {
    expect(CreateReviewSchema.safeParse({ ...valid, rating: 0 }).success).toBe(false)
  })

  it("rejects rating above 5", () => {
    expect(CreateReviewSchema.safeParse({ ...valid, rating: 6 }).success).toBe(false)
  })

  it("rejects non-integer rating", () => {
    expect(CreateReviewSchema.safeParse({ ...valid, rating: 3.5 }).success).toBe(false)
  })

  it("rejects empty title", () => {
    expect(CreateReviewSchema.safeParse({ ...valid, title: "" }).success).toBe(false)
  })

  it("rejects empty body", () => {
    expect(CreateReviewSchema.safeParse({ ...valid, body: "" }).success).toBe(false)
  })

  it("rejects title over 255 characters", () => {
    expect(
      CreateReviewSchema.safeParse({ ...valid, title: "a".repeat(256) }).success
    ).toBe(false)
  })

  it("rejects body over 2000 characters", () => {
    expect(
      CreateReviewSchema.safeParse({ ...valid, body: "a".repeat(2001) }).success
    ).toBe(false)
  })
})
