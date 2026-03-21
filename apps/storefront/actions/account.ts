"use server"

import { cookies } from "next/headers"

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete("_medusa_jwt")
  return { success: true }
}
