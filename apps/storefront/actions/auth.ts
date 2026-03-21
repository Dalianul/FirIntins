"use server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { medusa } from "@/lib/medusa/client"
import { loginSchema, registerSchema, type LoginInput, type RegisterInput } from "@/lib/schema/auth"

export async function loginAction(input: LoginInput) {
  try {
    const validated = loginSchema.parse(input)
    const result = await medusa.auth.login("customer", "emailpass", {
      email: validated.email,
      password: validated.password,
    })

    // Handle token response - could be string or object with token property
    const token = typeof result === "string" ? result : (result as any)?.token || result

    const cookieStore = await cookies()
    cookieStore.set("_medusa_jwt", String(token), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })
    return { success: true }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Login failed"
    return { success: false, error: message }
  }
}

export async function registerAction(input: RegisterInput) {
  try {
    const validated = registerSchema.parse(input)
    const result = await medusa.auth.register("customer", "emailpass", {
      email: validated.email,
      password: validated.password,
      first_name: validated.firstName,
      last_name: validated.lastName,
    })

    // Handle token response - could be string or object with token property
    const token = typeof result === "string" ? result : (result as any)?.token || result

    const cookieStore = await cookies()
    cookieStore.set("_medusa_jwt", String(token), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })
    return { success: true }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Registration failed"
    return { success: false, error: message }
  }
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete("_medusa_jwt")
  redirect("/")
}
