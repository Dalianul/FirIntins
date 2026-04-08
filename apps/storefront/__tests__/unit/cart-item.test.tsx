/**
 * @jest-environment jsdom
 */
import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { CartItem } from "@/components/cart/cart-item"
import { CartItem as CartItemData } from "@/context/cart-context"

jest.mock("@/hooks/use-cart", () => ({
  useCart: () => ({
    removeItem: jest.fn(),
    updateQuantity: jest.fn(),
  }),
}))

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} />
  ),
}))

const item: CartItemData = {
  id: "item-1",
  variant_id: "var-1",
  product_id: "prod-1",
  product_title: "Lansetă Crap Elite",
  variant_title: "3.6m · 3lbs",
  quantity: 2,
  unit_price: 34900,
  total: 69800,
  thumbnail: null,
}

describe("CartItem", () => {
  it("renders product title", () => {
    render(<CartItem item={item} index={0} />)
    expect(screen.getByText("Lansetă Crap Elite")).toBeInTheDocument()
  })

  it("renders variant title", () => {
    render(<CartItem item={item} index={0} />)
    expect(screen.getByText("3.6m · 3lbs")).toBeInTheDocument()
  })

  it("renders quantity badge on thumbnail", () => {
    render(<CartItem item={item} index={0} />)
    // badge shows quantity on the thumbnail corner
    const badge = screen.getAllByText("2").find((el) =>
      el.className.includes("rounded-full")
    )
    expect(badge).toBeInTheDocument()
  })

  it("uses picsum fallback when thumbnail is null", () => {
    render(<CartItem item={item} index={0} />)
    const img = screen.getByRole("img")
    expect(img).toHaveAttribute("src", expect.stringContaining("picsum.photos"))
  })

  it("renders remove button with accessible label", () => {
    render(<CartItem item={item} index={0} />)
    expect(screen.getByLabelText("Șterge din coș")).toBeInTheDocument()
  })
})
