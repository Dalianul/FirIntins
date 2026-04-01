import { isWithin14Days } from "../../workflows/request-return"

describe("isWithin14Days", () => {
  it("returns true for order created today", () => {
    expect(isWithin14Days(new Date().toISOString())).toBe(true)
  })

  it("returns true for order created 14 days ago", () => {
    const d = new Date()
    d.setDate(d.getDate() - 14)
    expect(isWithin14Days(d.toISOString())).toBe(true)
  })

  it("returns false for order created 15 days ago", () => {
    const d = new Date()
    d.setDate(d.getDate() - 15)
    expect(isWithin14Days(d.toISOString())).toBe(false)
  })

  it("accepts Date object", () => {
    expect(isWithin14Days(new Date())).toBe(true)
  })
})
