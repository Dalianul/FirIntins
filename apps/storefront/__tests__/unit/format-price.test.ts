import { formatPrice } from "@/lib/utils"

describe("formatPrice", () => {
  it("formats a valid price in bani to lei", () => {
    expect(formatPrice(5000)).toBe("50,00 lei")
  })

  it("returns zero formatted string for null", () => {
    expect(formatPrice(null as any)).toBe("0,00 lei")
  })

  it("returns zero formatted string for undefined", () => {
    expect(formatPrice(undefined as any)).toBe("0,00 lei")
  })

  it("returns zero formatted string for NaN", () => {
    expect(formatPrice(NaN)).toBe("0,00 lei")
  })
})
