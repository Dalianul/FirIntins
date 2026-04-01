import React from "react"
import { render } from "@testing-library/react"
import { act } from "react"
import { PurchaseTracker } from "@/components/analytics/purchase-tracker"
import { trackPurchase } from "@/lib/analytics"

jest.mock("@/lib/analytics", () => ({
  trackPurchase: jest.fn(),
}))

const mockItems = [
  { item_id: "var-1", item_name: "Fishing Rod", item_variant: "Medium", price: 150, quantity: 1 },
]

describe("PurchaseTracker", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("calls trackPurchase on mount with correct args", async () => {
    await act(async () => {
      render(<PurchaseTracker orderId="order-123" total={15000} items={mockItems} />)
    })
    expect(trackPurchase).toHaveBeenCalledTimes(1)
    expect(trackPurchase).toHaveBeenCalledWith("order-123", 15000, mockItems)
  })

  it("does not call trackPurchase a second time on re-render", async () => {
    const { rerender } = render(
      <PurchaseTracker orderId="order-123" total={15000} items={mockItems} />
    )
    await act(async () => {
      rerender(<PurchaseTracker orderId="order-123" total={15000} items={mockItems} />)
    })
    expect(trackPurchase).toHaveBeenCalledTimes(1)
  })

  it("renders null (no DOM output)", async () => {
    const { container } = render(
      <PurchaseTracker orderId="order-123" total={15000} items={mockItems} />
    )
    expect(container).toBeEmptyDOMElement()
  })
})
