/**
 * @jest-environment node
 */

jest.mock("@payload-config", () => ({}), { virtual: true })

const mockFind = jest.fn()
const mockCreate = jest.fn()
jest.mock("payload", () => ({
  getPayload: jest.fn().mockResolvedValue({
    find: mockFind,
    create: mockCreate,
  }),
}))

const mockSetApiKey = jest.fn()
const mockSend = jest.fn()
jest.mock("@sendgrid/mail", () => ({
  __esModule: true,
  default: { setApiKey: mockSetApiKey, send: mockSend },
  setApiKey: mockSetApiKey,
  send: mockSend,
}))

import { POST } from "@/app/api/newsletter/route"

const makeRequest = (body: unknown) =>
  new Request("http://localhost/api/newsletter", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  })

describe("POST /api/newsletter", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.SENDGRID_API_KEY = "SG.test"
    process.env.SENDGRID_FROM_EMAIL = "noreply@firintins.ro"
    process.env.NEXT_PUBLIC_NEWSLETTER_DISCOUNT_CODE = "WELCOME10"
    mockSend.mockResolvedValue([{}])
  })

  it("returns 400 for invalid email format", async () => {
    const res = await POST(makeRequest({ email: "not-an-email" }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBeDefined()
  })

  it("returns 400 for missing email", async () => {
    const res = await POST(makeRequest({}))
    expect(res.status).toBe(400)
  })

  it("returns 200 without sending email for existing subscriber", async () => {
    mockFind.mockResolvedValue({ totalDocs: 1 })
    const res = await POST(makeRequest({ email: "existing@test.com" }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(mockSend).not.toHaveBeenCalled()
  })

  it("creates subscriber and sends welcome email for new subscriber", async () => {
    mockFind.mockResolvedValue({ totalDocs: 0 })
    mockCreate.mockResolvedValue({ id: "sub_1", email: "new@test.com" })

    const res = await POST(makeRequest({ email: "new@test.com" }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "newsletter-subscribers",
        data: expect.objectContaining({ email: "new@test.com" }),
      })
    )
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "new@test.com",
        from: "noreply@firintins.ro",
        subject: expect.stringContaining("WELCOME10"),
      })
    )
  })

  it("email body contains discount code", async () => {
    mockFind.mockResolvedValue({ totalDocs: 0 })
    mockCreate.mockResolvedValue({ id: "sub_1" })

    await POST(makeRequest({ email: "new2@test.com" }))

    const sentEmail = mockSend.mock.calls[0][0]
    expect(sentEmail.text).toContain("WELCOME10")
  })
})
