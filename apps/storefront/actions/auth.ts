"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { z } from "zod"
import { medusa } from "@/lib/medusa/client"

const loginSchema = z.object({
  email: z.string().email("Email invalid"),
  password: z.string().min(8, "Parola trebuie să aibă minimum 8 caractere"),
})

const registerSchema = z
  .object({
    firstName: z.string().min(1, "Prenumele este obligatoriu"),
    lastName: z.string().min(1, "Numele de familie este obligatoriu"),
    email: z.string().email("Email invalid"),
    password: z.string().min(8, "Parola trebuie să aibă minimum 8 caractere"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Parolele nu coincid",
    path: ["confirmPassword"],
  })

async function setCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set("_medusa_jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  })
}

export async function loginAction(
  email: string,
  password: string,
  redirectUrl?: string
) {
  try {
    const parsed = loginSchema.parse({ email, password })
    const result = await medusa.auth.login("customer", "emailpass", {
      email: parsed.email,
      password: parsed.password,
    })

    // Handle third-party auth (redirect needed)
    if (typeof result === "object") {
      return { errors: { _form: ["Third-party authentication redirect"] } }
    }

    // result is the JWT token string
    await setCookie(result)

    // Validate redirect URL
    const finalRedirect = redirectUrl?.startsWith("/") ? redirectUrl : "/cont"
    redirect(finalRedirect)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { errors: error.flatten().fieldErrors }
    }
    throw error
  }
}

export async function registerAction(
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  confirmPassword: string,
  redirectUrl?: string
) {
  try {
    const parsed = registerSchema.parse({
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
    })

    // Register via Medusa auth — returns the JWT token string
    const token = await medusa.auth.register("customer", "emailpass", {
      email: parsed.email,
      password: parsed.password,
      first_name: parsed.firstName,
      last_name: parsed.lastName,
    })

    await setCookie(token)

    const finalRedirect = redirectUrl?.startsWith("/") ? redirectUrl : "/cont"
    redirect(finalRedirect)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { errors: error.flatten().fieldErrors }
    }
    throw error
  }
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete("_medusa_jwt")
  // Clear cart ID from localStorage happens client-side on redirect
  redirect("/")
}
