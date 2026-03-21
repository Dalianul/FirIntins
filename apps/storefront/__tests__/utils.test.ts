import { formatPrice } from "@/lib/utils"

describe("formatPrice", () => {
  it("formats 10000 as '100,00 lei'", () => {
    expect(formatPrice(10000)).toBe("100,00 lei")
  })

  it("formats 0 as '0,00 lei'", () => {
    expect(formatPrice(0)).toBe("0,00 lei")
  })

  it("formats 150 as '1,50 lei'", () => {
    expect(formatPrice(150)).toBe("1,50 lei")
  })
})
