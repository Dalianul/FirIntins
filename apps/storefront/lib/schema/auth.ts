import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Email invalid"),
  password: z.string().min(8, "Parola trebuie să aibă cel puțin 8 caractere"),
})

export const registerSchema = z
  .object({
    email: z.string().email("Email invalid"),
    firstName: z.string().min(1, "Prenumele este obligatoriu"),
    lastName: z.string().min(1, "Numele este obligatoriu"),
    password: z.string().min(8, "Parola trebuie să aibă cel puțin 8 caractere"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Parolele nu coincid",
    path: ["confirmPassword"],
  })

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
