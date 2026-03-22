import { profileSchema, addressSchema, passwordSchema } from "@/lib/schema/account"

describe("profileSchema", () => {
  it("accepts valid profile", () => {
    expect(profileSchema.safeParse({
      firstName: "Ion",
      lastName: "Popescu",
      email: "ion@test.com",
    }).success).toBe(true)
  })

  it("rejects missing firstName", () => {
    expect(profileSchema.safeParse({
      firstName: "",
      lastName: "Popescu",
      email: "ion@test.com",
    }).success).toBe(false)
  })

  it("rejects invalid email", () => {
    const result = profileSchema.safeParse({
      firstName: "Ion",
      lastName: "Popescu",
      email: "not-an-email",
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("email")
    }
  })
})

describe("passwordSchema", () => {
  it("accepts matching passwords of min 8 chars", () => {
    expect(passwordSchema.safeParse({
      password: "parola123",
      confirmPassword: "parola123",
    }).success).toBe(true)
  })

  it("rejects password shorter than 8 chars", () => {
    expect(passwordSchema.safeParse({
      password: "scurt",
      confirmPassword: "scurt",
    }).success).toBe(false)
  })

  it("rejects mismatched passwords with Romanian message", () => {
    const result = passwordSchema.safeParse({
      password: "parola123",
      confirmPassword: "altaParola",
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("coincid")
    }
  })
})

describe("addressSchema", () => {
  const valid = {
    firstName: "Ion",
    lastName: "Popescu",
    address1: "Str. Pescarului 1",
    city: "Cluj-Napoca",
    province: "Cluj",
    postalCode: "400001",
    countryCode: "ro",
  }

  it("accepts valid address", () => {
    expect(addressSchema.safeParse(valid).success).toBe(true)
  })

  it("accepts optional address2 and phone", () => {
    expect(addressSchema.safeParse({
      ...valid,
      address2: "Ap. 3",
      phone: "0722000000",
    }).success).toBe(true)
  })

  it("rejects missing required fields", () => {
    const { city, ...missing } = valid
    expect(addressSchema.safeParse(missing).success).toBe(false)
  })

  it("rejects empty countryCode", () => {
    expect(addressSchema.safeParse({ ...valid, countryCode: "x" }).success).toBe(false)
  })
})
