import { z } from "zod"

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(8, "Parola trebuie să aibă minim 8 caractere"),
    newPassword: z.string().min(8, "Parola nouă trebuie să aibă minim 8 caractere"),
    confirmPassword: z.string().min(8, "Confirmarea parolei trebuie să aibă minim 8 caractere"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Parolele nu coincid",
    path: ["confirmPassword"],
  })

export type ChangePassword = z.infer<typeof changePasswordSchema>
