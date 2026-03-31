import { cookies } from "next/headers"
import { CheckoutClient } from "@/components/checkout/checkout-client"

export default async function CheckoutPage() {
  const cookieStore = await cookies()
  const isGuest = !cookieStore.get("_medusa_jwt")?.value
  return <CheckoutClient isGuest={isGuest} />
}
