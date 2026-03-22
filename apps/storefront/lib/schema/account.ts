import { z } from "zod"

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(8, "Parola trebuie să aibă cel puțin 8 caractere"),
    newPassword: z.string().min(8, "Parola trebuie să aibă cel puțin 8 caractere"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Parolele nu coincid",
    path: ["confirmPassword"],
  })

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>

export const profileSchema = z.object({
  firstName: z.string().min(1, "Prenumele este obligatoriu"),
  lastName: z.string().min(1, "Numele este obligatoriu"),
  email: z.string().email("Adresa de email nu este validă"),
})

export type ProfileInput = z.infer<typeof profileSchema>

export const passwordSchema = z
  .object({
    password: z.string().min(8, "Parola trebuie să aibă cel puțin 8 caractere"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Parolele nu coincid",
    path: ["confirmPassword"],
  })

export type PasswordInput = z.infer<typeof passwordSchema>

export const addressSchema = z.object({
  firstName: z.string().min(1, "Prenumele este obligatoriu"),
  lastName: z.string().min(1, "Numele este obligatoriu"),
  address1: z.string().min(1, "Adresa este obligatorie"),
  address2: z.string().optional(),
  city: z.string().min(1, "Orașului este obligatoriu"),
  province: z.string().min(1, "Județului este obligatoriu"),
  postalCode: z.string().min(1, "Codul poștal este obligatoriu"),
  countryCode: z.string().min(2, "Țara este obligatorie"),
  phone: z.string().optional(),
})

export type AddressInput = z.infer<typeof addressSchema>
