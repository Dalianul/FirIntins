"use server"

import { cookies } from "next/headers"
import { medusa } from "@/lib/medusa/client"
import { AddToWishlistSchema } from "@/lib/schema/wishlist"

function getAuthHeader(token: string) {
  return { Authorization: `Bearer ${token}` }
}

export async function getWishlistAction() {
  const cookieStore = await cookies()
  const token = cookieStore.get("_medusa_jwt")?.value

  if (!token) return { wishlist: null }

  try {
    const data = await medusa.client.fetch<{ wishlist: any }>("/store/wishlists", {
      headers: getAuthHeader(token),
    })
    return { wishlist: data.wishlist }
  } catch {
    return { wishlist: null }
  }
}

export async function addToWishlistAction(input: { product_id: string; variant_id?: string }) {
  const parsed = AddToWishlistSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Date invalide" }
  }

  const cookieStore = await cookies()
  const token = cookieStore.get("_medusa_jwt")?.value
  if (!token) return { success: false, error: "Trebuie să fii autentificat" }

  try {
    const data = await medusa.client.fetch<{ item: any }>("/store/wishlists/items", {
      method: "POST",
      body: parsed.data,
      headers: getAuthHeader(token),
    })
    return { success: true, item: data.item }
  } catch {
    return { success: false, error: "Nu am putut adăuga produsul la lista de dorinte" }
  }
}

export async function removeFromWishlistAction(itemId: string) {
  const cookieStore = await cookies()
  const token = cookieStore.get("_medusa_jwt")?.value
  if (!token) return { success: false, error: "Trebuie să fii autentificat" }

  try {
    await medusa.client.fetch(`/store/wishlists/items/${itemId}`, {
      method: "DELETE",
      headers: getAuthHeader(token),
    })
    return { success: true }
  } catch {
    return { success: false, error: "Nu am putut șterge produsul din lista de dorinte" }
  }
}
