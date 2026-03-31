jest.mock("@/actions/checkout", () => ({
  applyPromoCodeAction: jest.fn(),
  removePromoCodeAction: jest.fn(),
}))

jest.mock("@/hooks/use-cart", () => ({
  useCart: jest.fn(),
}))

import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { PromoCodeInput } from "@/components/checkout/promo-code-input"
import { applyPromoCodeAction, removePromoCodeAction } from "@/actions/checkout"
import { useCart } from "@/hooks/use-cart"

const mockApply = applyPromoCodeAction as jest.Mock
const mockRemove = removePromoCodeAction as jest.Mock
const mockUseCart = useCart as jest.Mock

const baseCart = {
  id: "cart_1",
  items: [],
  subtotal: 10000,
  total: 10000,
  promotions: [],
}

beforeEach(() => {
  jest.clearAllMocks()
  mockUseCart.mockReturnValue({ cart: baseCart, refreshCart: jest.fn() })
})

describe("PromoCodeInput", () => {
  it("renders input and apply button", () => {
    render(<PromoCodeInput />)
    expect(screen.getByPlaceholderText(/cod promo/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /aplică/i })).toBeInTheDocument()
  })

  it("calls applyPromoCodeAction and refreshes cart on submit", async () => {
    const refreshCart = jest.fn()
    mockUseCart.mockReturnValue({ cart: baseCart, refreshCart })
    mockApply.mockResolvedValue({ success: true, cart: { ...baseCart, discount_total: 1000 } })

    render(<PromoCodeInput />)
    fireEvent.change(screen.getByPlaceholderText(/cod promo/i), { target: { value: "FISH10" } })
    fireEvent.click(screen.getByRole("button", { name: /aplică/i }))

    await waitFor(() => {
      expect(mockApply).toHaveBeenCalledWith("cart_1", "FISH10")
      expect(refreshCart).toHaveBeenCalled()
    })
  })

  it("shows error message when apply fails", async () => {
    mockApply.mockResolvedValue({ success: false, error: "Cod invalid" })

    render(<PromoCodeInput />)
    fireEvent.change(screen.getByPlaceholderText(/cod promo/i), { target: { value: "BAD" } })
    fireEvent.click(screen.getByRole("button", { name: /aplică/i }))

    await waitFor(() => {
      expect(screen.getByText("Cod invalid")).toBeInTheDocument()
    })
  })

  it("shows applied codes as badges and allows removal", async () => {
    const refreshCart = jest.fn()
    mockUseCart.mockReturnValue({
      cart: { ...baseCart, promotions: [{ code: "FISH10" }] },
      refreshCart,
    })
    mockRemove.mockResolvedValue({ success: true, cart: { ...baseCart, promotions: [] } })

    render(<PromoCodeInput />)

    expect(screen.getByText("FISH10")).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: /elimină codul fish10/i }))

    await waitFor(() => {
      expect(mockRemove).toHaveBeenCalledWith("cart_1", "FISH10")
      expect(refreshCart).toHaveBeenCalled()
    })
  })

  it("clears input field after successful apply", async () => {
    const refreshCart = jest.fn()
    mockUseCart.mockReturnValue({ cart: baseCart, refreshCart })
    mockApply.mockResolvedValue({ success: true, cart: baseCart })

    render(<PromoCodeInput />)
    const input = screen.getByPlaceholderText(/cod promo/i)
    fireEvent.change(input, { target: { value: "FISH10" } })
    fireEvent.click(screen.getByRole("button", { name: /aplică/i }))

    await waitFor(() => {
      expect((input as HTMLInputElement).value).toBe("")
    })
  })

  it("disables input and button when cart is not loaded", () => {
    mockUseCart.mockReturnValue({ cart: null, refreshCart: jest.fn() })
    render(<PromoCodeInput />)
    expect(screen.getByPlaceholderText(/cod promo/i)).toBeDisabled()
    expect(screen.getByRole("button", { name: /aplică/i })).toBeDisabled()
  })

  it("prevents double-click when removing promo code", async () => {
    const refreshCart = jest.fn()
    mockUseCart.mockReturnValue({
      cart: { ...baseCart, promotions: [{ code: "FISH10" }] },
      refreshCart,
    })
    mockRemove.mockImplementation(
      () => new Promise((r) => setTimeout(() => r({ success: true, cart: baseCart }), 100))
    )

    render(<PromoCodeInput />)
    const removeBtn = screen.getByRole("button", { name: /elimină codul fish10/i })

    fireEvent.click(removeBtn)
    fireEvent.click(removeBtn)

    await waitFor(() => {
      expect(mockRemove).toHaveBeenCalledTimes(1)
    })
  })
})
