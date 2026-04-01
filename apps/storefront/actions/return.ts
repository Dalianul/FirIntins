"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export interface ReturnFormData {
  items: Array<{ line_item_id: string; quantity: number; reason?: string }>
  reason: string
}

export async function requestReturn(orderId: string, data: ReturnFormData) {
  const cookieStore = await cookies()
  const token = cookieStore.get("_medusa_jwt")?.value
  if (!token) redirect("/login")

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/orders/${orderId}/return`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "x-publishable-api-key":
          process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY!,
      },
      body: JSON.stringify(data),
    }
  )

  if (!response.ok) {
    const error = await response.json()
    return {
      success: false,
      error: error.message ?? "Eroare la trimiterea cererii",
    }
  }

  return { success: true }
}
