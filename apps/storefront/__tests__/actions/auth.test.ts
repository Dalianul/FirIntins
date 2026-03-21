// Mock next/headers and next/navigation BEFORE importing the actions
const mockCookieSet = jest.fn()
const mockCookieDelete = jest.fn()

jest.mock("next/headers", () => ({
  cookies: jest.fn(async () => ({
    set: mockCookieSet,
    delete: mockCookieDelete,
    get: jest.fn(),
  })),
}))

jest.mock("next/navigation", () => ({
  redirect: jest.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`)
  }),
}))

jest.mock("@/lib/medusa/client", () => ({
  medusa: {
    auth: {
      login: jest.fn(),
      register: jest.fn(),
    },
  },
}))

import { loginAction, registerAction } from "@/actions/auth"
import { medusa } from "@/lib/medusa/client"

describe("loginAction", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCookieSet.mockClear()
    mockCookieDelete.mockClear()
  })

  it("returns validation error for invalid email", async () => {
    const result = await loginAction({ email: "invalid-email", password: "password123" })
    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })

  it("returns validation error for short password", async () => {
    const result = await loginAction({ email: "test@test.com", password: "short" })
    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })

  it("successfully logs in user and sets cookie", async () => {
    const mockMedusa = medusa as jest.Mocked<typeof medusa>
    mockMedusa.auth.login.mockResolvedValue("jwt-token-123")

    const result = await loginAction({ email: "test@test.com", password: "password123" })

    expect(result.success).toBe(true)
    expect(mockMedusa.auth.login).toHaveBeenCalledWith("customer", "emailpass", {
      email: "test@test.com",
      password: "password123",
    })

    // Verify the JWT cookie was set with correct options
    expect(mockCookieSet).toHaveBeenCalledWith(
      "_medusa_jwt",
      "jwt-token-123",
      expect.objectContaining({
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      })
    )
  })

  it("handles login error", async () => {
    const mockMedusa = medusa as jest.Mocked<typeof medusa>
    mockMedusa.auth.login.mockRejectedValue(new Error("Invalid credentials"))

    const result = await loginAction({ email: "test@test.com", password: "password123" })

    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })
})

describe("registerAction", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCookieSet.mockClear()
    mockCookieDelete.mockClear()
  })

  it("returns validation error for missing firstName", async () => {
    const result = await registerAction({
      firstName: "",
      lastName: "Doe",
      email: "test@test.com",
      password: "password123",
      confirmPassword: "password123",
    })
    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })

  it("returns validation error for mismatched passwords", async () => {
    const result = await registerAction({
      firstName: "John",
      lastName: "Doe",
      email: "test@test.com",
      password: "password123",
      confirmPassword: "differentpassword",
    })
    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })

  it("returns validation error for invalid email", async () => {
    const result = await registerAction({
      firstName: "John",
      lastName: "Doe",
      email: "invalid-email",
      password: "password123",
      confirmPassword: "password123",
    })
    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })

  it("successfully registers user", async () => {
    const mockMedusa = medusa as jest.Mocked<typeof medusa>
    mockMedusa.auth.register.mockResolvedValue("jwt-token-456")

    const result = await registerAction({
      firstName: "John",
      lastName: "Doe",
      email: "test@test.com",
      password: "password123",
      confirmPassword: "password123",
    })

    expect(result.success).toBe(true)
    expect(mockMedusa.auth.register).toHaveBeenCalledWith("customer", "emailpass", {
      email: "test@test.com",
      password: "password123",
      first_name: "John",
      last_name: "Doe",
    })

    // Verify the JWT cookie was set with correct options
    expect(mockCookieSet).toHaveBeenCalledWith(
      "_medusa_jwt",
      "jwt-token-456",
      expect.objectContaining({
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      })
    )
  })
})
