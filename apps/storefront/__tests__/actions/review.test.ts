const mockCookieGet = jest.fn()

jest.mock("next/headers", () => ({
  cookies: jest.fn(async () => ({
    get: mockCookieGet,
  })),
}))

jest.mock("@/lib/medusa/client", () => ({
  medusa: {
    client: {
      fetch: jest.fn(),
    },
  },
}))

import { getProductReviewsAction, createReviewAction } from "@/actions/review"
import { medusa } from "@/lib/medusa/client"

const mockFetch = medusa.client.fetch as jest.Mock

describe("getProductReviewsAction", () => {
  beforeEach(() => jest.clearAllMocks())

  it("returns reviews for a product", async () => {
    mockFetch.mockResolvedValue({
      reviews: [{ id: "rev_1", rating: 5, title: "Super", body: "Bun" }],
      count: 1,
    })
    const result = await getProductReviewsAction("prod_123")
    expect(result.reviews).toHaveLength(1)
    expect(result.count).toBe(1)
    expect(mockFetch).toHaveBeenCalledWith("/store/products/prod_123/reviews", expect.any(Object))
  })

  it("returns empty on error", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"))
    const result = await getProductReviewsAction("prod_123")
    expect(result.reviews).toEqual([])
    expect(result.count).toBe(0)
  })
})

describe("createReviewAction", () => {
  const validInput = {
    rating: 5,
    title: "Excelent",
    body: "Produs de calitate superioară.",
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockCookieGet.mockReturnValue({ value: "test-jwt-token" })
  })

  it("creates review successfully", async () => {
    mockFetch.mockResolvedValue({
      review: { id: "rev_1", ...validInput, status: "pending" },
    })
    const result = await createReviewAction("prod_123", validInput)
    expect(result.success).toBe(true)
    expect(result.review).toBeDefined()
  })

  it("returns error when not authenticated", async () => {
    mockCookieGet.mockReturnValue(undefined)
    const result = await createReviewAction("prod_123", validInput)
    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })

  it("returns error for invalid input", async () => {
    const result = await createReviewAction("prod_123", { ...validInput, rating: 0 })
    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })

  it("returns error on API failure", async () => {
    mockFetch.mockRejectedValue(new Error("API error"))
    const result = await createReviewAction("prod_123", validInput)
    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })
})
