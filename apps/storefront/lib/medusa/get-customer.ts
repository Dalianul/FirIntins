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
  } catch (error) {
    // Only suppress authentication errors (token expired, invalid)
    if (
      error instanceof Error &&
      (error.message.includes("401") || error.message.includes("Unauthorized"))
    ) {
      return null
    }
    // Re-throw unexpected errors
    throw error
  }
}
