import { changePasswordSchema } from "@/lib/schema/account"

describe("Account Zod schemas", () => {
  test("changePasswordSchema validates matching passwords", () => {
    const valid = {
      currentPassword: "oldPassword123",
      newPassword: "newPassword456",
      confirmPassword: "newPassword456",
    }
    const result = changePasswordSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  test("changePasswordSchema rejects mismatched passwords", () => {
    const invalid = {
      currentPassword: "oldPassword123",
      newPassword: "newPassword456",
      confirmPassword: "differentPassword789",
    }
    const result = changePasswordSchema.safeParse(invalid)
    expect(result.success).toBe(false)
    if (!result.success) {
      const errorMessage = result.error.issues
        ?.map((issue) => issue.message)
        .join(", ") || ""
      expect(errorMessage).toContain("nu coincid")
    }
  })

  test("changePasswordSchema requires minimum 8 characters", () => {
    const invalid = {
      currentPassword: "short",
      newPassword: "newPass1",
      confirmPassword: "newPass1",
    }
    const result = changePasswordSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })
})
