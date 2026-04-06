import React from "react"
import { render, screen } from "@testing-library/react"
import { ProductCard } from "@/components/product/product-card"

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}))
jest.mock("motion/react", () => ({
  m: {
    div: ({ children, whileHover, ...props }: any) => <div {...props}>{children}</div>,
  },
}))
jest.mock("@/components/wishlist/heart-button", () => ({
  HeartButton: () => null,
}))
jest.mock("@/components/ui/badge", () => ({
  Badge: ({ children, className, ...props }: any) => <span className={className} {...props}>{children}</span>,
}))
jest.mock("@/lib/utils", () => ({
  formatPrice: (amount: number) => `${amount} RON`,
}))

const baseProduct = {
  id: "prod_1",
  handle: "lanseta-test",
  title: "Lanseta Test",
  variants: [{ prices: [{ amount: 15000 }] }],
  categories: [{ name: "Lansete" }],
  metadata: {},
}

describe("ProductCard sale badge", () => {
  it("does not render badge when metadata has no discount_percentage", () => {
    render(<ProductCard product={baseProduct} />)
    expect(screen.queryByText(/−\d+%/)).not.toBeInTheDocument()
  })

  it("renders badge with correct percentage when discount_percentage is set", () => {
    const product = { ...baseProduct, metadata: { discount_percentage: 20 } }
    render(<ProductCard product={product} />)
    expect(screen.getByText("−20%")).toBeInTheDocument()
  })

  it("does not render badge when discount_percentage is 0", () => {
    const product = { ...baseProduct, metadata: { discount_percentage: 0 } }
    render(<ProductCard product={product} />)
    expect(screen.queryByText(/−\d+%/)).not.toBeInTheDocument()
  })
})

describe("ProductCard category badge", () => {
  it("renders category badge with brand-styled pill, not shadcn outline variant", () => {
    const mockProduct = {
      id: "prod_1",
      handle: "test-handle",
      title: "Test Product",
      variants: [{ calculated_price: { calculated_amount: 5000, original_amount: 5000 } }],
      categories: [{ name: "Mulinete" }],
      metadata: {},
      thumbnail: null,
    }
    const { container } = render(<ProductCard product={mockProduct} />)
    const badge = container.querySelector("[data-testid='category-badge']")
    expect(badge).not.toBeNull()
    expect(badge?.className).not.toContain("text-foreground")
  })
})
