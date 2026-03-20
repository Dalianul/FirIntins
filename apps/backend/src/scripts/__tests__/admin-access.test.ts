// Verifies admin user exists and API key can be retrieved
// Run AFTER Task 6 is complete (user created, server running)

const BASE_URL = "http://localhost:9000"

describe("Admin access", () => {
  it("can authenticate with admin credentials", async () => {
    const res = await fetch(`${BASE_URL}/auth/user/emailpass`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@firintins.ro",
        password: "AdminParola123!",
      }),
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.token).toBeDefined()
  })

  it("health endpoint responds", async () => {
    const res = await fetch(`${BASE_URL}/health`)
    expect(res.status).toBe(200)
    const body = await res.text()
    expect(body.trim()).toBe("OK")
  })
})
