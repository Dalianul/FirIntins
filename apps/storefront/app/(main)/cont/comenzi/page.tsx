import { cookies } from "next/headers"
import { medusa } from "@/lib/medusa/client"
import { AccountNav } from "@/components/account/account-nav"
import { OrderCard } from "@/components/account/order-card"

export default async function OrdersPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("_medusa_jwt")?.value

  if (!token) return null

  try {
    const { orders } = await medusa.store.order.list(
      { limit: 20 },
      { Authorization: `Bearer ${token}` }
    )

    return (
      <>
        <AccountNav />
        <div>
          <h2 className="font-outfit font-medium text-cream text-xl mb-6">
            Comenzile mele
          </h2>
          {(orders ?? []).length === 0 ? (
            <p className="text-fog">Nu ai nicio comandă încă.</p>
          ) : (
            <div className="space-y-4">
              {(orders ?? []).map((order: any) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>
      </>
    )
  } catch {
    return <div className="text-fog">Nu am putut încărca comenzile.</div>
  }
}
