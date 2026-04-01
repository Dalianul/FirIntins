jest.mock("@/lib/medusa/client", () => ({
  medusa: {
    store: {
      cart: {
        addPromotions: jest.fn(),
        removePromotions: jest.fn(),
        update: jest.fn(),
      },
    },
  },
}))

import { applyPromoCodeAction, removePromoCodeAction, updateAddressAction } from "@/actions/checkout"
import { medusa } from "@/lib/medusa/client"

const mockAddPromotions = (medusa.store.cart as any).addPromotions as jest.Mock
const mockRemovePromotions = (medusa.store.cart as any).removePromotions as jest.Mock
const mockUpdate = (medusa.store.cart as any).update as jest.Mock

describe("applyPromoCodeAction", () => {
  beforeEach(() => jest.clearAllMocks())

  it("returns success with updated cart on valid code", async () => {
    const mockCart = { id: "cart_1", discount_total: 1000, promotions: [{ code: "FISH10" }], total: 9000 }
    mockAddPromotions.mockResolvedValue({ cart: mockCart })
    const result = await applyPromoCodeAction("cart_1", "FISH10")
    expect(result.success).toBe(true)
    expect(result.cart).toEqual(mockCart)
    expect(mockAddPromotions).toHaveBeenCalledWith("cart_1", { promo_codes: ["FISH10"] })
  })

  it("trims whitespace before calling API", async () => {
    const mockCart = { id: "cart_1", discount_total: 500, promotions: [{ code: "TRIM" }], total: 9500 }
    mockAddPromotions.mockResolvedValue({ cart: mockCart })
    const result = await applyPromoCodeAction("cart_1", "  TRIM  ")
    expect(result.success).toBe(true)
    expect(mockAddPromotions).toHaveBeenCalledWith("cart_1", { promo_codes: ["TRIM"] })
  })

  it("returns error without calling API when code is empty", async () => {
    const result = await applyPromoCodeAction("cart_1", "")
    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
    expect(mockAddPromotions).not.toHaveBeenCalled()
  })

  it("returns error on API failure", async () => {
    mockAddPromotions.mockRejectedValue(new Error("Cod promoțional invalid"))
    const result = await applyPromoCodeAction("cart_1", "BAD")
    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })
})

describe("updateAddressAction — CUI metadata", () => {
  beforeEach(() => jest.clearAllMocks())

  it("passes CUI in metadata when provided", async () => {
    mockUpdate.mockResolvedValue({ cart: { id: "cart_1" } })
    const result = await updateAddressAction("cart_1", {
      firstName: "Ion",
      lastName: "Popescu",
      address1: "Str. 1",
      city: "București",
      postalCode: "010101",
      countryCode: "ro",
      cui: "RO12345678",
    })
    expect(result.success).toBe(true)
    expect(mockUpdate).toHaveBeenCalledWith(
      "cart_1",
      expect.objectContaining({
        metadata: { cui: "RO12345678" },
      })
    )
  })

  it("passes null for CUI when not provided", async () => {
    mockUpdate.mockResolvedValue({ cart: { id: "cart_1" } })
    await updateAddressAction("cart_1", {
      firstName: "Ion",
      lastName: "Popescu",
      address1: "Str. 1",
      city: "București",
      postalCode: "010101",
      countryCode: "ro",
    })
    expect(mockUpdate).toHaveBeenCalledWith(
      "cart_1",
      expect.objectContaining({
        metadata: { cui: null },
      })
    )
  })
})

describe("removePromoCodeAction", () => {
  beforeEach(() => jest.clearAllMocks())

  it("returns success with updated cart", async () => {
    const mockCart = { id: "cart_1", discount_total: 0, promotions: [], total: 10000 }
    mockRemovePromotions.mockResolvedValue({ cart: mockCart })
    const result = await removePromoCodeAction("cart_1", "FISH10")
    expect(result.success).toBe(true)
    expect(result.cart).toEqual(mockCart)
    expect(mockRemovePromotions).toHaveBeenCalledWith("cart_1", { promo_codes: ["FISH10"] })
  })

  it("returns error on API failure", async () => {
    mockRemovePromotions.mockRejectedValue(new Error("Eroare server"))
    const result = await removePromoCodeAction("cart_1", "FISH10")
    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })

  it("returns error without calling API when code is empty", async () => {
    const result = await removePromoCodeAction("cart_1", "")
    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
    expect(mockRemovePromotions).not.toHaveBeenCalled()
  })
})
