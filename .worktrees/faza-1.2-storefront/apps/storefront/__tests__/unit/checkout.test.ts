import { addressSchema } from "@/lib/schema/checkout"

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
      city: "București",
      postalCode: "010101",
      countryCode: "fr",
    }
    const result = addressSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })
})
