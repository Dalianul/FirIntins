import { render, screen } from "@testing-library/react"
import { OrderDetail } from "@/components/account/order-detail"

const baseOrder = {
  id: "order_abc123",
  status: "completed",
  created_at: new Date().toISOString(),
  items: [],
  total: 10000,
  subtotal: 8000,
  shipping_total: 2000,
  tax_total: 0,
}

describe("OrderDetail — tracking links", () => {
  it("renders tracking link when fulfillment has tracking data", () => {
    const order = {
      ...baseOrder,
      fulfillments: [
        {
          id: "ful_1",
          tracking_links: [
            {
              url: "https://track.example.com/123",
              tracking_number: "TRK123",
            },
          ],
        },
      ],
    }
    render(<OrderDetail order={order} />)
    expect(screen.getByText("TRK123")).toBeInTheDocument()
    expect(screen.getByText("TRK123").closest("a")).toHaveAttribute(
      "href",
      "https://track.example.com/123"
    )
  })

  it("does not render tracking section when no fulfillments", () => {
    render(<OrderDetail order={{ ...baseOrder, fulfillments: [] }} />)
    expect(screen.queryByText("Urmărire colet")).not.toBeInTheDocument()
  })

  it("does not render tracking section when fulfillments have no links", () => {
    const order = {
      ...baseOrder,
      fulfillments: [{ id: "ful_1", tracking_links: [] }],
    }
    render(<OrderDetail order={order} />)
    expect(screen.queryByText("Urmărire colet")).not.toBeInTheDocument()
  })
})

describe("OrderDetail — return button", () => {
  it("shows return button for completed order within 14 days", () => {
    render(<OrderDetail order={baseOrder} />)
    expect(screen.getByText("Solicită retur")).toBeInTheDocument()
  })

  it("hides return button for non-completed order", () => {
    render(<OrderDetail order={{ ...baseOrder, status: "pending" }} />)
    expect(screen.queryByText("Solicită retur")).not.toBeInTheDocument()
  })

  it("hides return button when order is older than 14 days", () => {
    const old = new Date()
    old.setDate(old.getDate() - 15)
    render(<OrderDetail order={{ ...baseOrder, created_at: old.toISOString() }} />)
    expect(screen.queryByText("Solicită retur")).not.toBeInTheDocument()
  })

  it("hides return button when active return exists", () => {
    const order = {
      ...baseOrder,
      returns: [{ id: "ret_1", status: "requested" }],
    }
    render(<OrderDetail order={order} />)
    expect(screen.queryByText("Solicită retur")).not.toBeInTheDocument()
  })

  it("shows return button when only cancelled return exists", () => {
    const order = {
      ...baseOrder,
      returns: [{ id: "ret_1", status: "canceled" }],
    }
    render(<OrderDetail order={order} />)
    expect(screen.getByText("Solicită retur")).toBeInTheDocument()
  })
})

describe("OrderDetail — return status badge", () => {
  it("shows Retur solicitat badge when active return exists", () => {
    const order = {
      ...baseOrder,
      returns: [{ id: "ret_1", status: "requested" }],
    }
    render(<OrderDetail order={order} />)
    expect(screen.getByText("Retur solicitat")).toBeInTheDocument()
  })

  it("does not show badge when no returns", () => {
    render(<OrderDetail order={baseOrder} />)
    expect(screen.queryByText("Retur solicitat")).not.toBeInTheDocument()
  })
})

describe("OrderDetail — return success banner", () => {
  it("shows success alert when returnSuccess=true", () => {
    render(<OrderDetail order={baseOrder} returnSuccess={true} />)
    expect(
      screen.getByText(/Cererea de retur a fost înregistrată/i)
    ).toBeInTheDocument()
  })

  it("does not show alert when returnSuccess=false", () => {
    render(<OrderDetail order={baseOrder} returnSuccess={false} />)
    expect(
      screen.queryByText(/Cererea de retur a fost înregistrată/i)
    ).not.toBeInTheDocument()
  })
})
