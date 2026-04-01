"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useCart } from "@/hooks/use-cart"
import { useToast } from "@/hooks/use-toast"
import { trackBeginCheckout } from "@/lib/analytics"
import { AddressStep } from "@/components/checkout/address-step"
import { ShippingStep } from "@/components/checkout/shipping-step"
import { PaymentStep } from "@/components/checkout/payment-step"
import { OrderSummary } from "@/components/checkout/order-summary"
import { initiatePaymentAction } from "@/actions/checkout"

type CheckoutStep = "address" | "shipping" | "payment"

const STEPS: CheckoutStep[] = ["address", "shipping", "payment"]

interface CheckoutClientProps {
  isGuest: boolean
}

export function CheckoutClient({ isGuest }: CheckoutClientProps) {
  const router = useRouter()
  const { cart } = useCart()
  const { toast } = useToast()
  const cartId = cart?.id ?? ""
  const [step, setStep] = useState<CheckoutStep>("address")
  const [clientSecret, setClientSecret] = useState<string>("")
  const [loadingPayment, setLoadingPayment] = useState(false)
  const checkoutTracked = useRef(false)

  useEffect(() => {
    if (!cartId) {
      router.push("/cos")
    }
  }, [cartId, router])

  useEffect(() => {
    if (cart && !checkoutTracked.current) {
      checkoutTracked.current = true
      trackBeginCheckout(cart)
    }
  }, [cart])

  if (!cartId) {
    return (
      <main className="bg-bg min-h-screen flex items-center justify-center">
        <p className="text-fog">Coșul este gol...</p>
      </main>
    )
  }

  const handleShippingNext = async () => {
    setStep("payment")
    if (!clientSecret) {
      setLoadingPayment(true)
      try {
        const result = await initiatePaymentAction(cartId)
        if (result.success) {
          setClientSecret(result.clientSecret)
        } else {
          toast({
            title: "Eroare",
            description: result.error,
            variant: "destructive",
          })
          setStep("shipping")
        }
      } finally {
        setLoadingPayment(false)
      }
    }
  }

  const handleSuccess = (orderId: string) => {
    router.push(`/checkout/confirmare/${orderId}`)
  }

  const stepIndex = STEPS.indexOf(step)

  return (
    <main className="bg-bg min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4">
        {isGuest && (
          <div className="mb-6 flex items-center justify-between bg-[--color-surface] border border-[--color-border] rounded px-4 py-3 text-sm">
            <span className="text-fog">Checkout rapid fără cont</span>
            <Link
              href={`/login?redirect=/checkout`}
              className="text-[--color-moss] hover:text-[--color-moss-light] transition-colors"
            >
              Intră în cont
            </Link>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex gap-2 mb-8">
              {STEPS.map((s, i) => (
                <div
                  key={s}
                  className={`flex-1 h-1 rounded ${i <= stepIndex ? "bg-moss" : "bg-border"}`}
                />
              ))}
            </div>

            {step === "address" && (
              <AddressStep cartId={cartId} onNext={() => setStep("shipping")} />
            )}

            {step === "shipping" && (
              <ShippingStep
                cartId={cartId}
                onNext={handleShippingNext}
                onBack={() => setStep("address")}
              />
            )}

            {step === "payment" && !loadingPayment && clientSecret && (
              <PaymentStep
                cartId={cartId}
                clientSecret={clientSecret}
                onSuccess={handleSuccess}
                onBack={() => setStep("shipping")}
              />
            )}

            {loadingPayment && (
              <div className="text-center text-fog py-12">
                Se încarcă formularul de plată...
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <OrderSummary cart={cart} />
          </div>
        </div>
      </div>
    </main>
  )
}
