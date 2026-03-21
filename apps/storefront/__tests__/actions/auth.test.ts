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
    const result = await loginAction("invalid-email", "password123")
    expect(result).toHaveProperty("errors")
    expect(result.errors).toBeDefined()
  })

  it("returns validation error for short password", async () => {
    const result = await loginAction("test@test.com", "short")
    expect(result).toHaveProperty("errors")
    expect(result.errors).toBeDefined()
  })

  it("successfully logs in user and sets cookie", async () => {
    const mockMedusa = medusa as jest.Mocked<typeof medusa>
    mockMedusa.auth.login.mockResolvedValue("jwt-token-123")

    try {
      await loginAction("test@test.com", "password123")
    } catch (error) {
      // redirect throws an error with the URL
      expect((error as Error).message).toMatch(/REDIRECT:/)
    }

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

  it("handles third-party auth response", async () => {
    const mockMedusa = medusa as jest.Mocked<typeof medusa>
    mockMedusa.auth.login.mockResolvedValue({ url: "https://oauth.provider.com" })

    const result = await loginAction("test@test.com", "password123")

    expect(result).toHaveProperty("errors")
    expect(result.errors).toBeDefined()
  })
})

describe("registerAction", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCookieSet.mockClear()
    mockCookieDelete.mockClear()
  })

  it("returns validation error for missing firstName", async () => {
    const result = await registerAction("", "Doe", "test@test.com", "password123", "password123")
    expect(result).toHaveProperty("errors")
    expect(result.errors).toBeDefined()
  })

  it("returns validation error for mismatched passwords", async () => {
    const result = await registerAction(
      "John",
      "Doe",
      "test@test.com",
      "password123",
      "differentpassword"
    )
    expect(result).toHaveProperty("errors")
    expect(result.errors).toBeDefined()
  })

  it("returns validation error for invalid email", async () => {
    const result = await registerAction("John", "Doe", "invalid-email", "password123", "password123")
    expect(result).toHaveProperty("errors")
    expect(result.errors).toBeDefined()
  })

  it("successfully registers user", async () => {
    const mockMedusa = medusa as jest.Mocked<typeof medusa>
    mockMedusa.auth.register.mockResolvedValue("jwt-token-456")

    try {
      await registerAction("John", "Doe", "test@test.com", "password123", "password123")
    } catch (error) {
      expect((error as Error).message).toMatch(/REDIRECT:/)
    }

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
