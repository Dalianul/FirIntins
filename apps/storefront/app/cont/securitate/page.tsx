import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { PasswordForm } from "./password-form"

export const revalidate = 0

export default async function SecurityPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("_medusa_jwt")?.value

  if (!token) redirect("/autentificare")

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-cormorant text-3xl text-cream mb-1">Securitate</h2>
        <p className="text-fog text-sm">Actualizează parola contului tău.</p>
      </div>
      <div className="bg-surface-2 rounded p-6">
        <PasswordForm />
      </div>
    </div>
  )
}
