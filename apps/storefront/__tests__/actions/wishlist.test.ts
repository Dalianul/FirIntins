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

import { addToWishlistAction, removeFromWishlistAction, getWishlistAction } from "@/actions/wishlist"
import { medusa } from "@/lib/medusa/client"

const mockMedusa = medusa as jest.Mocked<typeof medusa>

describe("getWishlistAction", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCookieGet.mockReturnValue({ value: "test-jwt-token" })
  })

  it("returns wishlist when authenticated", async () => {
    ;(mockMedusa.client.fetch as jest.Mock).mockResolvedValue({
      wishlist: { id: "wl_123", items: [] },
    })

    const result = await getWishlistAction()
    expect(result.wishlist).toEqual({ id: "wl_123", items: [] })
  })

  it("returns null wishlist when no token", async () => {
    mockCookieGet.mockReturnValue(undefined)
    const result = await getWishlistAction()
    expect(result.wishlist).toBeNull()
  })
})

describe("addToWishlistAction", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCookieGet.mockReturnValue({ value: "test-jwt-token" })
  })

  it("returns success with item", async () => {
    ;(mockMedusa.client.fetch as jest.Mock).mockResolvedValue({
      item: { id: "wli_1", product_id: "prod_1", variant_id: "" },
    })

    const result = await addToWishlistAction({ product_id: "prod_1" })
    expect(result.success).toBe(true)
    expect(result.item).toBeDefined()
  })

  it("returns error for invalid input", async () => {
    const result = await addToWishlistAction({ product_id: "" })
    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })
})

describe("removeFromWishlistAction", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCookieGet.mockReturnValue({ value: "test-jwt-token" })
  })

  it("returns success on remove", async () => {
    ;(mockMedusa.client.fetch as jest.Mock).mockResolvedValue({ deleted: true })
    const result = await removeFromWishlistAction("wli_1")
    expect(result.success).toBe(true)
  })
})
