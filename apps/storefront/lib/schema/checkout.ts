import { z } from "zod"

export const addressSchema = z.object({
  firstName: z.string().min(1, "Prenumele este obligatoriu"),
  lastName: z.string().min(1, "Numele este obligatoriu"),
  address1: z.string().min(1, "Adresa este obligatorie"),
  city: z.string().min(1, "Populația este obligatorie"),
  postalCode: z.string().min(1, "Codul poștal este obligatoriu"),
  countryCode: z.literal("ro"),
  phone: z.string().optional(),
  cui: z.string().optional(),
})

export const paymentSchema = z.object({
  cardholderName: z.string().min(1, "Numele titularului este obligatoriu"),
})

export const promoCodeSchema = z.object({
  code: z.string().min(1, "Codul promoțional este obligatoriu").trim(),
})

export type AddressInput = z.infer<typeof addressSchema>
export type PaymentInput = z.infer<typeof paymentSchema>
export type PromoCodeInput = z.infer<typeof promoCodeSchema>
