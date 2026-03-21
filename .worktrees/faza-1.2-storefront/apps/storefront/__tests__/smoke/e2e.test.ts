/**
 * Smoke tests — run against dev server (http://localhost:3000)
 * Coverage: happy path flows across all major features
 * Command: pnpm test:smoke
 */

const BASE_URL = "http://localhost:3000"

describe("Smoke tests — Full storefront flow", () => {
  test("Homepage loads with 200 status", async () => {
    const res = await fetch(`${BASE_URL}/`)
    expect(res.status).toBe(200)
    const html = await res.text()
    expect(html).toContain("FirIntins")
  })

  test("Produse listing page loads", async () => {
    const res = await fetch(`${BASE_URL}/produse`)
    expect(res.status).toBe(200)
    const html = await res.text()
    expect(html).toContain("Produse")
  })

  test("PDP resolves for known product", async () => {
    const res = await fetch(`${BASE_URL}/produse/lanseta-crap-pro-36m`)
    expect(res.status).toBe(200)
    const html = await res.text()
    expect(html).toContain("lanseta")
  })

  test("Sitemap returns valid XML", async () => {
    const res = await fetch(`${BASE_URL}/sitemap.xml`)
    expect(res.status).toBe(200)
    expect(res.headers.get("content-type")).toContain("application/xml")
    const xml = await res.text()
    expect(xml).toContain("<urlset")
  })

  test("Robots.txt returns rules", async () => {
    const res = await fetch(`${BASE_URL}/robots.txt`)
    expect(res.status).toBe(200)
    const txt = await res.text()
    expect(txt).toContain("disallow")
  })

  test("404 page displays for invalid route", async () => {
    const res = await fetch(`${BASE_URL}/nonexistent-page`)
    expect(res.status).toBe(404)
    const html = await res.text()
    expect(html).toContain("404")
  })

  test("Newsletter API accepts POST", async () => {
    const res = await fetch(`${BASE_URL}/api/newsletter`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@example.com" }),
    })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
  })

  test("Login page renders", async () => {
    const res = await fetch(`${BASE_URL}/login`)
    expect(res.status).toBe(200)
    const html = await res.text()
    expect(html).toContain("Conectare")
  })

  test("Register page renders", async () => {
    const res = await fetch(`${BASE_URL}/register`)
    expect(res.status).toBe(200)
    const html = await res.text()
    expect(html).toContain("Înregistrare")
  })

  test("/cont redirects to login when not authenticated", async () => {
    const res = await fetch(`${BASE_URL}/cont`, { redirect: "manual" })
    expect([307, 308, 401]).toContain(res.status)
  })
})
