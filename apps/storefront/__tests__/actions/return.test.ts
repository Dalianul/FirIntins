jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}))
jest.mock("next/navigation", () => ({
  redirect: jest.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`)
  }),
}))

import { requestReturn } from "@/actions/return"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

const mockCookies = cookies as jest.Mock
const mockRedirect = redirect as jest.Mock

describe("requestReturn", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL = "http://localhost:9000"
    process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY = "pk_test"
    global.fetch = jest.fn()
  })

  it("redirects to /login when no token", async () => {
    mockCookies.mockResolvedValue({ get: () => undefined })
    await expect(
      requestReturn("order_1", { items: [], reason: "test" })
    ).rejects.toThrow("REDIRECT:/login")
    expect(mockRedirect).toHaveBeenCalledWith("/login")
  })

  it("returns success on 2xx response", async () => {
    mockCookies.mockResolvedValue({ get: () => ({ value: "jwt_token" }) })
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ return: {} }),
    })
    const result = await requestReturn("order_1", {
      items: [{ line_item_id: "item_1", quantity: 1 }],
      reason: "Produs deteriorat",
    })
    expect(result).toEqual({ success: true })
    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:9000/store/orders/order_1/return",
      expect.objectContaining({ method: "POST" })
    )
  })

  it("returns error with backend message on failure", async () => {
    mockCookies.mockResolvedValue({ get: () => ({ value: "jwt_token" }) })
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: () =>
        Promise.resolve({ message: "Perioada de retur de 14 zile a expirat" }),
    })
    const result = await requestReturn("order_1", {
      items: [{ line_item_id: "item_1", quantity: 1 }],
      reason: "Altul",
    })
    expect(result).toEqual({
      success: false,
      error: "Perioada de retur de 14 zile a expirat",
    })
  })
})
