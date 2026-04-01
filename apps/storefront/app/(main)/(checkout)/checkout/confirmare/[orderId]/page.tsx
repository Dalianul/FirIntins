import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { medusa } from "@/lib/medusa/client"
import { ConfirmationDisplay } from "@/components/checkout/confirmation-display"
import { PurchaseTracker } from "@/components/analytics/purchase-tracker"
import { Button } from "@/components/ui/button"
import type { GA4Item } from "@/lib/analytics"

export const metadata: Metadata = {
  title: "Comandă confirmată | Fir Intins",
  robots: { index: false },
}

interface ConfirmationPageProps {
  params: Promise<{ orderId: string }>
}

export default async function ConfirmationPage({ params }: ConfirmationPageProps) {
  const { orderId } = await params

  try {
    const { order } = await medusa.store.order.retrieve(orderId)

    const trackerItems: GA4Item[] = order.items?.map((item: any) => ({
      item_id: item.variant_id,
      item_name: item.product_title,
      item_variant: item.variant_title ?? undefined,
      price: item.unit_price / 100,
      quantity: item.quantity,
    })) ?? []

    return (
      <main className="min-h-screen py-12 bg-bg">
        <div className="max-w-2xl mx-auto px-4">
          <PurchaseTracker orderId={order.id} total={order.total ?? 0} items={trackerItems} />
          <ConfirmationDisplay order={order} />

          {(order as any).metadata?.cui && (
            <div className="mt-4 text-center">
              <p className="text-sm text-fog">
                Cod fiscal: {(order as any).metadata.cui}
              </p>
            </div>
          )}

          <div className="mt-12 flex justify-center">
            <Link href="/produse">
              <Button className="bg-moss hover:opacity-90 text-white">
                Înapoi la magazin
              </Button>
            </Link>
          </div>
        </div>
      </main>
    )
  } catch {
    notFound()
  }
}
