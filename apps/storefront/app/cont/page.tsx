import { cookies } from "next/headers"
import Link from "next/link"
import { medusa } from "@/lib/medusa/client"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/utils"

export default async function AccountPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("_medusa_jwt")?.value

  if (!token) {
    return null
  }

  try {
    const { customer } = await medusa.store.customer.retrieve(undefined, {
      Authorization: `Bearer ${token}`,
    })

    const { orders } = await medusa.store.order.list(
      { limit: 1 },
      { Authorization: `Bearer ${token}` }
    )

    const lastOrder = orders?.[0]

    return (
      <div className="space-y-8">
        <div className="bg-surface-2 rounded p-6">
          <h2 className="font-outfit font-medium text-cream text-xl">
            Salut, {customer.first_name}!
          </h2>
          <p className="text-fog mt-2">{customer.email}</p>
        </div>

        {lastOrder && (
          <div>
            <h2 className="font-outfit font-medium text-cream text-xl mb-4">
              Comandă recentă
            </h2>
            <div className="bg-surface-2 rounded p-6">
              <p className="text-fog text-sm mb-2">
                {new Date(lastOrder.created_at).toLocaleDateString("ro-RO")}
              </p>
              <p className="text-mud font-cormorant text-2xl mb-4">
                {formatPrice(lastOrder.total ?? 0)}
              </p>
              <Link href={`/cont/comenzi/${lastOrder.id}`}>
                <Button className="bg-moss hover:bg-moss-light">
                  Vezi detalii
                </Button>
              </Link>
            </div>
          </div>
        )}

        <Link href="/cont/comenzi">
          <Button variant="outline" className="border-border">
            Comenzile mele
          </Button>
        </Link>
      </div>
    )
  } catch {
    return <div className="text-fog">Nu am putut încărca datele contului.</div>
  }
}
