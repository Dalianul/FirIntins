/**
 * @jest-environment jsdom
 */
import React from "react"
import { render, screen } from "@testing-library/react"
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
  it("renders 'Mergi la coș' link to /cos", () => {
    render(<CartSummary />)
    const link = screen.getByRole("link", { name: /Mergi la coș/i })
    expect(link).toHaveAttribute("href", "/cos")
  })

  it("renders 'Finalizează comanda' link to /checkout", () => {
    render(<CartSummary />)
    const link = screen.getByRole("link", { name: /Finalizează comanda/i })
    expect(link).toHaveAttribute("href", "/checkout")
  })

  it("renders subtotal row", () => {
    render(<CartSummary />)
    expect(screen.getByText("Subtotal")).toBeInTheDocument()
  })

  it("renders 'Transport gratuit' when shipping is 0", () => {
    render(<CartSummary />)
    expect(screen.getByText("Gratuit")).toBeInTheDocument()
  })
})
