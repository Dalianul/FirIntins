"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { medusa } from "@/lib/medusa/client"
import { profileSchema, addressSchema, passwordSchema } from "@/lib/schema/account"

async function getAuthHeader() {
  const cookieStore = await cookies()
  const token = cookieStore.get("_medusa_jwt")?.value
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete("_medusa_jwt")
  return { success: true }
}

export async function updateProfileAction(_prevState: unknown, formData: FormData) {
  const raw = {
    firstName: formData.get("firstName") as string,
    lastName: formData.get("lastName") as string,
    email: formData.get("email") as string,
  }

  const parsed = profileSchema.safeParse(raw)
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors
    return { success: false, fieldErrors }
  }

  try {
    const auth = await getAuthHeader()
    await (medusa.store.customer.update as Function)(
      {
        first_name: parsed.data.firstName,
        last_name: parsed.data.lastName,
        email: parsed.data.email,
      },
      auth
    )
    revalidatePath("/cont/profil")
    return { success: true }
  } catch {
    return { success: false, error: "Nu am putut actualiza profilul. Încearcă din nou." }
  }
}

export async function updatePasswordAction(_prevState: unknown, formData: FormData) {
  const raw = {
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  }

  const parsed = passwordSchema.safeParse(raw)
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors
    return { success: false, fieldErrors }
  }

  try {
    const auth = await getAuthHeader()
    await (medusa.store.customer.update as Function)({ password: parsed.data.password }, auth)
    revalidatePath("/cont/securitate")
    return { success: true }
  } catch {
    return { success: false, error: "Nu am putut actualiza parola. Încearcă din nou." }
  }
}

export async function addAddressAction(_prevState: unknown, formData: FormData) {
  const raw = {
    firstName: formData.get("firstName") as string,
    lastName: formData.get("lastName") as string,
    address1: formData.get("address1") as string,
    address2: (formData.get("address2") as string) || undefined,
    city: formData.get("city") as string,
    province: formData.get("province") as string,
    postalCode: formData.get("postalCode") as string,
    countryCode: formData.get("countryCode") as string,
    phone: (formData.get("phone") as string) || undefined,
  }

  const parsed = addressSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors }
  }

  try {
    const auth = await getAuthHeader()
    await (medusa.store.customer.createAddress as Function)(
      {
        first_name: parsed.data.firstName,
        last_name: parsed.data.lastName,
        address_1: parsed.data.address1,
        address_2: parsed.data.address2,
        city: parsed.data.city,
        province: parsed.data.province,
        postal_code: parsed.data.postalCode,
        country_code: parsed.data.countryCode,
        phone: parsed.data.phone,
      },
      auth
    )
    revalidatePath("/cont/adrese")
    return { success: true }
  } catch {
    return { success: false, error: "Nu am putut adăuga adresa. Încearcă din nou." }
  }
}

export async function updateAddressAction(_prevState: unknown, formData: FormData) {
  const addressId = formData.get("addressId") as string
  const raw = {
    firstName: formData.get("firstName") as string,
    lastName: formData.get("lastName") as string,
    address1: formData.get("address1") as string,
    address2: (formData.get("address2") as string) || undefined,
    city: formData.get("city") as string,
    province: formData.get("province") as string,
    postalCode: formData.get("postalCode") as string,
    countryCode: formData.get("countryCode") as string,
    phone: (formData.get("phone") as string) || undefined,
  }

  const parsed = addressSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors }
  }

  try {
    const auth = await getAuthHeader()
    await (medusa.store.customer.updateAddress as Function)(
      addressId,
      {
        first_name: parsed.data.firstName,
        last_name: parsed.data.lastName,
        address_1: parsed.data.address1,
        address_2: parsed.data.address2,
        city: parsed.data.city,
        province: parsed.data.province,
        postal_code: parsed.data.postalCode,
        country_code: parsed.data.countryCode,
        phone: parsed.data.phone,
      },
      auth
    )
    revalidatePath("/cont/adrese")
    return { success: true }
  } catch {
    return { success: false, error: "Nu am putut actualiza adresa. Încearcă din nou." }
  }
}

export async function deleteAddressAction(_prevState: unknown, formData: FormData) {
  const addressId = formData.get("addressId") as string
  try {
    const auth = await getAuthHeader()
    await (medusa.store.customer as any).deleteAddress(addressId, auth)
    revalidatePath("/cont/adrese")
    return { success: true }
  } catch {
    return { success: false, error: "Nu am putut șterge adresa. Încearcă din nou." }
  }
}

export async function setDefaultAddressAction(_prevState: unknown, formData: FormData) {
  const addressId = formData.get("addressId") as string
  try {
    const auth = await getAuthHeader()
    await (medusa.store.customer.updateAddress as Function)(
      addressId,
      { is_default_shipping: true },
      auth
    )
    revalidatePath("/cont/adrese")
    return { success: true }
  } catch {
    return { success: false, error: "Nu am putut seta adresa implicită. Încearcă din nou." }
  }
}
