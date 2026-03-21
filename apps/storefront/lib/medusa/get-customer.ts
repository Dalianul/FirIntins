import { cookies } from "next/headers"
import { medusa } from "./client"

export async function getCustomer() {
  const token = (await cookies()).get("_medusa_jwt")?.value
  if (!token) return null
  try {
    const { customer } = await medusa.store.customer.retrieve(
      undefined,
      {
        Authorization: `Bearer ${token}`,
      }
    )
    return customer
  } catch {
    return null
  }
}
