import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { medusa } from "@/lib/medusa/client"
import { ProfileForm } from "./profile-form"

export const revalidate = 0

export default async function ProfilePage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("_medusa_jwt")?.value

  if (!token) redirect("/autentificare")

  try {
    const { customer } = await medusa.store.customer.retrieve(undefined, {
      Authorization: `Bearer ${token}`,
    })

    return (
      <div className="space-y-6">
        <div>
          <h2 className="font-cormorant text-3xl text-cream mb-1">Profilul meu</h2>
          <p className="text-fog text-sm">Actualizează informațiile contului tău.</p>
        </div>
        <div className="bg-surface-2 rounded p-6">
          <ProfileForm customer={customer} />
        </div>
      </div>
    )
  } catch {
    redirect("/autentificare")
  }
}
