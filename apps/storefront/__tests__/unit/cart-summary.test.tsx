/**
 * @jest-environment jsdom
 */
import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { CartSummary } from "@/components/cart/cart-summary"

const mockCart = {
  subtotal: 92700,
  shipping_total: 0,
  total: 92700,
}

jest.mock("@/hooks/use-cart", () => ({
  useCart: () => ({
    cart: mockCart,
    itemCount: 2,
    loading: false,
  }),
}))

describe("CartSummary", () => {
  it("renders Finalizează comanda link to /checkout", () => {
    render(<CartSummary onClose={jest.fn()} />)
    const link = screen.getByRole("link", { name: /Finalizează comanda/i })
    expect(link).toHaveAttribute("href", "/checkout")
  })

  it("renders 'sau continuă cumpărăturile' button", () => {
    render(<CartSummary onClose={jest.fn()} />)
    expect(screen.getByText(/sau continuă cumpărăturile/i)).toBeInTheDocument()
  })

  it("calls onClose when 'sau continuă' is clicked", () => {
    const onClose = jest.fn()
    render(<CartSummary onClose={onClose} />)
    fireEvent.click(screen.getByText(/sau continuă cumpărăturile/i))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("renders subtotal row", () => {
    render(<CartSummary onClose={jest.fn()} />)
    expect(screen.getByText("Subtotal")).toBeInTheDocument()
  })

  it("renders 'Transport gratuit' when shipping is 0", () => {
    render(<CartSummary onClose={jest.fn()} />)
    expect(screen.getByText("Gratuit")).toBeInTheDocument()
  })
})
