import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { medusa } from "@/lib/medusa/client"
import { ConfirmationDisplay } from "@/components/checkout/confirmation-display"
import { Button } from "@/components/ui/button"

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

    return (
      <main className="min-h-screen py-12" style={{ backgroundColor: "var(--color-bg)" }}>
        <div className="max-w-2xl mx-auto px-4">
          <ConfirmationDisplay order={order} />

          <div className="mt-12 flex justify-center">
            <Link href="/produse">
              <Button style={{ backgroundColor: "var(--color-moss)" }} className="hover:opacity-90 text-white">
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
