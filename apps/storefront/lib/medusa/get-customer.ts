import { cookies } from "next/headers"
import { medusa } from "./client"

export async function getCustomer() {
  const token = (await cookies()).get("_medusa_jwt")?.value
  if (!token) return null
  try {
    medusa.client.setToken(token)
    const { customer } = await medusa.store.customer.retrieve()
    return customer
  } catch {
    return null
  }
}
