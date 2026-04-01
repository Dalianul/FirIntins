jest.mock("@/lib/analytics", () => ({
  trackBeginCheckout: jest.fn(),
}))

jest.mock("@/hooks/use-cart", () => ({
  useCart: jest.fn(),
}))

jest.mock("@/hooks/use-toast", () => ({
  useToast: jest.fn(),
}))

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}))

jest.mock("@/actions/checkout", () => ({
  initiatePaymentAction: jest.fn(),
}))

jest.mock("@/components/checkout/address-step", () => ({
  AddressStep: () => <div>Address Step</div>,
}))

jest.mock("@/components/checkout/shipping-step", () => ({
  ShippingStep: () => <div>Shipping Step</div>,
}))

jest.mock("@/components/checkout/payment-step", () => ({
  PaymentStep: () => <div>Payment Step</div>,
}))

jest.mock("@/components/checkout/order-summary", () => ({
  OrderSummary: () => <div>Order Summary</div>,
}))

import { render, waitFor } from "@testing-library/react"
import { CheckoutClient } from "@/components/checkout/checkout-client"
import { trackBeginCheckout } from "@/lib/analytics"
import { useCart } from "@/hooks/use-cart"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

const mockTrackBeginCheckout = trackBeginCheckout as jest.Mock
const mockUseCart = useCart as jest.Mock
const mockUseToast = useToast as jest.Mock
const mockUseRouter = useRouter as jest.Mock

beforeEach(() => {
  jest.clearAllMocks()
  mockUseToast.mockReturnValue({
    toast: jest.fn(),
  })
  mockUseRouter.mockReturnValue({
    push: jest.fn(),
  })
})

describe("CheckoutClient — begin_checkout tracking", () => {
  it("calls trackBeginCheckout on mount when cart is available", async () => {
    const mockCart = {
      id: "cart-123",
      items: [
        {
          id: "item-1",
          variant_id: "var-1",
          product_title: "Lanseta Crap",
          variant_title: "3.6m",
          quantity: 1,
          unit_price: 25000,
          total: 25000,
        },
      ],
      subtotal: 25000,
      total: 25000,
    }

    mockUseCart.mockReturnValue({ cart: mockCart })

    render(<CheckoutClient isGuest={true} />)

    await waitFor(() => {
      expect(mockTrackBeginCheckout).toHaveBeenCalledWith(mockCart)
    })
    expect(mockTrackBeginCheckout).toHaveBeenCalledTimes(1)
  })

  it("does not call trackBeginCheckout when cart is null", async () => {
    mockUseCart.mockReturnValue({ cart: null })

    render(<CheckoutClient isGuest={true} />)

    // Wait a bit for any effects to run
    await waitFor(() => {
      expect(mockUseRouter().push).toHaveBeenCalledWith("/cos")
    })

    expect(mockTrackBeginCheckout).not.toHaveBeenCalled()
  })

  it("does not fire trackBeginCheckout twice on re-render", async () => {
    const mockCart = {
      id: "cart-123",
      items: [
        {
          id: "item-1",
          variant_id: "var-1",
          product_title: "Lanseta Crap",
          variant_title: "3.6m",
          quantity: 1,
          unit_price: 25000,
          total: 25000,
        },
      ],
      subtotal: 25000,
      total: 25000,
    }

    mockUseCart.mockReturnValue({ cart: mockCart })

    const { rerender } = render(<CheckoutClient isGuest={true} />)

    await waitFor(() => {
      expect(mockTrackBeginCheckout).toHaveBeenCalledTimes(1)
    })

    rerender(<CheckoutClient isGuest={true} />)

    // Should still be 1 call, not 2
    expect(mockTrackBeginCheckout).toHaveBeenCalledTimes(1)
  })

  it("does not fire trackBeginCheckout when cart changes after initial track", async () => {
    const mockCart1 = {
      id: "cart-123",
      items: [
        {
          id: "item-1",
          variant_id: "var-1",
          product_title: "Lanseta Crap",
          variant_title: "3.6m",
          quantity: 1,
          unit_price: 25000,
          total: 25000,
        },
      ],
      subtotal: 25000,
      total: 25000,
    }

    const mockCart2 = {
      ...mockCart1,
      items: [
        ...mockCart1.items,
        {
          id: "item-2",
          variant_id: "var-2",
          product_title: "Mamuțe",
          variant_title: null,
          quantity: 2,
          unit_price: 10000,
          total: 20000,
        },
      ],
      subtotal: 45000,
      total: 45000,
    }

    mockUseCart.mockReturnValue({ cart: mockCart1 })

    const { rerender } = render(<CheckoutClient isGuest={true} />)

    await waitFor(() => {
      expect(mockTrackBeginCheckout).toHaveBeenCalledTimes(1)
      expect(mockTrackBeginCheckout).toHaveBeenCalledWith(mockCart1)
    })

    // Update cart
    mockUseCart.mockReturnValue({ cart: mockCart2 })
    rerender(<CheckoutClient isGuest={true} />)

    // Should still only be 1 call (not fired on cart update)
    expect(mockTrackBeginCheckout).toHaveBeenCalledTimes(1)
  })
})
