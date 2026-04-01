import { addressSchema, promoCodeSchema } from "@/lib/schema/checkout"

describe("Checkout Zod schemas", () => {
  test("addressSchema validates valid address", () => {
    const valid = {
      firstName: "Ion",
      lastName: "Popescu",
      address1: "Str. Principală 123",
      city: "București",
      postalCode: "010101",
      countryCode: "ro" as const,
      phone: "0721234567",
    }
    const result = addressSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  test("addressSchema requires firstName", () => {
    const invalid = {
      firstName: "",
      lastName: "Popescu",
      address1: "Str. Principală 123",
      city: "București",
      postalCode: "010101",
      countryCode: "ro" as const,
    }
    const result = addressSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  test("addressSchema accepts optional phone", () => {
    const valid = {
      firstName: "Ion",
      lastName: "Popescu",
      address1: "Str. Principală 123",
      city: "București",
      postalCode: "010101",
      countryCode: "ro" as const,
    }
    const result = addressSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  test("addressSchema enforces countryCode literal", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const invalid: any = {
      firstName: "Ion",
      lastName: "Popescu",
      address1: "Str. Principală 123",
      city: "belgië",
      postalCode: "010101",
      countryCode: "fr",
    }
    const result = addressSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })
})

describe("addressSchema — CUI field", () => {
  const base = {
    firstName: "Ion",
    lastName: "Popescu",
    address1: "Str. Principală 123",
    city: "București",
    postalCode: "010101",
    countryCode: "ro" as const,
  }

  it("accepts address with optional CUI", () => {
    const result = addressSchema.safeParse({ ...base, cui: "RO12345678" })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.cui).toBe("RO12345678")
  })

  it("accepts address without CUI — field is undefined", () => {
    const result = addressSchema.safeParse(base)
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.cui).toBeUndefined()
  })

  it("accepts empty string CUI — treated as undefined", () => {
    const result = addressSchema.safeParse({ ...base, cui: "" })
    expect(result.success).toBe(true)
  })
})

describe("promoCodeSchema", () => {
  test("accepts valid promo code", () => {
    const result = promoCodeSchema.safeParse({ code: "FISH10" })
    expect(result.success).toBe(true)
  })

  test("trims whitespace from code", () => {
    const result = promoCodeSchema.safeParse({ code: "  FISH10  " })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.code).toBe("FISH10")
  })

  test("rejects empty code", () => {
    const result = promoCodeSchema.safeParse({ code: "" })
    expect(result.success).toBe(false)
  })
})
