import { z } from "zod"

export const addressSchema = z.object({
  firstName: z.string().min(1, "Prenumele este obligatoriu"),
  lastName: z.string().min(1, "Numele este obligatoriu"),
  address1: z.string().min(1, "Adresa este obligatorie"),
  address2: z.string().optional(),
  city: z.string().min(1, "Orașul este obligatoriu"),
  province: z.string().optional(),
  postalCode: z.string().min(1, "Codul poștal este obligatoriu"),
  countryCode: z.literal("ro"),
  phone: z.string().optional(),
})

export type Address = z.infer<typeof addressSchema>
