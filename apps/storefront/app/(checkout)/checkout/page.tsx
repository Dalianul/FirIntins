"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/hooks/use-cart"
import { useToast } from "@/hooks/use-toast"
import { AddressStep } from "@/components/checkout/address-step"
import { ShippingStep } from "@/components/checkout/shipping-step"
import { PaymentStep } from "@/components/checkout/payment-step"
import { OrderSummary } from "@/components/checkout/order-summary"
import { initiatePaymentAction } from "@/actions/checkout"

type CheckoutStep = "address" | "shipping" | "payment"

const STEPS: CheckoutStep[] = ["address", "shipping", "payment"]

export default function CheckoutPage() {
  const router = useRouter()
  const { cart } = useCart()
  const { toast } = useToast()
  const cartId = cart?.id ?? ""
  const [step, setStep] = useState<CheckoutStep>("address")
  const [clientSecret, setClientSecret] = useState<string>("")
  const [loadingPayment, setLoadingPayment] = useState(false)

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Progress indicator */}
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
