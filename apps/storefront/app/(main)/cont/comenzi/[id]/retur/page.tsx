import { cookies } from "next/headers"
import { notFound, redirect } from "next/navigation"
import { medusa } from "@/lib/medusa/client"
import { ReturnForm } from "@/components/account/return-form"
import { AccountNav } from "@/components/account/account-nav"

interface ReturnPageProps {
  params: Promise<{ id: string }>
}

export default async function ReturnPage({ params }: ReturnPageProps) {
  const { id } = await params
  const cookieStore = await cookies()
  const token = cookieStore.get("_medusa_jwt")?.value

  if (!token) redirect("/login")

  let order: any
  try {
    const result = await (medusa.store.order.retrieve as Function)(
      id,
      {},
      { Authorization: `Bearer ${token}` }
    )
    order = result.order
  } catch {
    notFound()
  }

  // Guard: only completed orders within 14-day window
  const diffDays =
    (Date.now() - new Date(order.created_at).getTime()) / (1000 * 60 * 60 * 24)
  if (order.status !== "completed" || diffDays > 14) {
    redirect(`/cont/comenzi/${id}`)
  }

  return (
    <>
      <AccountNav />
      <ReturnForm order={order} />
    </>
  )
}
