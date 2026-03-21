import Medusa from "@medusajs/js-sdk"

const baseUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

if (!baseUrl || !publishableKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_MEDUSA_BACKEND_URL or NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY in .env.local"
  )
}

export const medusa = new Medusa({
  baseUrl,
  publishableKey,
})
