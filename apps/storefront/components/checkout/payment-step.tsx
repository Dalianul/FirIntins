"use client"

import { useState } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { completeCheckoutAction } from "@/actions/checkout"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "")

interface PaymentStepProps {
  cartId: string
  clientSecret: string
  onSuccess: (orderId: string) => void
  onBack: () => void
}

function PaymentForm({
  cartId,
  onSuccess,
  onBack,
}: Omit<PaymentStepProps, "clientSecret">) {
  const stripe = useStripe()
  const elements = useElements()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setLoading(true)

    try {
      const result = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      })

      if (result.error) {
        toast({
          title: "Eroare plată",
          description: result.error.message,
          variant: "destructive",
        })
        return
      }

      const checkoutResult = await completeCheckoutAction(cartId)
      if (checkoutResult.success) {
        onSuccess(checkoutResult.orderId)
      } else {
        toast({
          title: "Eroare",
          description: checkoutResult.error ?? "Nu am putut finaliza comanda",
          variant: "destructive",
        })
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "A apărut o problemă"
      toast({ title: "Eroare", description: message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="font-outfit font-medium text-cream text-xl">Plată</h2>
      <PaymentElement />
      <div className="flex gap-4">
        <Button type="button" variant="outline" className="flex-1 border-border text-cream" onClick={onBack}>
          Înapoi
        </Button>
        <Button type="submit" disabled={!stripe || loading} className="flex-1 bg-moss hover:bg-moss-light">
          {loading ? "Se procesează..." : "Finalizează plata"}
        </Button>
      </div>
    </form>
  )
}

export function PaymentStep({ cartId, clientSecret, onSuccess, onBack }: PaymentStepProps) {
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <PaymentForm cartId={cartId} onSuccess={onSuccess} onBack={onBack} />
    </Elements>
  )
}
