"use server"

import { cookies } from "next/headers"
import { medusa } from "@/lib/medusa/client"
import { CreateReviewSchema, type CreateReviewInput } from "@/lib/schema/review"

function getAuthHeader(token: string) {
  return { Authorization: `Bearer ${token}` }
}

type Review = {
  id: string
  product_id: string
  customer_id: string
  rating: number
  title: string
  body: string
  status: string
  admin_reply?: string | null
  created_at: string
}

export async function getProductReviewsAction(productId: string) {
  try {
    const data = await medusa.client.fetch<{ reviews: Review[]; count: number }>(
      `/store/products/${productId}/reviews`,
      { method: "GET" }
    )
    return { reviews: data.reviews, count: data.count }
  } catch {
    return { reviews: [], count: 0 }
  }
}

export async function createReviewAction(
  productId: string,
  input: CreateReviewInput
) {
  const parsed = CreateReviewSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0]?.message ?? "Date invalide" }
  }

  const cookieStore = await cookies()
  const token = cookieStore.get("_medusa_jwt")?.value
  if (!token) {
    return { success: false as const, error: "Trebuie să fii autentificat pentru a lăsa o recenzie" }
  }

  try {
    const data = await medusa.client.fetch<{ review: Review }>(
      `/store/products/${productId}/reviews`,
      {
        method: "POST",
        body: parsed.data,
        headers: getAuthHeader(token),
      }
    )
    return { success: true as const, review: data.review }
  } catch {
    return { success: false as const, error: "Nu am putut trimite recenzia. Încearcă din nou." }
  }
}
