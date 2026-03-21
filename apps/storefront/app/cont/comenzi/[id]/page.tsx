import { cookies } from "next/headers"
import Link from "next/link"
import { notFound } from "next/navigation"
import { medusa } from "@/lib/medusa/client"
import { AccountNav } from "@/components/account/account-nav"
import { OrderDetail } from "@/components/account/order-detail"
import { Button } from "@/components/ui/button"

interface OrderDetailPageProps {
  params: Promise<{ id: string }>
}

export const revalidate = 0

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params
  const cookieStore = await cookies()
  const token = cookieStore.get("_medusa_jwt")?.value

  if (!token) return null

  try {
    const { order } = await medusa.store.order.retrieve(id, undefined, {
      Authorization: `Bearer ${token}`,
    })

    return (
      <>
        <AccountNav />
        <div className="space-y-6">
          <Link href="/cont/comenzi">
            <Button variant="outline" className="border-border">
              ← Înapoi la comenzi
            </Button>
          </Link>
          <OrderDetail order={order} />
        </div>
      </>
    )
  } catch {
    notFound()
  }
}
