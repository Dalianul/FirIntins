const mockCookieGet = jest.fn()

jest.mock("next/headers", () => ({
  cookies: jest.fn(async () => ({
    get: mockCookieGet,
  })),
}))

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}))

jest.mock("@/lib/medusa/client", () => ({
  medusa: {
    store: {
      customer: {
        update: jest.fn(),
        createAddress: jest.fn(),
        updateAddress: jest.fn(),
        deleteAddress: jest.fn(),
      },
    },
  },
}))

import {
  updateProfileAction,
  updatePasswordAction,
  addAddressAction,
  updateAddressAction,
  deleteAddressAction,
  setDefaultAddressAction,
} from "@/actions/account"
import { medusa } from "@/lib/medusa/client"

const TOKEN = "test-jwt-token"

beforeEach(() => {
  jest.clearAllMocks()
  mockCookieGet.mockReturnValue({ value: TOKEN })
})

describe("updateProfileAction", () => {
  it("returns success on valid input", async () => {
    ;(medusa.store.customer.update as jest.Mock).mockResolvedValue({ customer: {} })
    const fd = new FormData()
    fd.append("firstName", "Ion")
    fd.append("lastName", "Popescu")
    fd.append("email", "ion@test.com")
    const result = await updateProfileAction(null, fd)
    expect(result.success).toBe(true)
  })

  it("returns validation error for bad email", async () => {
    const fd = new FormData()
    fd.append("firstName", "Ion")
    fd.append("lastName", "Popescu")
    fd.append("email", "not-email")
    const result = await updateProfileAction(null, fd)
    expect(result.success).toBe(false)
    expect(result.fieldErrors?.email).toBeDefined()
  })

  it("returns error when SDK throws", async () => {
    ;(medusa.store.customer.update as jest.Mock).mockRejectedValue(new Error("Network error"))
    const fd = new FormData()
    fd.append("firstName", "Ion")
    fd.append("lastName", "Popescu")
    fd.append("email", "ion@test.com")
    const result = await updateProfileAction(null, fd)
    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })
})

describe("updatePasswordAction", () => {
  it("returns success on matching passwords", async () => {
    ;(medusa.store.customer.update as jest.Mock).mockResolvedValue({ customer: {} })
    const fd = new FormData()
    fd.append("password", "novaParola1")
    fd.append("confirmPassword", "novaParola1")
    const result = await updatePasswordAction(null, fd)
    expect(result.success).toBe(true)
  })

  it("returns validation error for mismatched passwords", async () => {
    const fd = new FormData()
    fd.append("password", "parola123")
    fd.append("confirmPassword", "altaParola")
    const result = await updatePasswordAction(null, fd)
    expect(result.success).toBe(false)
    expect(result.fieldErrors?.confirmPassword).toBeDefined()
  })
})

describe("addAddressAction", () => {
  it("returns success on valid address", async () => {
    ;(medusa.store.customer.createAddress as jest.Mock).mockResolvedValue({ customer: {} })
    const fd = new FormData()
    fd.append("firstName", "Ion")
    fd.append("lastName", "Popescu")
    fd.append("address1", "Str. Pescarului 1")
    fd.append("city", "Cluj")
    fd.append("province", "Cluj")
    fd.append("postalCode", "400001")
    fd.append("countryCode", "ro")
    const result = await addAddressAction(null, fd)
    expect(result.success).toBe(true)
  })

  it("returns error when SDK throws", async () => {
    ;(medusa.store.customer.createAddress as jest.Mock).mockRejectedValue(new Error("fail"))
    const fd = new FormData()
    fd.append("firstName", "Ion")
    fd.append("lastName", "Popescu")
    fd.append("address1", "Str. 1")
    fd.append("city", "Cluj")
    fd.append("province", "Cluj")
    fd.append("postalCode", "400001")
    fd.append("countryCode", "ro")
    const result = await addAddressAction(null, fd)
    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })
})

describe("updateAddressAction", () => {
  it("calls updateAddress with addressId and returns success", async () => {
    ;(medusa.store.customer.updateAddress as jest.Mock).mockResolvedValue({ customer: {} })
    const fd = new FormData()
    fd.append("addressId", "addr_123")
    fd.append("firstName", "Ion")
    fd.append("lastName", "Popescu")
    fd.append("address1", "Str. 1")
    fd.append("city", "Cluj")
    fd.append("province", "Cluj")
    fd.append("postalCode", "400001")
    fd.append("countryCode", "ro")
    const result = await updateAddressAction(null, fd)
    expect(result.success).toBe(true)
    expect(medusa.store.customer.updateAddress).toHaveBeenCalledWith(
      "addr_123",
      expect.any(Object),
      expect.any(Object)
    )
  })
})

describe("deleteAddressAction", () => {
  it("calls deleteAddress with addressId", async () => {
    ;(medusa.store.customer.deleteAddress as jest.Mock).mockResolvedValue({})
    const fd = new FormData()
    fd.append("addressId", "addr_456")
    const result = await deleteAddressAction(null, fd)
    expect(result.success).toBe(true)
    expect(medusa.store.customer.deleteAddress).toHaveBeenCalledWith(
      "addr_456",
      expect.any(Object)
    )
  })
})

describe("setDefaultAddressAction", () => {
  it("calls updateAddress with is_default_shipping true", async () => {
    ;(medusa.store.customer.updateAddress as jest.Mock).mockResolvedValue({ customer: {} })
    const fd = new FormData()
    fd.append("addressId", "addr_789")
    const result = await setDefaultAddressAction(null, fd)
    expect(result.success).toBe(true)
    expect(medusa.store.customer.updateAddress).toHaveBeenCalledWith(
      "addr_789",
      { is_default_shipping: true },
      expect.any(Object)
    )
  })
})
