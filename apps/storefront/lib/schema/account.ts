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
