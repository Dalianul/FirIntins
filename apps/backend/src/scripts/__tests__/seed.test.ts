// Verifies seed data exists after running seed.ts
// Run AFTER seed script has been executed

const BASE_URL = "http://localhost:9000"

async function getAdminToken(): Promise<string> {
  const res = await fetch(`${BASE_URL}/auth/user/emailpass`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin@firintins.ro",
      password: "AdminParola123!",
    }),
  })
  const body = await res.json()
  return body.token
}

describe("Seed data", () => {
  let token: string

  beforeAll(async () => {
    token = await getAdminToken()
  })

  it("Romania region exists with RON currency", async () => {
    const res = await fetch(`${BASE_URL}/admin/regions`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    const romania = body.regions?.find(
      (r: { name: string }) => r.name === "Romania"
    )
    expect(romania).toBeDefined()
    expect(romania.currency_code).toBe("ron")
  })

  it("6 product categories exist", async () => {
    const res = await fetch(`${BASE_URL}/admin/product-categories`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    const expectedCategories = [
      "Lansete",
      "Mulinete",
      "Fire",
      "Carlige",
      "Accesorii",
      "Boilies & Momeli",
    ]
    for (const name of expectedCategories) {
      const found = body.product_categories?.find(
        (c: { name: string }) => c.name === name
      )
      expect(found).toBeDefined()
    }
  })

  it("Lanseta Crap Pro 3.6m product exists with 3 variants", async () => {
    const res = await fetch(
      `${BASE_URL}/admin/products?title=Lanseta+Crap+Pro+3.6m`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.products?.length).toBeGreaterThan(0)
    const product = body.products[0]
    expect(product.variants?.length).toBe(3)
  })

  it("Mulineta Crap Elite 6000 product exists with 2 variants", async () => {
    const res = await fetch(
      `${BASE_URL}/admin/products?title=Mulineta+Crap+Elite+6000`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.products?.length).toBeGreaterThan(0)
    const product = body.products[0]
    expect(product.variants?.length).toBe(2)
  })

  it("Magazin Online sales channel exists", async () => {
    const res = await fetch(`${BASE_URL}/admin/sales-channels`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    const channel = body.sales_channels?.find(
      (c: { name: string }) => c.name === "Magazin Online"
    )
    expect(channel).toBeDefined()
  })
})
